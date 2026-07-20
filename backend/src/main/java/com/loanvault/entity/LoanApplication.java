package com.loanvault.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ============================================================
 * LOAN APPLICATION ENTITY
 * Stores all data from the 7-step loan application wizard.
 * Tracks the full lifecycle from SUBMITTED → DISBURSED.
 * ============================================================
 */
@Entity
@Table(name = "loan_applications")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class LoanApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Human-readable reference ID e.g. APP-2026-00812
    @Column(nullable = false, unique = true)
    private String referenceId;

    // The borrower who submitted this application
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "borrower_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "authorities"})
    private User borrower;

    // Servicing branch chosen by borrower for processing this loan application
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "servicing_branch_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "manager"})
    private Branch servicingBranch;

    // Branch Manager handling this loan application's sanctioning
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_manager_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "authorities"})
    private User assignedManager;

    // Officer assigned to verify this application (dynamically allocated via Round Robin)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_officer_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "authorities"})
    private User assignedOfficer;

    // ---- Step 1: Loan Details ----
    @Column(nullable = false)
    private String loanType;      // PERSONAL, HOME, VEHICLE, etc.

    @Column(nullable = false)
    private BigDecimal loanAmount;

    @Column(nullable = false)
    private Integer tenureMonths;

    @Column(nullable = false)
    private BigDecimal interestRate;

    // ---- Step 2: Personal Info ----
    @Column
    private String fullName;

    @Column
    private String dateOfBirth;

    @Column
    private String panNumber;

    @Column
    private String aadhaarNumber;

    // ---- Step 3: Employment Info ----
    @Column
    private String employmentType;  // SALARIED, SELF_EMPLOYED, etc.

    @Column
    private String employerName;

    @Column
    private BigDecimal monthlyIncome;

    // ---- Step 4: Address ----
    @Column
    private String addressLine1;

    @Column
    private String city;

    @Column
    private String state;

    @Column
    private String pincode;

    // ---- Status & Workflow ----
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Status status = Status.SUBMITTED;

    // Officer's verification remarks
    @Column(length = 1000)
    private String officerRemarks;

    // Manager's sanction remarks
    @Column(length = 1000)
    private String managerRemarks;

    // CIBIL credit score pulled by officer
    @Column
    private Integer cibilScore;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime appliedAt = LocalDateTime.now();

    @Column
    private LocalDateTime lastUpdatedAt;

    @Column
    private LocalDateTime sanctionedAt;

    @PreUpdate
    public void onUpdate() {
        this.lastUpdatedAt = LocalDateTime.now();
    }

    // ============================================================
    // Application lifecycle status
    // ============================================================
    public enum Status {
        PENDING_ASSIGNMENT,
        SUBMITTED,
        DOC_VERIFICATION,
        CREDIT_CHECK,
        UNDER_REVIEW,
        RECOMMENDED_APPROVE,
        RECOMMENDED_REJECT,
        APPROVED,
        REJECTED,
        DISBURSEMENT_PENDING,
        DISBURSED,
        CANCELLED
    }
}
