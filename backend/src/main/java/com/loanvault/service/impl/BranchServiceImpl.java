package com.loanvault.service.impl;

import com.loanvault.dto.request.OfficerStatusDTO;
import com.loanvault.dto.response.BranchDTO;
import com.loanvault.dto.response.LoanAssignmentResultDTO;
import com.loanvault.entity.Branch;
import com.loanvault.entity.BranchAssignmentState;
import com.loanvault.entity.User;
import com.loanvault.entity.User.Role;
import com.loanvault.repository.BranchAssignmentStateRepository;
import com.loanvault.repository.BranchRepository;
import com.loanvault.repository.UserRepository;
import com.loanvault.service.BranchService;
import com.loanvault.service.LoanAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ============================================================
 * BRANCH SERVICE IMPLEMENTATION
 * Handles branch operations, manager linkage, and officer roster updates.
 * Automatically triggers reassignment of pending loans when officers return.
 * ============================================================
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BranchServiceImpl implements BranchService {

    private final BranchRepository branchRepository;
    private final BranchAssignmentStateRepository branchAssignmentStateRepository;
    private final UserRepository userRepository;
    private final LoanAssignmentService loanAssignmentService;

    @Override
    @Transactional
    public Branch createBranch(Branch branch, Long managerUserId) {
        if (managerUserId != null) {
            User manager = userRepository.findById(managerUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Manager User not found with ID: " + managerUserId));
            manager.setRole(Role.MANAGER);
            branch.setManager(manager);
            userRepository.save(manager);
        }

        Branch savedBranch = branchRepository.save(branch);

        // Initialize assignment state record
        BranchAssignmentState assignmentState = BranchAssignmentState.builder()
                .branch(savedBranch)
                .lastAssignedOfficerIndex(-1)
                .build();
        branchAssignmentStateRepository.save(assignmentState);

        return savedBranch;
    }

    @Override
    @Transactional(readOnly = true)
    public BranchDTO getBranchById(Long branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new IllegalArgumentException("Branch not found with ID: " + branchId));
        return mapToDTO(branch);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BranchDTO> getAllActiveBranches() {
        return branchRepository.findByActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public User updateOfficerStatus(Long officerUserId, OfficerStatusDTO statusDTO) {
        User officer = userRepository.findById(officerUserId)
                .orElseThrow(() -> new IllegalArgumentException("Officer User not found with ID: " + officerUserId));

        boolean statusChanged = false;
        if (statusDTO.getActive() != null) {
            officer.setActive(statusDTO.getActive());
            statusChanged = true;
        }

        if (statusDTO.getOnLeave() != null) {
            officer.setOnLeave(statusDTO.getOnLeave());
            statusChanged = true;
        }

        User updatedOfficer = userRepository.save(officer);

        // If officer became available (active & not on leave), trigger pending loan reassignments for their branch!
        if (statusChanged && updatedOfficer.isActive() && !updatedOfficer.isOnLeave() && updatedOfficer.getServicingBranch() != null) {
            log.info("Officer [{}] is now ACTIVE & AVAILABLE. Processing pending assignments for Branch [{}]",
                    updatedOfficer.getName(), updatedOfficer.getServicingBranch().getCode());
            loanAssignmentService.triggerPendingReassignments(updatedOfficer.getServicingBranch().getId());
        }

        return updatedOfficer;
    }

    @Override
    @Transactional(readOnly = true)
    public List<User> getBranchOfficers(Long branchId) {
        return userRepository.findByServicingBranchIdAndRole(branchId, Role.OFFICER);
    }

    @Override
    @Transactional
    public List<LoanAssignmentResultDTO> processPendingBranchAssignments(Long branchId) {
        return loanAssignmentService.triggerPendingReassignments(branchId);
    }

    private BranchDTO mapToDTO(Branch branch) {
        List<User> totalOfficers = userRepository.findByServicingBranchIdAndRole(branch.getId(), Role.OFFICER);
        List<User> activeOfficers = userRepository.findActiveOfficersByBranch(branch.getId());
        BranchAssignmentState state = branchAssignmentStateRepository.findByBranchId(branch.getId()).orElse(null);

        return BranchDTO.builder()
                .id(branch.getId())
                .code(branch.getCode())
                .name(branch.getName())
                .city(branch.getCity())
                .state(branch.getState())
                .pincode(branch.getPincode())
                .managerId(branch.getManager() != null ? branch.getManager().getId() : null)
                .managerName(branch.getManager() != null ? branch.getManager().getName() : "N/A")
                .managerEmail(branch.getManager() != null ? branch.getManager().getEmail() : "N/A")
                .active(branch.isActive())
                .totalOfficersCount(totalOfficers.size())
                .activeOfficersCount(activeOfficers.size())
                .lastAssignedOfficerIndex(state != null ? state.getLastAssignedOfficerIndex() : -1)
                .lastAssignedOfficerId(state != null ? state.getLastAssignedOfficerId() : null)
                .build();
    }
}
