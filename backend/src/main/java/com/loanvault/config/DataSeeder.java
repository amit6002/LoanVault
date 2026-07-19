package com.loanvault.config;

import com.loanvault.entity.LoanApplication;
import com.loanvault.entity.User;
import com.loanvault.repository.LoanApplicationRepository;
import com.loanvault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * ============================================================
 * DATABASE DATA SEEDER
 * Runs automatically on Spring Boot startup.
 * Seeds initial demo accounts (Admin, Manager, Officer, Borrower)
 * and sample loan applications if the database is fresh.
 * Real user registrations are untouched!
 * ============================================================
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final LoanApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedApplications();
    }

    private void seedUsers() {
        // 1. System Admin Account
        if (!userRepository.existsByEmail("admin@loanvault.com")) {
            User admin = User.builder()
                .name("System Admin")
                .email("admin@loanvault.com")
                .password(passwordEncoder.encode("Admin@1234"))
                .role(User.Role.ADMIN)
                .authProvider(User.AuthProvider.LOCAL)
                .enabled(true)
                .kycVerified(true)
                .branch("MUMBAI")
                .build();
            userRepository.save(admin);
            log.info("Seeded Demo Admin User: admin@loanvault.com");
        }

        // 2. Loan Manager Account
        if (!userRepository.existsByEmail("manager@loanvault.com")) {
            User manager = User.builder()
                .name("Vikram Malhotra (Branch Manager)")
                .email("manager@loanvault.com")
                .password(passwordEncoder.encode("Manager@1234"))
                .role(User.Role.MANAGER)
                .authProvider(User.AuthProvider.LOCAL)
                .enabled(true)
                .kycVerified(true)
                .branch("MUMBAI")
                .build();
            userRepository.save(manager);
            log.info("Seeded Demo Manager User: manager@loanvault.com");
        }

        // 3. Loan Officer Account
        if (!userRepository.existsByEmail("officer@loanvault.com")) {
            User officer = User.builder()
                .name("Pooja Verma (Loan Officer)")
                .email("officer@loanvault.com")
                .password(passwordEncoder.encode("Officer@1234"))
                .role(User.Role.OFFICER)
                .authProvider(User.AuthProvider.LOCAL)
                .enabled(true)
                .kycVerified(true)
                .branch("MUMBAI")
                .build();
            userRepository.save(officer);
            log.info("Seeded Demo Officer User: officer@loanvault.com");
        }

        // 4. Demo Borrower Account
        if (!userRepository.existsByEmail("borrower@loanvault.com")) {
            User borrower = User.builder()
                .name("Rahul Sharma (Demo Borrower)")
                .email("borrower@loanvault.com")
                .password(passwordEncoder.encode("Borrower@1234"))
                .role(User.Role.BORROWER)
                .authProvider(User.AuthProvider.LOCAL)
                .enabled(true)
                .kycVerified(true)
                .branch("MUMBAI")
                .build();
            userRepository.save(borrower);
            log.info("Seeded Demo Borrower User: borrower@loanvault.com");
        }
    }

    private void seedApplications() {
        if (applicationRepository.count() == 0) {
            userRepository.findByEmail("borrower@loanvault.com").ifPresent(borrower -> {
                userRepository.findByEmail("officer@loanvault.com").ifPresent(officer -> {

                    // Sample Application 1: Submitted (Officer queue)
                    LoanApplication app1 = LoanApplication.builder()
                        .referenceId("APP-2026-00812")
                        .borrower(borrower)
                        .loanType("HOME")
                        .loanAmount(new BigDecimal("5500000"))
                        .tenureMonths(240)
                        .interestRate(new BigDecimal("8.40"))
                        .fullName("Rahul Sharma")
                        .panNumber("ABCDE1234F")
                        .employmentType("SALARIED")
                        .employerName("TCS Ltd")
                        .monthlyIncome(new BigDecimal("125000"))
                        .status(LoanApplication.Status.SUBMITTED)
                        .cibilScore(785)
                        .build();

                    // Sample Application 2: Officer Recommended (Manager approval queue)
                    LoanApplication app2 = LoanApplication.builder()
                        .referenceId("APP-2026-00431")
                        .borrower(borrower)
                        .assignedOfficer(officer)
                        .loanType("PERSONAL")
                        .loanAmount(new BigDecimal("450000"))
                        .tenureMonths(36)
                        .interestRate(new BigDecimal("10.50"))
                        .fullName("Rahul Sharma")
                        .panNumber("ABCDE1234F")
                        .employmentType("SALARIED")
                        .employerName("TCS Ltd")
                        .monthlyIncome(new BigDecimal("125000"))
                        .status(LoanApplication.Status.RECOMMENDED_APPROVE)
                        .officerRemarks("KYC documents verified. Credit score 785 is excellent. Recommended for approval.")
                        .cibilScore(785)
                        .build();

                    applicationRepository.saveAll(List.of(app1, app2));
                    log.info("Seeded sample loan applications into database.");
                });
            });
        }
    }
}
