package com.loanvault.service;

import com.loanvault.dto.request.OfficerStatusDTO;
import com.loanvault.dto.response.BranchDTO;
import com.loanvault.dto.response.LoanAssignmentResultDTO;
import com.loanvault.entity.Branch;
import com.loanvault.entity.User;

import java.util.List;

/**
 * ============================================================
 * BRANCH SERVICE INTERFACE
 * Manages servicing branch onboarding, manager assignments, and
 * officer leave/active status management.
 * ============================================================
 */
public interface BranchService {

    Branch createBranch(Branch branch, Long managerUserId);

    BranchDTO getBranchById(Long branchId);

    List<BranchDTO> getAllActiveBranches();

    User updateOfficerStatus(Long officerUserId, OfficerStatusDTO statusDTO);

    List<User> getBranchOfficers(Long branchId);

    List<LoanAssignmentResultDTO> processPendingBranchAssignments(Long branchId);
}
