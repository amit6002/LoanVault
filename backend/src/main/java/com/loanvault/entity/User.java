package com.loanvault.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * ============================================================
 * USER ENTITY
 * Represents all system users across 4 roles: BORROWER, OFFICER,
 * MANAGER, ADMIN. Stores profile details in Neon Cloud DB.
 * ============================================================
 */
@Entity
@Table(name = "users",
    uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    // Nullable — Google OAuth2 users don't have a password
    @JsonIgnore
    @Column
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // "LOCAL" = email+password, "GOOGLE" = OAuth2 login
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.LOCAL;

    // Google's unique user ID (for OAuth2 users)
    @Column
    private String googleId;

    // Branch association for Officers/Managers or preferred servicing branch for Borrowers
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "servicing_branch_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "manager"})
    private Branch servicingBranch;

    // Legacy branch code/name string representation
    @Column
    private String branch;

    // Active status flag for Round Robin assignment skipping
    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    // Leave status flag for skipping officers temporarily on leave
    @Column(nullable = false)
    @Builder.Default
    private boolean onLeave = false;

    // ---- Profile Details Saved in Neon DB ----
    @Column
    private String phone;

    @Column
    private String dateOfBirth;

    @Column
    private String panNumber;

    @Column
    private String aadhaarNumber;

    @Column
    private String addressLine1;

    @Column
    private String city;

    @Column
    private String state;

    @Column
    private String pincode;

    @Column
    private String employmentType;

    @Column
    private String employerName;

    @Column(precision = 12, scale = 2)
    private BigDecimal monthlyIncome;

    @Column(nullable = false)
    @Builder.Default
    private boolean profileCompleted = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean kycVerified = false;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime lastLoginAt;

    // ============================================================
    // Spring Security UserDetails implementation
    // ============================================================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return enabled; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return enabled; }

    // ============================================================
    // Enum definitions
    // ============================================================

    public enum Role {
        BORROWER, OFFICER, MANAGER, ADMIN
    }

    public enum AuthProvider {
        LOCAL, GOOGLE
    }
}
