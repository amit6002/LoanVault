package com.loanvault.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ============================================================
 * BRANCH ENTITY
 * Represents bank servicing branches handling loans.
 * Stores Branch Manager reference and location metadata.
 * ============================================================
 */
@Entity
@Table(name = "branches",
    uniqueConstraints = @UniqueConstraint(columnNames = "code"))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Branch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code; // e.g. "MUM-01", "DEL-02"

    @Column(nullable = false)
    private String name; // e.g. "Mumbai Main Branch"

    @Column
    private String city;

    @Column
    private String state;

    @Column
    private String pincode;

    // Single Branch Manager assigned to this branch
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "manager_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "authorities"})
    private User manager;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
