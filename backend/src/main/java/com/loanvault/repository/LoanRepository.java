package com.loanvault.repository;

import com.loanvault.entity.Loan;
import com.loanvault.entity.LoanApplication;
import com.loanvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByBorrowerOrderByCreatedAtDesc(User borrower);

    Optional<Loan> findByLoanAccountNumber(String loanAccountNumber);

    Optional<Loan> findByApplication(LoanApplication application);

    List<Loan> findByStatus(Loan.LoanStatus status);

    @Query("SELECT COALESCE(SUM(l.sanctionedAmount), 0) FROM Loan l WHERE l.status = 'ACTIVE'")
    BigDecimal sumTotalActiveSanctionedAmount();

    @Query("SELECT COALESCE(SUM(l.outstandingPrincipal), 0) FROM Loan l WHERE l.status = 'ACTIVE'")
    BigDecimal sumTotalOutstandingPrincipal();

    @Query("SELECT COALESCE(SUM(l.sanctionedAmount), 0) FROM Loan l WHERE l.borrower = :borrower AND l.status = 'ACTIVE'")
    BigDecimal sumSanctionedByBorrower(@Param("borrower") User borrower);

    @Query("SELECT COALESCE(SUM(l.outstandingPrincipal), 0) FROM Loan l WHERE l.borrower = :borrower AND l.status = 'ACTIVE'")
    BigDecimal sumOutstandingByBorrower(@Param("borrower") User borrower);

    @Query("SELECT COALESCE(SUM(l.emiAmount), 0) FROM Loan l WHERE l.borrower = :borrower AND l.status = 'ACTIVE'")
    BigDecimal sumMonthlyEmiByBorrower(@Param("borrower") User borrower);

    long countByStatus(Loan.LoanStatus status);
}
