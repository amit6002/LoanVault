package com.loanvault.controller;

import com.loanvault.dto.request.OfficerStatusDTO;
import com.loanvault.dto.response.BranchDTO;
import com.loanvault.dto.response.LoanAssignmentResultDTO;
import com.loanvault.entity.Branch;
import com.loanvault.entity.User;
import com.loanvault.service.BranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ============================================================
 * BRANCH REST CONTROLLER
 * Endpoints for branch management, roster inspections, officer status toggles,
 * and pending loan reassignment triggers.
 * ============================================================
 */
@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    public ResponseEntity<List<BranchDTO>> getAllBranches() {
        return ResponseEntity.ok(branchService.getAllActiveBranches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BranchDTO> getBranchById(@PathVariable Long id) {
        return ResponseEntity.ok(branchService.getBranchById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Branch> createBranch(
            @RequestBody Branch branch,
            @RequestParam(required = false) Long managerUserId) {
        return ResponseEntity.ok(branchService.createBranch(branch, managerUserId));
    }

    @GetMapping("/{id}/officers")
    public ResponseEntity<List<User>> getBranchOfficers(@PathVariable Long id) {
        return ResponseEntity.ok(branchService.getBranchOfficers(id));
    }

    @PutMapping("/officers/{officerId}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<User> updateOfficerStatus(
            @PathVariable Long officerId,
            @RequestBody OfficerStatusDTO statusDTO) {
        User updatedOfficer = branchService.updateOfficerStatus(officerId, statusDTO);
        return ResponseEntity.ok(updatedOfficer);
    }

    @PostMapping("/{id}/reassign-pending")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> reassignPendingLoans(@PathVariable Long id) {
        List<LoanAssignmentResultDTO> results = branchService.processPendingBranchAssignments(id);
        return ResponseEntity.ok(Map.of(
                "branchId", id,
                "processedCount", results.size(),
                "assignments", results
        ));
    }
}
