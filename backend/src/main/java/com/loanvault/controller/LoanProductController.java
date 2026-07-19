package com.loanvault.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * ============================================================
 * LOAN PRODUCT CONTROLLER
 * Public REST API to fetch available loan products & configurations.
 * GET /api/loan-products
 * ============================================================
 */
@RestController
@RequestMapping("/api/loan-products")
public class LoanProductController {

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getLoanProducts() {
        List<Map<String, Object>> products = List.of(
            Map.of(
                "id", "PROD-PERSONAL",
                "type", "PERSONAL",
                "name", "Personal Flexi Loan",
                "minAmount", new BigDecimal("50000"),
                "maxAmount", new BigDecimal("1500000"),
                "minTenure", 12,
                "maxTenure", 60,
                "interestRate", 10.5,
                "processingFeePercent", 1.5,
                "requiredDocs", List.of("ID_PROOF", "INCOME_PROOF", "BANK_STATEMENT"),
                "description", "Unsecured personal loan for urgent financial needs, medical emergencies, or travel.",
                "popular", true
            ),
            Map.of(
                "id", "PROD-HOME",
                "type", "HOME",
                "name", "Home Prime Loan",
                "minAmount", new BigDecimal("500000"),
                "maxAmount", new BigDecimal("10000000"),
                "minTenure", 60,
                "maxTenure", 360,
                "interestRate", 8.4,
                "processingFeePercent", 0.5,
                "requiredDocs", List.of("ID_PROOF", "ADDRESS_PROOF", "INCOME_PROOF", "BANK_STATEMENT", "PROPERTY_DOCS"),
                "description", "Long-term housing finance for home purchase, construction, or plot acquisition.",
                "popular", true
            ),
            Map.of(
                "id", "PROD-VEHICLE",
                "type", "VEHICLE",
                "name", "Auto Drive Loan",
                "minAmount", new BigDecimal("100000"),
                "maxAmount", new BigDecimal("5000000"),
                "minTenure", 12,
                "maxTenure", 84,
                "interestRate", 9.2,
                "processingFeePercent", 1.0,
                "requiredDocs", List.of("ID_PROOF", "ADDRESS_PROOF", "INCOME_PROOF", "BANK_STATEMENT"),
                "description", "Finance your dream car or commercial vehicle with quick approval and low interest.",
                "popular", false
            ),
            Map.of(
                "id", "PROD-BUSINESS",
                "type", "BUSINESS",
                "name", "MSME Growth Loan",
                "minAmount", new BigDecimal("200000"),
                "maxAmount", new BigDecimal("8000000"),
                "minTenure", 24,
                "maxTenure", 120,
                "interestRate", 12.0,
                "processingFeePercent", 2.0,
                "requiredDocs", List.of("ID_PROOF", "ADDRESS_PROOF", "INCOME_PROOF", "BANK_STATEMENT"),
                "description", "Working capital and equipment financing for registered businesses and MSMEs.",
                "popular", true
            ),
            Map.of(
                "id", "PROD-EDUCATION",
                "type", "EDUCATION",
                "name", "Higher Education Loan",
                "minAmount", new BigDecimal("200000"),
                "maxAmount", new BigDecimal("15000000"),
                "minTenure", 24,
                "maxTenure", 180,
                "interestRate", 8.9,
                "processingFeePercent", 0.75,
                "requiredDocs", List.of("ID_PROOF", "ADDRESS_PROOF", "INCOME_PROOF", "BANK_STATEMENT"),
                "description", "Fund domestic and international studies with flexible moratorium period.",
                "popular", false
            ),
            Map.of(
                "id", "PROD-GOLD",
                "type", "GOLD",
                "name", "Sovereign Gold Loan",
                "minAmount", new BigDecimal("25000"),
                "maxAmount", new BigDecimal("5000000"),
                "minTenure", 3,
                "maxTenure", 36,
                "interestRate", 7.5,
                "processingFeePercent", 0.25,
                "requiredDocs", List.of("ID_PROOF", "ADDRESS_PROOF"),
                "description", "Instant liquidity against gold ornaments with minimal documentation and lowest rates.",
                "popular", false
            )
        );
        return ResponseEntity.ok(products);
    }
}
