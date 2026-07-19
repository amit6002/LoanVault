package com.loanvault.repository;

import com.loanvault.entity.Loan;
import com.loanvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByBorrowerOrderByCreatedAtDesc(User borrower);

    Optional<Loan> findByLoanAccountNumber(String loanAccountNumber);

    List<Loan> findByStatus(Loan.LoanStatus status);
}
