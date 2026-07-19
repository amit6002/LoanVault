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

    @Value("${mail.from.address}")
    private String fromAddress;

    @Value("${mail.from.name}")
    private String fromName;

    @Value("${otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Generates a 6-digit OTP, saves it to DB, and emails it to the user.
     */
    public void sendOtpEmail(String toEmail, String userName) {
        // 1. Generate random 6-digit OTP
        String otp = String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));

        // 2. Save OTP to database with expiry
        OtpToken otpToken = OtpToken.builder()
            .email(toEmail)
            .otp(otp)
            .expiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
            .used(false)
            .build();
        otpTokenRepository.save(otpToken);

        // 3. Build and send HTML email
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromAddress, fromName);
            helper.setTo(toEmail);
            helper.setSubject("LoanVault — Your Password Reset OTP");
            helper.setText(buildOtpEmailHtml(userName, otp, otpExpiryMinutes), true); // true = isHtml

            mailSender.send(message);
            log.info("OTP email sent to: {}", toEmail);

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send OTP email. Please try again.");
        }
    }

    /**
     * Validates OTP — returns true if valid, marks it as used.
     */
    public boolean validateOtp(String email, String inputOtp) {
        return otpTokenRepository.findTopByEmailOrderByCreatedAtDesc(email)
            .map(token -> {
                if (token.isValid(inputOtp)) {
                    token.setUsed(true);
                    otpTokenRepository.save(token);
                    return true;
                }
                return false;
            })
            .orElse(false);
    }

    /**
     * Scheduled cleanup — runs every hour to delete expired/used OTPs.
     */
    @Scheduled(fixedRate = 3_600_000) // every 1 hour
    public void cleanupExpiredOtps() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(1);
        otpTokenRepository.deleteExpiredTokens(cutoff);
        log.debug("Cleaned up expired OTP tokens");
    }

    // ============================================================
    // HTML Email Template
    // ============================================================
    private String buildOtpEmailHtml(String name, String otp, int expiryMinutes) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Arial', sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
                .container { max-width: 500px; margin: 0 auto; background: #fff;
                             border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                .header { background: #1e40af; padding: 28px; text-align: center; }
                .header h1 { color: white; margin: 0; font-size: 22px; }
                .body { padding: 32px; }
                .otp-box { background: #eff6ff; border: 2px solid #3b82f6; border-radius: 10px;
                           text-align: center; padding: 24px; margin: 24px 0; }
                .otp-code { font-size: 40px; font-weight: 900; letter-spacing: 12px;
                            color: #1e40af; font-family: monospace; }
                .warning { color: #92400e; background: #fef3c7; padding: 12px; border-radius: 8px;
                           font-size: 13px; margin-top: 16px; }
                .footer { background: #f8fafc; padding: 16px; text-align: center;
                          color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🏦 LoanVault</h1>
                </div>
                <div class="body">
                  <p>Hello, <strong>%s</strong></p>
                  <p>We received a request to reset your LoanVault account password.
                     Use the OTP below to verify your identity:</p>
                  <div class="otp-box">
                    <div class="otp-code">%s</div>
                    <p style="color:#64748b; font-size:13px; margin: 8px 0 0">
                      Valid for <strong>%d minutes</strong>
                    </p>
                  </div>
                  <div class="warning">
                    ⚠️ If you did not request a password reset, please ignore this email.
                    Your account remains secure. Do not share this OTP with anyone.
                  </div>
                </div>
                <div class="footer">
                  © 2026 LoanVault Financial Technologies. All rights reserved.<br>
                  This is an automated message, please do not reply.
                </div>
              </div>
            </body>
            </html>
            """.formatted(name, otp, expiryMinutes);
    }
}
