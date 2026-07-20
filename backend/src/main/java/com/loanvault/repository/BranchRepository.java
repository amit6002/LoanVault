package com.loanvault.repository;

import com.loanvault.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ============================================================
 * BRANCH REPOSITORY
 * Provides database access for servicing bank branches.
 * ============================================================
 */
@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {

    Optional<Branch> findByCode(String code);

    List<Branch> findByActiveTrue();

    Optional<Branch> findByManagerId(Long managerId);
}
