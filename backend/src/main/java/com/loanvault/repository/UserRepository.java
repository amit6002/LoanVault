package com.loanvault.repository;

import com.loanvault.entity.User;
import com.loanvault.entity.User.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ============================================================
 * USER REPOSITORY
 * Queries users by role, email, and branch roster.
 * ============================================================
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    List<User> findByServicingBranchIdAndRole(Long branchId, Role role);

    /**
     * Fetches all active, non-leave Loan Officers assigned to a specific branch,
     * ordered deterministically by ID ascending for Round Robin distribution.
     */
    @Query("SELECT u FROM User u WHERE u.servicingBranch.id = :branchId " +
           "AND u.role = 'OFFICER' AND u.active = true AND u.onLeave = false " +
           "ORDER BY u.id ASC")
    List<User> findActiveOfficersByBranch(@Param("branchId") Long branchId);
}
