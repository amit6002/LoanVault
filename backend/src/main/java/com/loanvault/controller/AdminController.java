package com.loanvault.controller;

import com.loanvault.dto.response.ApiResponse;
import com.loanvault.entity.User;
import com.loanvault.repository.UserRepository;
import com.loanvault.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * ============================================================
 * ADMIN USER CONTROLLER
 * System Admin endpoints for user directory management.
 *
 * GET  /api/admin/users           → List all users (paginated)
 * POST /api/admin/users/invite    → Invite a new staff member
 * PUT  /api/admin/users/{id}/toggle → Enable/disable user
 * ============================================================
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")       // All endpoints in this controller require ADMIN
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    /**
     * List all registered users in the system (paginated).
     */
    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(userRepository.findAll(pageable));
    }

    /**
     * Invite a new staff member (Officer, Manager, Admin).
     * Unlike borrower self-registration, staff accounts are created by admins.
     */
    @PostMapping("/users/invite")
    public ResponseEntity<ApiResponse> inviteUser(
        @RequestBody Map<String, String> payload,
        @org.springframework.security.core.annotation.AuthenticationPrincipal User admin
    ) {
        String email = payload.get("email");
        String name = payload.get("name");
        String roleStr = payload.get("role");   // "OFFICER", "MANAGER", "ADMIN"

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(
                ApiResponse.error("An account with this email already exists.")
            );
        }

        User.Role role;
        try {
            role = User.Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid role: " + roleStr));
        }

        // Create staff account with a temporary default password
        // In production: send an invite email with a password setup link
        User newUser = User.builder()
            .name(name)
            .email(email)
            .password(passwordEncoder.encode("TempPass@123"))  // User must reset on first login
            .role(role)
            .authProvider(User.AuthProvider.LOCAL)
            .enabled(true)
            .kycVerified(true)  // Staff are pre-verified
            .build();

        userRepository.save(newUser);

        auditService.log(admin.getEmail(), "USER_INVITED", "User",
            email, "Admin invited new " + role + " user: " + name);

        return ResponseEntity.ok(ApiResponse.success(
            "Staff account created for " + name + ". Default password: TempPass@123 (must be changed on first login)."
        ));
    }

    /**
     * Enable or disable a user account.
     */
    @PutMapping("/users/{id}/toggle")
    public ResponseEntity<ApiResponse> toggleUser(
        @PathVariable Long id,
        @org.springframework.security.core.annotation.AuthenticationPrincipal User admin
    ) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(!user.isEnabled());
        userRepository.save(user);

        String action = user.isEnabled() ? "ENABLED" : "DISABLED";
        auditService.log(admin.getEmail(), "USER_" + action, "User",
            id.toString(), "Admin " + action.toLowerCase() + " user account");

        return ResponseEntity.ok(ApiResponse.success(
            "User account " + action.toLowerCase() + " successfully."
        ));
    }
}
