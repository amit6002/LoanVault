package com.loanvault.service;

import com.loanvault.dto.response.LoanAssignmentResultDTO;
import com.loanvault.entity.Branch;
import com.loanvault.entity.LoanApplication;

import java.util.List;

/**
 * ============================================================
 * LOAN ASSIGNMENT SERVICE INTERFACE
 * Handles production-ready, thread-safe dynamic Round Robin assignment
 * of loan applications to Branch Managers and Loan Officers.
 * ============================================================
 */
public interface LoanAssignmentService {

    /**
     * Dynamically assigns a loan application to a servicing branch,
     * its Branch Manager, and an active Loan Officer using thread-safe Round Robin.
     *
     * @param loanApplication The newly submitted loan application
     * @param servicingBranch The branch chosen by the borrower
     * @return Result DTO containing assignment details
     */
    LoanAssignmentResultDTO assignLoanOfficer(LoanApplication loanApplication, Branch servicingBranch);

    /**
     * Triggers reassignment of all PENDING_ASSIGNMENT loans for a branch
     * when a Loan Officer becomes active or joins the branch.
     *
     * @param branchId ID of the branch to process queued assignments for
     * @return List of assignment result DTOs
     */
    List<LoanAssignmentResultDTO> triggerPendingReassignments(Long branchId);
}
