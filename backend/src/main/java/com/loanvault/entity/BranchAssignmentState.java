package com.loanvault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ============================================================
 * BRANCH ASSIGNMENT STATE ENTITY
 * Stores the Round Robin index pointer per branch for efficient,
 * O(1) dynamic loan assignment without recalculating loan counts.
 * Uses pessimistic DB locking and JPA optimistic locking (@Version).
 * ============================================================
 */
@Entity
@Table(name = "branch_assignment_states")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class BranchAssignmentState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "branch_id", nullable = false, unique = true)
    private Branch branch;

    // Zero-based index pointer of the last assigned Loan Officer in the active roster
    @Column(nullable = false)
    @Builder.Default
    private Integer lastAssignedOfficerIndex = -1;

    // Database ID of the last assigned Loan Officer (for audit logging)
    @Column
    private Long lastAssignedOfficerId;

    @Column
    private LocalDateTime lastAssignedAt;

    // Optimistic locking version counter
    @Version
    private Long version;
}
