package com.loanvault.controller;

import com.loanvault.dto.response.ApiResponse;
import com.loanvault.entity.Loan;
import com.loanvault.entity.LoanApplication;
import com.loanvault.entity.User;
import com.loanvault.repository.LoanApplicationRepository;
import com.loanvault.repository.LoanRepository;
import com.loanvault.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * ============================================================
 * DISBURSEMENT CONTROLLER (Manager Only)
 * Manages pending disbursement queue and releases sanctioned funds.
 * When funds are released:
 *  1. Updates LoanApplication status -> DISBURSED
 *  2. Generates active Loan account entity (LN-YYYY-XXXXX)
 *  3. Calculates EMI repayment parameters
 * ============================================================
 */
@RestController
@RequestMapping("/api/disbursements")
@RequiredArgsConstructor
public class DisbursementController {

    private final LoanApplicationRepository applicationRepository;
    private final LoanRepository loanRepository;
    private final AuditService auditService;

    /**
     * Get applications pending disbursement.
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('MANAGER')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<LoanApplication>> getPendingDisbursements() {
        return ResponseEntity.ok(
            applicationRepository.findByStatusInOrderByAppliedAtAsc(
                List.of(LoanApplication.Status.DISBURSEMENT_PENDING, LoanApplication.Status.APPROVED)
            )
        );
    }

    /**
     * Release funds for a sanctioned loan application.
     */
    @PostMapping("/{id}/release")
    @PreAuthorize("hasRole('MANAGER')")
    @Transactional
    public ResponseEntity<ApiResponse> releaseFunds(
        @PathVariable Long id,
        @AuthenticationPrincipal User manager
    ) {
        LoanApplication app = applicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));

        if (app.getStatus() != LoanApplication.Status.DISBURSEMENT_PENDING && app.getStatus() != LoanApplication.Status.APPROVED) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("Application is not in a valid pending disbursement status.")
            );
        }

        // Update application status to DISBURSED
        app.setStatus(LoanApplication.Status.DISBURSED);
        applicationRepository.save(app);

        // Check if loan record already exists
        Loan existingLoan = loanRepository.findByApplication(app).orElse(null);

        if (existingLoan == null) {
            // Compute EMI: P * r * (1+r)^N / ((1+r)^N - 1)
            BigDecimal P = app.getLoanAmount();
            double annualRate = app.getInterestRate() != null ? app.getInterestRate().doubleValue() : 10.5;
            double r = annualRate / 12.0 / 100.0;
            int N = app.getTenureMonths() != null ? app.getTenureMonths() : 12;

            double emiDouble = (P.doubleValue() * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
            BigDecimal emiAmount = BigDecimal.valueOf(emiDouble).setScale(2, RoundingMode.HALF_UP);

            String loanAccNo = "LN-" + LocalDateTime.now().getYear() + "-"
                + String.format("%05d", new Random().nextInt(99999));

            Loan loan = Loan.builder()
                .loanAccountNumber(loanAccNo)
                .borrower(app.getBorrower())
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

            loanRepository.save(loan);

            auditService.log(manager.getEmail(), "FUNDS_DISBURSED",
                "Loan", loanAccNo, "Funds released. Created loan account: " + loanAccNo);

            return ResponseEntity.ok(ApiResponse.success(
                "Funds released successfully! Active Loan Account " + loanAccNo + " created.",
                Map.of("loanAccountNumber", loanAccNo)
            ));
        }

        return ResponseEntity.ok(ApiResponse.success("Funds released and application marked as Disbursed."));
    }
}
