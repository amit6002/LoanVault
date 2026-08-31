package com.loanvault.controller;

import com.loanvault.dto.response.ApiResponse;
import com.loanvault.dto.response.LoanAssignmentResultDTO;
import com.loanvault.entity.Branch;
import com.loanvault.entity.LoanApplication;
import com.loanvault.entity.User;
import com.loanvault.repository.BranchRepository;
import com.loanvault.repository.LoanApplicationRepository;
import com.loanvault.repository.UserRepository;
import com.loanvault.service.AuditService;
import com.loanvault.service.LoanAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Random;

import com.loanvault.entity.Loan;
import com.loanvault.repository.LoanRepository;
import org.springframework.transaction.annotation.Transactional;

/**
 * ============================================================
 * LOAN APPLICATION CONTROLLER
 * Handles the full loan application lifecycle.
 *
 * Borrower:
 *   POST /api/applications          → Submit new application
 *   GET  /api/applications/my       → Get own applications
 *
 * Officer:
 *   GET  /api/applications/queue    → Get pending verification queue
 *   PUT  /api/applications/{id}/recommend → Forward recommendation
 *
 * Manager:
 *   GET  /api/applications/approval-queue → Officer-recommended cases
 *   PUT  /api/applications/{id}/approve   → Approve & sanction
 *   PUT  /api/applications/{id}/reject    → Reject application
 * ============================================================
 */
