package com.loanvault.service.impl;

import com.loanvault.dto.response.LoanAssignmentResultDTO;
import com.loanvault.entity.Branch;
import com.loanvault.entity.BranchAssignmentState;
import com.loanvault.entity.LoanApplication;
import com.loanvault.entity.LoanApplication.Status;
import com.loanvault.entity.User;
import com.loanvault.repository.BranchAssignmentStateRepository;
import com.loanvault.repository.LoanApplicationRepository;
import com.loanvault.repository.UserRepository;
import com.loanvault.service.LoanAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ============================================================
 * LOAN ASSIGNMENT SERVICE IMPLEMENTATION
 * Thread-safe, scalable implementation of Round Robin loan assignment.
 * Uses pessimistic database locking on BranchAssignmentState to ensure
 * zero race conditions across concurrent application threads or server nodes.
 * ============================================================
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LoanAssignmentServiceImpl implements LoanAssignmentService {

    private final BranchAssignmentStateRepository branchAssignmentStateRepository;
    private final UserRepository userRepository;
    private final LoanApplicationRepository loanApplicationRepository;

    @Override
    @Transactional
    public LoanAssignmentResultDTO assignLoanOfficer(LoanApplication loanApplication, Branch servicingBranch) {
        log.info("Starting dynamic assignment for Loan Application [{}] at Branch [{}]",
                loanApplication.getReferenceId(), servicingBranch.getCode());

        // 1. Assign Servicing Branch and Branch Manager
        loanApplication.setServicingBranch(servicingBranch);
        loanApplication.setAssignedManager(servicingBranch.getManager());

        // 2. Acquire Pessimistic DB Write Lock on BranchAssignmentState for this branch
        BranchAssignmentState assignmentState = branchAssignmentStateRepository
                .findByBranchIdWithLock(servicingBranch.getId())
                .orElseGet(() -> {
                    log.info("Initializing BranchAssignmentState record for Branch [{}]", servicingBranch.getCode());
                    BranchAssignmentState newState = BranchAssignmentState.builder()
                            .branch(servicingBranch)
                            .lastAssignedOfficerIndex(-1)
                            .build();
                    return branchAssignmentStateRepository.saveAndFlush(newState);
                });

        // 3. Query all ACTIVE, non-leave Loan Officers in this branch ordered deterministically by ID ASC
        List<User> activeOfficers = userRepository.findActiveOfficersByBranch(servicingBranch.getId());

        // 4. Edge Case: Branch currently has zero active officers available
        if (activeOfficers.isEmpty()) {
            log.warn("Branch [{}] has NO active loan officers available. Queueing loan [{}] as PENDING_ASSIGNMENT.",
                    servicingBranch.getCode(), loanApplication.getReferenceId());

            loanApplication.setAssignedOfficer(null);
            loanApplication.setStatus(Status.PENDING_ASSIGNMENT);
            loanApplicationRepository.save(loanApplication);

            return LoanAssignmentResultDTO.builder()
                    .applicationReferenceId(loanApplication.getReferenceId())
                    .branchId(servicingBranch.getId())
                    .branchCode(servicingBranch.getCode())
                    .branchName(servicingBranch.getName())
                    .managerId(servicingBranch.getManager() != null ? servicingBranch.getManager().getId() : null)
                    .managerName(servicingBranch.getManager() != null ? servicingBranch.getManager().getName() : "N/A")
                    .officerId(null)
                    .officerName(null)
                    .officerEmail(null)
                    .assignedOfficerIndex(-1)
                    .assignmentStatus("PENDING_ASSIGNMENT")
                    .message("No active loan officers available in servicing branch. Application queued as PENDING_ASSIGNMENT.")
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        // 5. Calculate Round Robin Next Index: (lastIndex + 1) % activeOfficers.size()
        int lastIndex = assignmentState.getLastAssignedOfficerIndex();
        int nextIndex = (lastIndex + 1) % activeOfficers.size();
        User assignedOfficer = activeOfficers.get(nextIndex);

        log.info("Round Robin Assignment: Branch [{}] -> Officer [{}] (Index {} of {})",
                servicingBranch.getCode(), assignedOfficer.getName(), nextIndex, activeOfficers.size());

        // 6. Update BranchAssignmentState pointer
        assignmentState.setLastAssignedOfficerIndex(nextIndex);
        assignmentState.setLastAssignedOfficerId(assignedOfficer.getId());
        assignmentState.setLastAssignedAt(LocalDateTime.now());
        branchAssignmentStateRepository.save(assignmentState);

        // 7. Complete Loan Application Assignment
        loanApplication.setAssignedOfficer(assignedOfficer);
        if (loanApplication.getStatus() == Status.PENDING_ASSIGNMENT || loanApplication.getStatus() == null) {
            loanApplication.setStatus(Status.SUBMITTED);
        }
        loanApplicationRepository.save(loanApplication);

        return LoanAssignmentResultDTO.builder()
                .applicationReferenceId(loanApplication.getReferenceId())
                .branchId(servicingBranch.getId())
                .branchCode(servicingBranch.getCode())
                .branchName(servicingBranch.getName())
                .managerId(servicingBranch.getManager() != null ? servicingBranch.getManager().getId() : null)
                .managerName(servicingBranch.getManager() != null ? servicingBranch.getManager().getName() : "N/A")
                .officerId(assignedOfficer.getId())
                .officerName(assignedOfficer.getName())
                .officerEmail(assignedOfficer.getEmail())
                .assignedOfficerIndex(nextIndex)
                .assignmentStatus("ASSIGNED")
                .message(String.format("Loan successfully assigned to Officer %s (%s)", assignedOfficer.getName(), assignedOfficer.getEmail()))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public List<LoanAssignmentResultDTO> triggerPendingReassignments(Long branchId) {
        log.info("Processing pending loan assignments for Branch ID [{}]", branchId);
        List<LoanApplication> pendingLoans = loanApplicationRepository
                .findByServicingBranchIdAndStatusOrderByAppliedAtAsc(branchId, Status.PENDING_ASSIGNMENT);

        List<LoanAssignmentResultDTO> results = new ArrayList<>();
        if (pendingLoans.isEmpty()) {
            return results;
        }

        for (LoanApplication loan : pendingLoans) {
            LoanAssignmentResultDTO result = assignLoanOfficer(loan, loan.getServicingBranch());
            results.add(result);
            if ("PENDING_ASSIGNMENT".equals(result.getAssignmentStatus())) {
                // Still no officer available, break loop
                break;
            }
        }

        return results;
    }
}
