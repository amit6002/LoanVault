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
 * Handles Railway environment variable DATABASE_URL conversion.
 * ============================================================
 */
@SpringBootApplication
@EnableScheduling
public class LoanVaultApplication {

    public static void main(String[] args) {
        // Automatically convert Railway DATABASE_URL format (postgres://...) to JDBC format (jdbc:postgresql://...)
        String dbUrl = System.getenv("DATABASE_URL");
        if (dbUrl != null && !dbUrl.trim().isEmpty() && !dbUrl.startsWith("jdbc:")) {
            String formattedUrl = dbUrl;
            if (formattedUrl.startsWith("postgres://")) {
                formattedUrl = formattedUrl.replace("postgres://", "jdbc:postgresql://");
            } else if (formattedUrl.startsWith("postgresql://")) {
                formattedUrl = formattedUrl.replace("postgresql://", "jdbc:postgresql://");
            }
            if (!formattedUrl.contains("sslmode=")) {
                formattedUrl += (formattedUrl.contains("?") ? "&" : "?") + "sslmode=require";
            }
            System.setProperty("spring.datasource.url", formattedUrl);
        }

        SpringApplication.run(LoanVaultApplication.class, args);
    }
}
