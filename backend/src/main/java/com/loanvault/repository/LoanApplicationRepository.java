package com.loanvault.repository;

import com.loanvault.entity.LoanApplication;
import com.loanvault.entity.LoanApplication.Status;
import com.loanvault.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {

    // Borrower: get all their applications
    List<LoanApplication> findByBorrowerOrderByAppliedAtDesc(User borrower);

    // Officer: get pending verification queue
    List<LoanApplication> findByStatusInOrderByAppliedAtAsc(List<Status> statuses);

    // Manager: get officer-recommended applications
    List<LoanApplication> findByStatusOrderByAppliedAtAsc(Status status);

    Optional<LoanApplication> findByReferenceId(String referenceId);

    // Count by status for dashboard metrics
    long countByStatus(Status status);

    // Paginated audit search
    Page<LoanApplication> findByBorrower(User borrower, Pageable pageable);
}
