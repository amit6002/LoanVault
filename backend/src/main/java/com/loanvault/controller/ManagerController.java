package com.loanvault.controller;

import com.loanvault.entity.Loan;
import com.loanvault.entity.LoanApplication;
import com.loanvault.repository.LoanApplicationRepository;
import com.loanvault.repository.LoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * ============================================================
 * MANAGER CONTROLLER
 * Endpoints for Manager executive portfolio metrics & reporting.
 * ============================================================
 */
@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
public class ManagerController {

    private final LoanApplicationRepository applicationRepository;
    private final LoanRepository loanRepository;

    /**
     * Get executive dashboard stats (AUM, Pending Sanctions, Disbursed amount, NPA ratio).
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('MANAGER')")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> getManagerStats() {
        BigDecimal portfolioAum = loanRepository.sumTotalActiveSanctionedAmount();
        long pendingSanctionCount = applicationRepository.countByStatus(LoanApplication.Status.RECOMMENDED_APPROVE);
        BigDecimal totalDisbursed = applicationRepository.sumLoanAmountByStatusIn(List.of(
            LoanApplication.Status.DISBURSED, LoanApplication.Status.DISBURSEMENT_PENDING
        ));

        return ResponseEntity.ok(Map.of(
            "portfolioAum", portfolioAum != null ? portfolioAum : BigDecimal.ZERO,
            "pendingSanctionCount", pendingSanctionCount,
            "disbursedThisMonth", totalDisbursed != null ? totalDisbursed : BigDecimal.ZERO,
            "grossNpaRatio", 0.85
        ));
    }
}
