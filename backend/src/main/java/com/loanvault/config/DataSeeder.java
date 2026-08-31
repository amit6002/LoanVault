package com.loanvault.config;

import com.loanvault.entity.LoanApplication;
import com.loanvault.entity.User;
import com.loanvault.repository.LoanApplicationRepository;
import com.loanvault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * ============================================================
 * DATABASE DATA SEEDER & AUTOMATIC SCHEMA MIGRATOR
 * Runs automatically on Spring Boot startup.
 *  1. Migrates missing profile columns on Neon PostgreSQL if needed.
 *  2. Seeds initial demo accounts (Admin, Manager, Officer, Borrower)
 *  3. Seeds sample loan applications if the database is fresh.
 * ============================================================
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final LoanApplicationRepository applicationRepository;
    private final com.loanvault.repository.BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        migrateDatabaseSchema();
        seedBranchesAndUsers();
        seedApplications();
    }

    /**
     * Automatic SQL DDL Migration for Neon PostgreSQL
     * Ensures all new profile columns exist in the users table.
     */
    private void migrateDatabaseSchema() {
        try {
            log.info("Checking database schema migrations for Neon Cloud PostgreSQL...");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS pan_number VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS pincode VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS employment_type VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS employer_name VARCHAR(255)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_income NUMERIC(12, 2)");
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE");
            log.info("Database schema migration completed successfully!");
        } catch (Exception e) {
            log.warn("Schema migration note: {}", e.getMessage());
        }
    }

    private void seedBranchesAndUsers() {
        // 1. Seed Servicing Branches if none exist
        com.loanvault.entity.Branch mumbaiBranch = branchRepository.findByCode("MUM-01").orElse(null);
        if (mumbaiBranch == null) {
            mumbaiBranch = com.loanvault.entity.Branch.builder()
                .code("MUM-01")
                .name("Mumbai Central Branch")
                .city("Mumbai")
                .state("Maharashtra")
                .pincode("400001")
                .active(true)
                .build();
            mumbaiBranch = branchRepository.save(mumbaiBranch);
            log.info("Seeded Branch: MUM-01 (Mumbai Central Branch)");
        }

        if (!branchRepository.findByCode("DEL-01").isPresent()) {
            branchRepository.save(com.loanvault.entity.Branch.builder()
                .code("DEL-01")
                .name("Delhi Regional Branch")
                .city("New Delhi")
                .state("Delhi")
                .pincode("110001")
                .active(true)
                .build());
            log.info("Seeded Branch: DEL-01 (Delhi Regional Branch)");
        }

        if (!branchRepository.findByCode("BLR-01").isPresent()) {
            branchRepository.save(com.loanvault.entity.Branch.builder()
                .code("BLR-01")
                .name("Bengaluru Tech Hub Branch")
                .city("Bengaluru")
                .state("Karnataka")
                .pincode("560001")
                .active(true)
                .build());
            log.info("Seeded Branch: BLR-01 (Bengaluru Tech Hub Branch)");
        }

        // 2. System Admin Account
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
                .servicingBranch(mumbaiBranch)
                .profileCompleted(true)
                .build();
            userRepository.save(admin);
            log.info("Seeded Demo Admin User: admin@loanvault.com");
        }

        // 3. Loan Manager Account
        User manager = userRepository.findByEmail("manager@loanvault.com").orElse(null);
        if (manager == null) {
            manager = User.builder()
                .name("Vikram Malhotra (Branch Manager)")
                .email("manager@loanvault.com")
                .password(passwordEncoder.encode("Manager@1234"))
                .role(User.Role.MANAGER)
                .authProvider(User.AuthProvider.LOCAL)
                .enabled(true)
                .kycVerified(true)
                .branch("MUMBAI")
                .servicingBranch(mumbaiBranch)
                .profileCompleted(true)
                .build();
            manager = userRepository.save(manager);
            log.info("Seeded Demo Manager User: manager@loanvault.com");
        } else if (manager.getServicingBranch() == null) {
            manager.setServicingBranch(mumbaiBranch);
            userRepository.save(manager);
        }

        // Assign manager to Mumbai branch if null
        if (mumbaiBranch.getManager() == null) {
            mumbaiBranch.setManager(manager);
            branchRepository.save(mumbaiBranch);
        }

        // 4. Loan Officer Account
        User officer = userRepository.findByEmail("officer@loanvault.com").orElse(null);
        if (officer == null) {
            officer = User.builder()
                .name("Pooja Verma (Loan Officer)")
                .email("officer@loanvault.com")
                .password(passwordEncoder.encode("Officer@1234"))
                .role(User.Role.OFFICER)
                .authProvider(User.AuthProvider.LOCAL)
                .enabled(true)
                .kycVerified(true)
                .branch("MUMBAI")
                .servicingBranch(mumbaiBranch)
                .active(true)
                .onLeave(false)
                .profileCompleted(true)
                .build();
            userRepository.save(officer);
            log.info("Seeded Demo Officer User: officer@loanvault.com");
        } else if (officer.getServicingBranch() == null) {
            officer.setServicingBranch(mumbaiBranch);
            userRepository.save(officer);
        }

        // 5. Demo Borrower Account
        User borrower = userRepository.findByEmail("borrower@loanvault.com").orElse(null);
        if (borrower == null) {
            borrower = User.builder()
                .name("Rahul Sharma (Demo Borrower)")
                .email("borrower@loanvault.com")
                .password(passwordEncoder.encode("Borrower@1234"))
                .role(User.Role.BORROWER)
                .authProvider(User.AuthProvider.LOCAL)
                .enabled(true)
                .kycVerified(true)
                .branch("MUMBAI")
                .servicingBranch(mumbaiBranch)
                .panNumber("ABCDE1234F")
                .aadhaarNumber("123456789012")
                .employmentType("SALARIED")
                .employerName("TCS Ltd")
                .monthlyIncome(new BigDecimal("125000"))
                .profileCompleted(true)
                .build();
            userRepository.save(borrower);
            log.info("Seeded Demo Borrower User: borrower@loanvault.com");
        } else if (borrower.getServicingBranch() == null) {
            borrower.setServicingBranch(mumbaiBranch);
            userRepository.save(borrower);
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
