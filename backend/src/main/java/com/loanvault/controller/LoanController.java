package com.loanvault.controller;

import com.loanvault.entity.Loan;
import com.loanvault.entity.LoanApplication;
import com.loanvault.entity.User;
import com.loanvault.repository.LoanApplicationRepository;
import com.loanvault.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * ============================================================
 * LOAN CONTROLLER (Active / Disbursed Loans)
 * Returns active loans, balances, and dashboard metrics for borrowers.
 * ============================================================
 */
@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanRepository loanRepository;
    private final LoanApplicationRepository applicationRepository;

    private static final List<LoanApplication.Status> APPROVED_STATUSES = List.of(
        LoanApplication.Status.APPROVED,
        LoanApplication.Status.DISBURSEMENT_PENDING,
        LoanApplication.Status.DISBURSED
    );

    /**
     * Get active loans owned by current logged-in borrower.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('BORROWER')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Loan>> getMyLoans(
        @AuthenticationPrincipal User currentUser
    ) {
        List<Loan> existingLoans = loanRepository.findByBorrowerOrderByCreatedAtDesc(currentUser);

        if (!existingLoans.isEmpty()) {
            return ResponseEntity.ok(existingLoans);
        }

        // Fallback: Construct active loan DTOs directly from approved applications
        List<LoanApplication> approvedApps = applicationRepository.findByBorrowerAndStatusInOrderByAppliedAtDesc(
            currentUser, APPROVED_STATUSES
        );

        List<Loan> constructedLoans = new ArrayList<>();
        for (LoanApplication app : approvedApps) {
            BigDecimal P = app.getLoanAmount();
            double annualRate = app.getInterestRate() != null ? app.getInterestRate().doubleValue() : 10.5;
            double r = annualRate / 12.0 / 100.0;
            int N = app.getTenureMonths() != null ? app.getTenureMonths() : 12;

            double emiDouble = (P.doubleValue() * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
            BigDecimal emiAmount = BigDecimal.valueOf(emiDouble).setScale(2, RoundingMode.HALF_UP);

            Loan tempLoan = Loan.builder()
                .id(app.getId())
                .loanAccountNumber("LN-" + app.getReferenceId())
                .borrower(currentUser)
                .application(app)
                .loanType(app.getLoanType())
                .sanctionedAmount(app.getLoanAmount())
                .outstandingPrincipal(app.getLoanAmount())
                .interestRate(app.getInterestRate() != null ? app.getInterestRate() : BigDecimal.valueOf(10.5))
                .tenureMonths(app.getTenureMonths())
                .emiAmount(emiAmount)
                .disbursementDate(LocalDate.now())
                .nextEmiDate(LocalDate.now().plusMonths(1))
                .emisPaid(0)
                .emisRemaining(N)
                .status(Loan.LoanStatus.ACTIVE)
                .build();

            constructedLoans.add(tempLoan);
        }

        return ResponseEntity.ok(constructedLoans);
    }

    /**
     * Get summary metrics for borrower dashboard (Total active loans, outstanding, monthly outflow).
     */
    @GetMapping("/summary")
    @PreAuthorize("hasRole('BORROWER')")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getBorrowerSummary(
        @AuthenticationPrincipal User currentUser
    ) {
        List<Loan> existingLoans = loanRepository.findByBorrowerOrderByCreatedAtDesc(currentUser);

        if (!existingLoans.isEmpty()) {
            BigDecimal totalSanctioned = loanRepository.sumSanctionedByBorrower(currentUser);
            BigDecimal totalOutstanding = loanRepository.sumOutstandingByBorrower(currentUser);
            BigDecimal monthlyOutflow = loanRepository.sumMonthlyEmiByBorrower(currentUser);

            return ResponseEntity.ok(Map.of(
                "activeLoansCount", existingLoans.size(),
                "totalSanctioned", totalSanctioned != null ? totalSanctioned : BigDecimal.ZERO,
                "totalOutstanding", totalOutstanding != null ? totalOutstanding : BigDecimal.ZERO,
                "monthlyOutflow", monthlyOutflow != null ? monthlyOutflow : BigDecimal.ZERO,
                "cibilScore", 785
            ));
        }

        // Query approved applications for dynamic real-time summary
        List<LoanApplication> approvedApps = applicationRepository.findByBorrowerAndStatusInOrderByAppliedAtDesc(
            currentUser, APPROVED_STATUSES
        );

        BigDecimal totalSanctioned = BigDecimal.ZERO;
        BigDecimal monthlyOutflow = BigDecimal.ZERO;

        for (LoanApplication app : approvedApps) {
            totalSanctioned = totalSanctioned.add(app.getLoanAmount());

            BigDecimal P = app.getLoanAmount();
            double annualRate = app.getInterestRate() != null ? app.getInterestRate().doubleValue() : 10.5;
            double r = annualRate / 12.0 / 100.0;
            int N = app.getTenureMonths() != null ? app.getTenureMonths() : 12;

            double emiDouble = (P.doubleValue() * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
            monthlyOutflow = monthlyOutflow.add(BigDecimal.valueOf(emiDouble).setScale(2, RoundingMode.HALF_UP));
        }

        return ResponseEntity.ok(Map.of(
            "activeLoansCount", approvedApps.size(),
            "totalSanctioned", totalSanctioned,
            "totalOutstanding", totalSanctioned,
            "monthlyOutflow", monthlyOutflow,
            "cibilScore", 785
        ));
    }
}
