package com.loanvault.controller;

import com.loanvault.dto.request.ForgotPasswordRequest;
import com.loanvault.dto.request.LoginRequest;
import com.loanvault.dto.request.RegisterRequest;
import com.loanvault.dto.request.ResetPasswordRequest;
import com.loanvault.dto.response.ApiResponse;
import com.loanvault.dto.response.JwtResponse;
import com.loanvault.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * ============================================================
 * AUTH CONTROLLER
 * Public REST API for authentication flows.
 * No JWT required for any of these endpoints.
 *
 * POST /api/auth/register       → Register new borrower
 * POST /api/auth/login          → Email + password login
 * POST /api/auth/forgot-password → Send OTP to email
 * POST /api/auth/verify-otp     → Check if OTP is valid
 * POST /api/auth/reset-password  → Set new password
 * ============================================================
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Register a new borrower account.
     * Returns JWT so user is immediately logged in after registration.
     */
    @PostMapping("/register")
    public ResponseEntity<JwtResponse> register(@Valid @RequestBody RegisterRequest request) {
        JwtResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Email + password login (POST).
     * Returns JWT token with user info embedded.
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Friendly info for GET requests to /api/auth/login (prevents 405 errors).
     */
    @GetMapping("/login")
    public ResponseEntity<ApiResponse> loginGetInfo() {
        return ResponseEntity.ok(ApiResponse.success(
            "Auth Login REST API is active. Please send an HTTP POST request with JSON payload: { \"email\": \"...\", \"password\": \"...\" }."
        ));
    }

    /**
     * Friendly info for GET requests to /api/auth/register (prevents 405 errors).
     */
    @GetMapping("/register")
    public ResponseEntity<ApiResponse> registerGetInfo() {
        return ResponseEntity.ok(ApiResponse.success(
            "Auth Register REST API is active. Please send an HTTP POST request with JSON payload to create a account."
        ));
    }

    /**
     * Step 1 of password reset: Send OTP to user's registered email.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(
            "OTP sent to " + request.getEmail() + ". Valid for 10 minutes."
        ));
    }

    /**
     * Step 2: Verify OTP entered by user.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse> verifyOtp(@RequestParam String email,
                                                  @RequestParam String otp) {
        boolean isValid = authService.verifyOtp(email, otp);
        if (isValid) {
            return ResponseEntity.ok(ApiResponse.success("OTP verified successfully."));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error(
            "Invalid or expired OTP. Please request a new one."
        ));
    }

    /**
     * Step 3: Reset password using the verified OTP.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(
            "Password reset successfully. You can now sign in with your new password."
        ));
    }
}
