package com.loanvault.service;

import com.loanvault.entity.OtpToken;
import com.loanvault.repository.OtpTokenRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * ============================================================
 * EMAIL SERVICE
 * Sends OTP emails via Gmail SMTP.
 * Uses HTML email template for a professional look.
 * Scheduled cleanup removes expired OTPs every hour.
 * ============================================================
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final OtpTokenRepository otpTokenRepository;

    @Value("${MAIL_FROM:amitkumar013571@gmail.com}")
    private String fromAddress;

    private final String fromName = "LoanVault Banking";

    private final int otpExpiryMinutes = 10;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Generate 6-digit OTP code, save in database, and send via email.
     */
    public String generateAndSendOtp(String email) {
        // 1. Invalidate any previous unused OTPs for this email
        otpTokenRepository.deleteByEmail(email);

        // 2. Generate cryptographically secure 6-digit OTP
        String otpCode = String.format("%06d", SECURE_RANDOM.nextInt(1000000));

        // 3. Save to database with expiry time
        OtpToken otpToken = OtpToken.builder()
                .email(email)
                .otpCode(otpCode)
                .expiryTime(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .used(false)
                .build();
        otpTokenRepository.save(otpToken);

        // 4. Send email asynchronously / wrapped in try-catch so flow doesn't break if SMTP fails
        try {
            sendOtpEmail(email, otpCode);
            log.info("OTP email successfully dispatched to {}", email);
        } catch (Exception e) {
            log.warn("SMTP email dispatch failed: {}. OTP code logged locally: {}", e.getMessage(), otpCode);
        }

        return otpCode;
    }

    /**
     * Verify that provided OTP matches active token in database and has not expired.
     */
    public boolean verifyOtp(String email, String otpCode) {
        return otpTokenRepository.findByEmailAndOtpCode(email, otpCode)
                .map(token -> {
                    if (token.getExpiryTime().isBefore(LocalDateTime.now()) || token.isUsed()) {
                        return false;
                    }
                    // Mark as used so it cannot be reused
                    token.setUsed(true);
                    otpTokenRepository.save(token);
                    return true;
                })
                .orElse(false);
    }

    /**
     * Helper to construct and send styled HTML email.
     */
    private void sendOtpEmail(String toEmail, String otpCode) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromAddress);
        helper.setTo(toEmail);
        helper.setSubject("🔒 Your LoanVault Password Reset Verification Code: " + otpCode);

        String htmlContent = String.format("""
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
                .card { max-width: 500px; margin: auto; background: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #3b82f6; text-decoration: none; display: block; margin-bottom: 20px; }
                .otp { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; background: #0f172a; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px dashed #0284c7; }
                .footer { font-size: 12px; color: #64748b; margin-top: 30px; text-align: center; border-t: 1px solid #334155; padding-top: 15px; }
              </style>
            </head>
            <body>
              <div class="card">
                <a href="#" class="logo">🏦 LoanVault</a>
                <h2>Password Reset Request</h2>
                <p>Use the following 6-digit Verification Code to reset your account password. This code will expire in <strong>%d minutes</strong>.</p>
                
                <div class="otp">%s</div>
                
                <p style="color: #94a3b8; font-size: 13px;">If you did not request a password reset, please ignore this message or contact security support immediately.</p>
                
                <div class="footer">
                  © 2026 LoanVault Inc. All rights reserved.<br>
                  Security notice: Never share your OTP with anyone.
                </div>
              </div>
            </body>
            </html>
            """, otpExpiryMinutes, otpCode);

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    /**
     * Scheduled task: purges expired tokens from database every 1 hour.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void purgeExpiredTokens() {
        otpTokenRepository.deleteByExpiryTimeBefore(LocalDateTime.now());
        log.debug("Cleaned up expired OTP tokens");
    }
}
