package com.loanvault.service;

import com.loanvault.dto.request.LoginRequest;
import com.loanvault.dto.request.RegisterRequest;
import com.loanvault.dto.request.ResetPasswordRequest;
import com.loanvault.dto.response.JwtResponse;
import com.loanvault.entity.User;
import com.loanvault.repository.UserRepository;
import com.loanvault.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * ============================================================
 * AUTH SERVICE
 * Business logic for: register, login, forgot password, OTP, reset.
 * ============================================================
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AuditService auditService;

    /**
     * Register a new borrower account.
     */
    @Transactional
    public JwtResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("An account with this email already exists.");
        }

        // Create user entity
        User user = User.builder()
            .name(request.getName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .branch(request.getBranch())
            .role(User.Role.BORROWER)          // New registrations are always BORROWER
            .authProvider(User.AuthProvider.LOCAL)
            .enabled(true)
            .kycVerified(false)
            .build();

        User savedUser = userRepository.save(user);

        // Generate JWT
        String token = jwtService.generateToken(savedUser, savedUser.getRole().name());

        // Log the event safely
        try {
            auditService.log(savedUser.getEmail(), "REGISTER", "User", savedUser.getId().toString(),
                "New borrower account registered");
        } catch (Exception e) {
            log.warn("Audit logging failed on register: {}", e.getMessage());
        }

        log.info("New borrower registered: {}", savedUser.getEmail());

        return buildJwtResponse(token, savedUser);
    }

    /**
     * Authenticate existing user with email + password.
     */
    @Transactional
    public JwtResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password.");
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("Account is disabled. Please contact system admin.");
        }

        // Update last login timestamp
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT
        String token = jwtService.generateToken(user, user.getRole().name());

        // Log login event safely
        try {
            auditService.log(user.getEmail(), "LOGIN", "User", user.getId().toString(),
                "User logged in via email/password");
        } catch (Exception e) {
            log.warn("Audit logging failed on login: {}", e.getMessage());
        }

        log.info("User logged in: {} (role: {})", user.getEmail(), user.getRole());

        return buildJwtResponse(token, user);
    }

    /**
     * Initiate forgot password flow — sends OTP to user's email.
     */
    public void initiateForgotPassword(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("No account found with this email address."));

        if (user.getAuthProvider() == User.AuthProvider.GOOGLE) {
            throw new RuntimeException(
                "This account uses Google Sign-In. Please use Google to access your account."
            );
        }

        emailService.sendOtpEmail(email, user.getName());
        log.info("OTP sent to: {}", email);
    }

    /**
     * Alias method for forgot password.
     */
    public void forgotPassword(String email) {
        initiateForgotPassword(email);
    }

    /**
     * Validates OTP provided by user.
     */
    public boolean verifyOtp(String email, String otp) {
        return emailService.validateOtp(email, otp);
    }

    /**
     * Reset password after OTP has been verified.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // Double-check OTP is valid
        if (!emailService.validateOtp(request.getEmail(), request.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP. Please request a new one.");
        }

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found."));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        try {
            auditService.log(user.getEmail(), "RESET_PASSWORD", "User", user.getId().toString(),
                "Password reset successfully via OTP verification");
        } catch (Exception e) {
            log.warn("Audit logging failed on reset password: {}", e.getMessage());
        }

        log.info("Password reset successfully for: {}", user.getEmail());
    }

    /**
     * Helper to construct JwtResponse DTO.
     */
    private JwtResponse buildJwtResponse(String token, User user) {
        return JwtResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .userId(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole().name())
            .kycVerified(user.isKycVerified())
            .build();
    }
}
