package com.loanvault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ============================================================
 * OTP TOKEN ENTITY
 * Stores the 6-digit one-time password for password reset flows.
 * Each OTP has a 10-minute expiry. Cleaned up by scheduled task.
 * ============================================================
 */
@Entity
@Table(name = "otp_tokens")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 6)
    private String otp;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean used = false;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid(String inputOtp) {
        return !used && !isExpired() && otp.equals(inputOtp);
    }
}
