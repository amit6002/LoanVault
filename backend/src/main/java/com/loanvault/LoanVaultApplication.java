package com.loanvault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * ============================================================
 * LOANVAULT APPLICATION ENTRY POINT
 * Spring Boot bootstrapper — scans all @Component, @Service,
 * @Repository, @Controller beans from this package downwards.
 * @EnableScheduling enables the OTP expiry cleanup cron job.
 * ============================================================
 */
@SpringBootApplication
@EnableScheduling
public class LoanVaultApplication {

    public static void main(String[] args) {
        SpringApplication.run(LoanVaultApplication.class, args);
    }
}
