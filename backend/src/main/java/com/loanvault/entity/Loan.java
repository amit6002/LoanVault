package com.loanvault.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ============================================================
 * LOAN ENTITY (Active / Disbursed Loan Account)
 * Created when a LoanApplication reaches DISBURSED status.
 * Tracks outstanding principal, EMI, and repayment progress.
 * ============================================================
 */
@Entity
@Table(name = "loans")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Human-readable loan ID e.g. LN-2026-04921
    @Column(nullable = false, unique = true)
    private String loanAccountNumber;

    // The borrower who owns this loan
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "borrower_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "authorities"})
    private User borrower;

    // The application that this loan was created from
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "borrower", "assignedOfficer"})
    private LoanApplication application;

    @Column(nullable = false)
    private String loanType;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal sanctionedAmount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal outstandingPrincipal;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(nullable = false)
    private Integer tenureMonths;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal emiAmount;

    @Column(nullable = false)
    private LocalDate disbursementDate;

    @Column(nullable = false)
    private LocalDate nextEmiDate;

    @Column(nullable = false)
    private Integer emisPaid;

    @Column(nullable = false)
    private Integer emisRemaining;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private LoanStatus status = LoanStatus.ACTIVE;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum LoanStatus {
        ACTIVE, CLOSED, NPA, WRITTEN_OFF
    }
}