@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class LoanApplicationController {

    private final LoanApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final BranchRepository branchRepository;
    private final LoanAssignmentService loanAssignmentService;
    private final AuditService auditService;

    // ===================== BORROWER ENDPOINTS =====================

    /**
     * Submit a new loan application with automatic dynamic Round Robin loan assignment.
     */
    @PostMapping
    @PreAuthorize("hasRole('BORROWER')")
    public ResponseEntity<ApiResponse> submitApplication(
        @RequestBody Map<String, Object> payload,
        @AuthenticationPrincipal User currentUser
    ) {
        // Generate reference ID: APP-YYYY-XXXXX
        String refId = "APP-" + LocalDateTime.now().getYear() + "-"
            + String.format("%05d", new Random().nextInt(99999));

        LoanApplication application = LoanApplication.builder()
            .referenceId(refId)
            .borrower(currentUser)
            .loanType((String) payload.get("loanType"))
            .loanAmount(new BigDecimal(payload.get("loanAmount").toString()))
            .tenureMonths(Integer.parseInt(payload.get("tenureMonths").toString()))
            .interestRate(new BigDecimal(payload.get("interestRate").toString()))
            .fullName((String) payload.get("fullName"))
            .panNumber((String) payload.get("panNumber"))
            .employmentType((String) payload.get("employmentType"))
            .employerName((String) payload.get("employerName"))
            .monthlyIncome(payload.get("monthlyIncome") != null ?
                new BigDecimal(payload.get("monthlyIncome").toString()) : null)
            .status(LoanApplication.Status.SUBMITTED)
            .build();

        // Determine Servicing Branch chosen by borrower (or default active branch)
        Branch servicingBranch = null;
        if (payload.get("servicingBranchId") != null) {
            Long branchId = Long.parseLong(payload.get("servicingBranchId").toString());
            servicingBranch = branchRepository.findById(branchId).orElse(null);
        } else if (payload.get("servicingBranchCode") != null) {
            servicingBranch = branchRepository.findByCode((String) payload.get("servicingBranchCode")).orElse(null);
        } else if (currentUser.getServicingBranch() != null) {
            servicingBranch = currentUser.getServicingBranch();
        }

        if (servicingBranch == null) {
            servicingBranch = branchRepository.findByActiveTrue().stream().findFirst()
                .orElseGet(() -> {
                    Branch defaultBranch = Branch.builder()
                        .code("MUM-01")
                        .name("Mumbai Central Branch")
                        .city("Mumbai")
                        .state("Maharashtra")
                        .pincode("400001")
                        .active(true)
                        .build();
                    return branchRepository.save(defaultBranch);
                });
        }

        // Perform Automatic Dynamic Round-Robin Loan Officer Assignment
        LoanAssignmentResultDTO assignmentResult = loanAssignmentService.assignLoanOfficer(application, servicingBranch);

        auditService.log(currentUser.getEmail(), "LOAN_APPLICATION_SUBMITTED",
            "LoanApplication", refId, String.format("Submitted application assigned to Branch [%s], Officer [%s]",
                servicingBranch.getCode(), assignmentResult.getOfficerName()));

        return ResponseEntity.ok(ApiResponse.success(
            "Application submitted and assigned successfully!",
            Map.of(
                "referenceId", refId,
                "servicingBranch", servicingBranch.getCode(),
                "assignedOfficer", assignmentResult.getOfficerName() != null ? assignmentResult.getOfficerName() : "PENDING_ASSIGNMENT",
                "assignmentStatus", assignmentResult.getAssignmentStatus()
            )
        ));
    }

    /**
     * Get the current borrower's applications.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('BORROWER')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<LoanApplication>> getMyApplications(
        @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(
            applicationRepository.findByBorrowerOrderByAppliedAtDesc(currentUser)
        );
    }

    // ===================== OFFICER ENDPOINTS =====================

    /**
     * Officer: Get all applications pending document verification.
     */
    @GetMapping("/queue")
    @PreAuthorize("hasRole('OFFICER')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<LoanApplication>> getVerificationQueue() {
        List<LoanApplication.Status> pendingStatuses = List.of(
            LoanApplication.Status.SUBMITTED,
            LoanApplication.Status.DOC_VERIFICATION,
            LoanApplication.Status.CREDIT_CHECK
        );
        return ResponseEntity.ok(
            applicationRepository.findByStatusInOrderByAppliedAtAsc(pendingStatuses)
        );
    }

    /**
     * Officer: Forward recommendation (approve or reject) to manager.
     */
    @PutMapping("/{id}/recommend")
    @PreAuthorize("hasRole('OFFICER')")
    public ResponseEntity<ApiResponse> recommend(
        @PathVariable Long id,
        @RequestBody Map<String, String> payload,
        @AuthenticationPrincipal User officer
    ) {
        LoanApplication app = applicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));

        String recommendation = payload.get("recommendation"); // "APPROVE" or "REJECT"
        String remarks = payload.get("remarks");

        app.setAssignedOfficer(officer);
        app.setOfficerRemarks(remarks);
        app.setStatus("APPROVE".equals(recommendation)
            ? LoanApplication.Status.RECOMMENDED_APPROVE
            : LoanApplication.Status.RECOMMENDED_REJECT
        );

        applicationRepository.save(app);

        auditService.log(officer.getEmail(), "OFFICER_RECOMMENDATION",
            "LoanApplication", app.getReferenceId(),
            "Officer " + recommendation + " recommendation: " + remarks);

        return ResponseEntity.ok(ApiResponse.success("Recommendation submitted successfully."));
    }

    // ===================== MANAGER ENDPOINTS =====================

    /**
     * Manager: Get all officer-recommended applications awaiting final sanction.
     */
    @GetMapping("/approval-queue")
    @PreAuthorize("hasRole('MANAGER')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<LoanApplication>> getApprovalQueue() {
        return ResponseEntity.ok(
            applicationRepository.findByStatusOrderByAppliedAtAsc(
                LoanApplication.Status.RECOMMENDED_APPROVE
            )
        );
    }

    /**
     * Manager: Approve, sanction, and disburse a loan.
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('MANAGER')")
    @Transactional
    public ResponseEntity<ApiResponse> approve(
        @PathVariable Long id,
        @RequestBody Map<String, String> payload,
        @AuthenticationPrincipal User manager
    ) {
        LoanApplication app = applicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));

        app.setStatus(LoanApplication.Status.DISBURSED);
        app.setManagerRemarks(payload.get("remarks"));
        app.setSanctionedAt(LocalDateTime.now());
        applicationRepository.save(app);

        // Automatically create active Loan record if not already created
        if (loanRepository.findByApplication(app).isEmpty()) {
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

            auditService.log(manager.getEmail(), "LOAN_SANCTIONED_AND_DISBURSED",
                "LoanApplication", app.getReferenceId(), "Loan sanctioned and disbursed by manager. Created account: " + loanAccNo);

            return ResponseEntity.ok(ApiResponse.success(
                "Loan approved and disbursed successfully! Active Loan Account " + loanAccNo + " created.",
                Map.of("loanAccountNumber", loanAccNo)
            ));
        }

        auditService.log(manager.getEmail(), "LOAN_APPROVED",
            "LoanApplication", app.getReferenceId(), "Loan sanctioned by manager");

        return ResponseEntity.ok(ApiResponse.success(
            "Loan approved! Application marked as Disbursed."
        ));
    }

    /**
     * Manager: Reject a loan application.
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse> reject(
        @PathVariable Long id,
        @RequestBody Map<String, String> payload,
        @AuthenticationPrincipal User manager
    ) {
        LoanApplication app = applicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));

        app.setStatus(LoanApplication.Status.REJECTED);
        app.setManagerRemarks(payload.get("remarks"));
        applicationRepository.save(app);

        auditService.log(manager.getEmail(), "LOAN_REJECTED",
            "LoanApplication", app.getReferenceId(), "Loan rejected by manager");

        return ResponseEntity.ok(ApiResponse.success("Application rejected."));
    }

    // ===================== ADMIN ENDPOINTS =====================

    /**
     * Admin: Get all loan applications across all statuses.
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<LoanApplication>> getAllApplications() {
        return ResponseEntity.ok(
            applicationRepository.findAllByOrderByAppliedAtDesc()
        );
    }
}
