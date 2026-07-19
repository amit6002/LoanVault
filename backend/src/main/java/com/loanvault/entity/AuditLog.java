package com.loanvault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ============================================================
 * AUDIT LOG ENTITY
 * Immutable event trail. Every significant user action is
 * recorded here. Admin-visible, append-only (no updates).
 * ============================================================
 */
@Entity
@Table(name = "audit_logs")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who performed the action
    @Column(nullable = false)
    private String actorEmail;

    // What they did e.g. "LOGIN", "LOAN_APPLICATION_SUBMITTED"
    @Column(nullable = false)
    private String action;

    // What entity was affected e.g. "LoanApplication", "User"
    @Column
    private String entityType;

    // ID of the affected entity
    @Column
    private String entityId;

    // Additional detail about the action
    @Column(length = 500)
    private String description;

    // SUCCESS, FAILURE, WARNING
    @Column(nullable = false)
    @Builder.Default
    private String status = "SUCCESS";

    // Client IP address
    @Column
    private String ipAddress;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
