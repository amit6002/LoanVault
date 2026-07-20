package com.loanvault.controller;

import com.loanvault.entity.Loan;
import com.loanvault.entity.User;
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

    /**
     * Get active loans owned by current logged-in borrower.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('BORROWER')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Loan>> getMyLoans(
        @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(
            loanRepository.findByBorrowerOrderByCreatedAtDesc(currentUser)
        );
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
        List<Loan> loans = loanRepository.findByBorrowerOrderByCreatedAtDesc(currentUser);

        BigDecimal totalSanctioned = loanRepository.sumSanctionedByBorrower(currentUser);
        BigDecimal totalOutstanding = loanRepository.sumOutstandingByBorrower(currentUser);
        BigDecimal monthlyOutflow = loanRepository.sumMonthlyEmiByBorrower(currentUser);

        return ResponseEntity.ok(Map.of(
            "activeLoansCount", loans.size(),
            "totalSanctioned", totalSanctioned != null ? totalSanctioned : BigDecimal.ZERO,
            "totalOutstanding", totalOutstanding != null ? totalOutstanding : BigDecimal.ZERO,
            "monthlyOutflow", monthlyOutflow != null ? monthlyOutflow : BigDecimal.ZERO,
            "cibilScore", 785
        ));
    }
}
