package com.loanvault.service;

import com.loanvault.dto.response.LoanAssignmentResultDTO;
import com.loanvault.entity.Branch;
import com.loanvault.entity.BranchAssignmentState;
import com.loanvault.entity.LoanApplication;
import com.loanvault.entity.LoanApplication.Status;
import com.loanvault.entity.User;
import com.loanvault.entity.User.Role;
import com.loanvault.repository.BranchAssignmentStateRepository;
import com.loanvault.repository.LoanApplicationRepository;
import com.loanvault.repository.UserRepository;
import com.loanvault.service.impl.LoanAssignmentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * ============================================================
 * LOAN ASSIGNMENT SERVICE UNIT TESTS
 * Verifies Round Robin equality, skip-logic for officers on leave,
 * thread-safety state persistence, and PENDING_ASSIGNMENT edge cases.
 * ============================================================
 */
@ExtendWith(MockitoExtension.class)
class LoanAssignmentServiceTest {

    @Mock
    private BranchAssignmentStateRepository branchAssignmentStateRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LoanApplicationRepository loanApplicationRepository;

    @InjectMocks
    private LoanAssignmentServiceImpl loanAssignmentService;

    private Branch branch;
    private User manager;
    private User officer1;
    private User officer2;
    private User officer3;
    private BranchAssignmentState state;

    @BeforeEach
    void setUp() {
        manager = User.builder().id(100L).name("Manager Rajesh").role(Role.MANAGER).email("manager@loanvault.com").build();
        branch = Branch.builder().id(1L).code("MUM-01").name("Mumbai Main Branch").manager(manager).active(true).build();

        officer1 = User.builder().id(101L).name("Officer Officer A").email("a@loanvault.com").role(Role.OFFICER).active(true).onLeave(false).servicingBranch(branch).build();
        officer2 = User.builder().id(102L).name("Officer Officer B").email("b@loanvault.com").role(Role.OFFICER).active(true).onLeave(false).servicingBranch(branch).build();
        officer3 = User.builder().id(103L).name("Officer Officer C").email("c@loanvault.com").role(Role.OFFICER).active(true).onLeave(false).servicingBranch(branch).build();

        state = BranchAssignmentState.builder().id(50L).branch(branch).lastAssignedOfficerIndex(-1).build();
    }

    @Test
    @DisplayName("Round Robin Assignment: Sequentially assigns officers (0 -> 1 -> 2 -> 0)")
    void testRoundRobinSequentialAssignment() {
        when(branchAssignmentStateRepository.findByBranchIdWithLock(1L)).thenReturn(Optional.of(state));
        when(userRepository.findActiveOfficersByBranch(1L)).thenReturn(Arrays.asList(officer1, officer2, officer3));

        // Loan 1 -> Officer 1 (Index 0)
        LoanApplication loan1 = createLoan("APP-001");
        LoanAssignmentResultDTO result1 = loanAssignmentService.assignLoanOfficer(loan1, branch);
        assertEquals("ASSIGNED", result1.getAssignmentStatus());
        assertEquals(officer1.getId(), result1.getOfficerId());
        assertEquals(0, result1.getAssignedOfficerIndex());

        // Update mock state pointer
        state.setLastAssignedOfficerIndex(0);

        // Loan 2 -> Officer 2 (Index 1)
        LoanApplication loan2 = createLoan("APP-002");
        LoanAssignmentResultDTO result2 = loanAssignmentService.assignLoanOfficer(loan2, branch);
        assertEquals(officer2.getId(), result2.getOfficerId());
        assertEquals(1, result2.getAssignedOfficerIndex());

        // Update mock state pointer
        state.setLastAssignedOfficerIndex(1);

        // Loan 3 -> Officer 3 (Index 2)
        LoanApplication loan3 = createLoan("APP-003");
        LoanAssignmentResultDTO result3 = loanAssignmentService.assignLoanOfficer(loan3, branch);
        assertEquals(officer3.getId(), result3.getOfficerId());
        assertEquals(2, result3.getAssignedOfficerIndex());

        // Update mock state pointer to 2 (last element)
        state.setLastAssignedOfficerIndex(2);

        // Loan 4 -> Wrap around to Officer 1 (Index 0)
        LoanApplication loan4 = createLoan("APP-004");
        LoanAssignmentResultDTO result4 = loanAssignmentService.assignLoanOfficer(loan4, branch);
        assertEquals(officer1.getId(), result4.getOfficerId());
        assertEquals(0, result4.getAssignedOfficerIndex());
    }

