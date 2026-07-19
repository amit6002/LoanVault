package com.loanvault.repository;

import com.loanvault.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    // Get the most recent OTP for an email (for validation)
    Optional<OtpToken> findTopByEmailOrderByCreatedAtDesc(String email);

    // Cleanup scheduled task: delete all expired tokens older than 1 hour
    @Modifying
    @Transactional
    @Query("DELETE FROM OtpToken o WHERE o.expiresAt < :cutoff OR o.used = true")
    void deleteExpiredTokens(LocalDateTime cutoff);
}
