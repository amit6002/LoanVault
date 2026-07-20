package com.loanvault.repository;

import com.loanvault.entity.LoanApplication;
import com.loanvault.entity.LoanApplication.Status;
import com.loanvault.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {

    // Borrower: get all their applications
    List<LoanApplication> findByBorrowerOrderByAppliedAtDesc(User borrower);

    // Borrower: get approved applications
    List<LoanApplication> findByBorrowerAndStatusInOrderByAppliedAtDesc(User borrower, List<Status> statuses);

    // Officer: get pending verification queue
    List<LoanApplication> findByStatusInOrderByAppliedAtAsc(List<Status> statuses);

    // Manager: get officer-recommended applications or pending disbursement
    List<LoanApplication> findByStatusOrderByAppliedAtAsc(Status status);

    Optional<LoanApplication> findByReferenceId(String referenceId);

    // Count by status for dashboard metrics
    long countByStatus(Status status);

    // All applications for admin view
    List<LoanApplication> findAllByOrderByAppliedAtDesc();

    @Query("SELECT COALESCE(SUM(a.loanAmount), 0) FROM LoanApplication a WHERE a.status IN :statuses")
    BigDecimal sumLoanAmountByStatusIn(@Param("statuses") List<Status> statuses);

    @Query("SELECT COALESCE(SUM(a.loanAmount), 0) FROM LoanApplication a WHERE a.borrower = :borrower AND a.status IN :statuses")
    BigDecimal sumLoanAmountByBorrowerAndStatusIn(@Param("borrower") User borrower, @Param("statuses") List<Status> statuses);

    // Paginated audit search
    Page<LoanApplication> findByBorrower(User borrower, Pageable pageable);
}