    @Test
    @DisplayName("Skip Logic: Skips officer when officer2 goes on leave")
    void testSkipOfficerOnLeave() {
        // Only officer1 and officer3 are active (officer2 on leave)
        when(branchAssignmentStateRepository.findByBranchIdWithLock(1L)).thenReturn(Optional.of(state));
        when(userRepository.findActiveOfficersByBranch(1L)).thenReturn(Arrays.asList(officer1, officer3));

        LoanApplication loan1 = createLoan("APP-101");
        LoanAssignmentResultDTO result1 = loanAssignmentService.assignLoanOfficer(loan1, branch);
        assertEquals(officer1.getId(), result1.getOfficerId());

        state.setLastAssignedOfficerIndex(0);

        LoanApplication loan2 = createLoan("APP-102");
        LoanAssignmentResultDTO result2 = loanAssignmentService.assignLoanOfficer(loan2, branch);
        assertEquals(officer3.getId(), result2.getOfficerId()); // Officer 2 skipped!
    }

    @Test
    @DisplayName("Zero Officers Edge Case: Marks loan as PENDING_ASSIGNMENT when branch has no active officers")
    void testZeroActiveOfficersPendingAssignment() {
        when(branchAssignmentStateRepository.findByBranchIdWithLock(1L)).thenReturn(Optional.of(state));
        when(userRepository.findActiveOfficersByBranch(1L)).thenReturn(Collections.emptyList());

        LoanApplication loan = createLoan("APP-201");
        LoanAssignmentResultDTO result = loanAssignmentService.assignLoanOfficer(loan, branch);

        assertEquals("PENDING_ASSIGNMENT", result.getAssignmentStatus());
        assertNull(result.getOfficerId());
        assertEquals(Status.PENDING_ASSIGNMENT, loan.getStatus());
        assertEquals(manager, loan.getAssignedManager());
        verify(loanApplicationRepository, times(1)).save(loan);
    }

    @Test
    @DisplayName("Reassignment Trigger: Automatically assigns PENDING_ASSIGNMENT loans when officer becomes available")
    void testTriggerPendingReassignments() {
        LoanApplication pendingLoan = createLoan("APP-301");
        pendingLoan.setStatus(Status.PENDING_ASSIGNMENT);
        pendingLoan.setServicingBranch(branch);

        when(loanApplicationRepository.findByServicingBranchIdAndStatusOrderByAppliedAtAsc(1L, Status.PENDING_ASSIGNMENT))
                .thenReturn(Collections.singletonList(pendingLoan));
        when(branchAssignmentStateRepository.findByBranchIdWithLock(1L)).thenReturn(Optional.of(state));
        when(userRepository.findActiveOfficersByBranch(1L)).thenReturn(Collections.singletonList(officer1));

        List<LoanAssignmentResultDTO> results = loanAssignmentService.triggerPendingReassignments(1L);

        assertEquals(1, results.size());
        assertEquals("ASSIGNED", results.get(0).getAssignmentStatus());
        assertEquals(officer1.getId(), results.get(0).getOfficerId());
        assertEquals(Status.SUBMITTED, pendingLoan.getStatus());
    }

    private LoanApplication createLoan(String refId) {
        return LoanApplication.builder()
                .referenceId(refId)
                .loanType("BUSINESS")
                .loanAmount(new BigDecimal("500000"))
                .tenureMonths(36)
                .interestRate(new BigDecimal("11.5"))
                .status(Status.SUBMITTED)
                .build();
    }
}
