package com.loanvault.controller;

import com.loanvault.dto.response.ApiResponse;
import com.loanvault.entity.User;
import com.loanvault.repository.UserRepository;
import com.loanvault.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

/**
 * ============================================================
 * USER CONTROLLER
 * Profile management endpoints for logged-in users.
 * Saves and retrieves profile data directly from Neon Cloud DB.
 * ============================================================
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final AuditService auditService;

    /**
     * Get current user's saved profile details.
     */
    @GetMapping("/profile")
    @Transactional(readOnly = true)
    public ResponseEntity<User> getProfile(
        @AuthenticationPrincipal User currentUser
    ) {
        User user = userRepository.findById(currentUser.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    /**
     * Update current user's profile details in Neon Cloud DB.
     */
    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<ApiResponse> updateProfile(
        @RequestBody Map<String, Object> payload,
        @AuthenticationPrincipal User currentUser
    ) {
        User user = userRepository.findById(currentUser.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (payload.containsKey("name") && payload.get("name") != null) {
            user.setName((String) payload.get("name"));
        }
        if (payload.containsKey("phone")) {
            user.setPhone((String) payload.get("phone"));
        }
        if (payload.containsKey("dateOfBirth")) {
            user.setDateOfBirth((String) payload.get("dateOfBirth"));
        }
        if (payload.containsKey("panNumber")) {
            user.setPanNumber((String) payload.get("panNumber"));
        }
        if (payload.containsKey("aadhaarNumber")) {
            user.setAadhaarNumber((String) payload.get("aadhaarNumber"));
        }
        if (payload.containsKey("addressLine1")) {
            user.setAddressLine1((String) payload.get("addressLine1"));
        }
        if (payload.containsKey("city")) {
            user.setCity((String) payload.get("city"));
        }
        if (payload.containsKey("state")) {
            user.setState((String) payload.get("state"));
        }
        if (payload.containsKey("pincode")) {
            user.setPincode((String) payload.get("pincode"));
        }
        if (payload.containsKey("employmentType")) {
            user.setEmploymentType((String) payload.get("employmentType"));
        }
        if (payload.containsKey("employerName")) {
            user.setEmployerName((String) payload.get("employerName"));
        }
        if (payload.containsKey("monthlyIncome") && payload.get("monthlyIncome") != null) {
            try {
                user.setMonthlyIncome(new BigDecimal(payload.get("monthlyIncome").toString()));
            } catch (Exception e) {
                // Ignore parse errors
            }
        }

        // Mark profile completed if core fields are present
        boolean isComplete = user.getName() != null && !user.getName().isBlank()
            && user.getPanNumber() != null && !user.getPanNumber().isBlank()
            && user.getAadhaarNumber() != null && !user.getAadhaarNumber().isBlank()
            && user.getEmploymentType() != null && !user.getEmploymentType().isBlank();

        user.setProfileCompleted(isComplete);
        userRepository.save(user);

        auditService.log(user.getEmail(), "PROFILE_UPDATED", "User",
            user.getId().toString(), "User updated profile details in Neon DB");

        return ResponseEntity.ok(ApiResponse.success(
            "Profile saved successfully to Neon database!",
            Map.of("profileCompleted", isComplete)
        ));
    }
}
