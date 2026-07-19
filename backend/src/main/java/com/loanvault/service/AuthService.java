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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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
    private final AuthenticationManager authenticationManager;
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

        // Log the event
        auditService.log(savedUser.getEmail(), "REGISTER", "User", savedUser.getId().toString(),
            "New borrower account registered");

        log.info("New borrower registered: {}", savedUser.getEmail());

        return buildJwtResponse(token, savedUser);
    }

    /**
     * Authenticate existing user with email + password.
     */
    @Transactional
    public JwtResponse login(LoginRequest request) {
        // Spring Security's AuthenticationManager validates credentials
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = (User) authentication.getPrincipal();

        // Update last login timestamp
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT
        String token = jwtService.generateToken(user, user.getRole().name());

        // Log login event
        auditService.log(user.getEmail(), "LOGIN", "User", user.getId().toString(),
            "User logged in via email/password");

        log.info("User logged in: {} (role: {})", user.getEmail(), user.getRole());

        return buildJwtResponse(token, user);
    }

    /**
     * Initiate forgot password flow — sends OTP to user's email.
     */
    public void forgotPassword(String email) {
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

        auditService.log(user.getEmail(), "PASSWORD_RESET", "User",
            user.getId().toString(), "Password reset via OTP");

        log.info("Password reset for: {}", user.getEmail());
    }

    // ============================================================
    // Helper
    // ============================================================
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
