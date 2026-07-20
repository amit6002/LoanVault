package com.loanvault.repository;

import com.loanvault.entity.BranchAssignmentState;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ============================================================
 * BRANCH ASSIGNMENT STATE REPOSITORY
 * Provides atomic, pessimistic-locked access to the Round Robin
 * state counter for concurrent dynamic loan assignments.
 * ============================================================
 */
@Repository
public interface BranchAssignmentStateRepository extends JpaRepository<BranchAssignmentState, Long> {

    Optional<BranchAssignmentState> findByBranchId(Long branchId);

    /**
     * Acquires a pessimistic database write lock (SELECT ... FOR UPDATE)
     * on the BranchAssignmentState record for the specified branch.
     * Prevents race conditions during simultaneous loan applications.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT bas FROM BranchAssignmentState bas WHERE bas.branch.id = :branchId")
    Optional<BranchAssignmentState> findByBranchIdWithLock(@Param("branchId") Long branchId);
}
