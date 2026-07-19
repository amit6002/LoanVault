package com.loanvault.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
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
            createProduct(
                "PROD-PERSONAL", "PERSONAL", "Personal Flexi Loan",
                new BigDecimal("50000"), new BigDecimal("1500000"),
                12, 60, 10.5, 1.5,
                List.of("ID_PROOF", "INCOME_PROOF", "BANK_STATEMENT"),
                "Unsecured personal loan for urgent financial needs, medical emergencies, or travel.",
                true
            ),
            createProduct(
                "PROD-HOME", "HOME", "Home Prime Loan",
                new BigDecimal("500000"), new BigDecimal("10000000"),
                60, 360, 8.4, 0.5,
                List.of("ID_PROOF", "ADDRESS_PROOF", "INCOME_PROOF", "BANK_STATEMENT", "PROPERTY_DOCS"),
                "Long-term housing finance for home purchase, construction, or plot acquisition.",
                true
            ),
            createProduct(
                "PROD-VEHICLE", "VEHICLE", "Auto Drive Loan",
                new BigDecimal("100000"), new BigDecimal("5000000"),
                12, 84, 9.2, 1.0,
                List.of("ID_PROOF", "ADDRESS_PROOF", "INCOME_PROOF", "BANK_STATEMENT"),
                "Finance your dream car or commercial vehicle with quick approval and low interest.",
                false
            ),
            createProduct(
                "PROD-BUSINESS", "BUSINESS", "MSME Growth Loan",
                new BigDecimal("200000"), new BigDecimal("8000000"),
                24, 120, 12.0, 2.0,
                List.of("ID_PROOF", "ADDRESS_PROOF", "INCOME_PROOF", "BANK_STATEMENT"),
                "Working capital and equipment financing for registered businesses and MSMEs.",
                true
            ),
            createProduct(
                "PROD-EDUCATION", "EDUCATION", "Higher Education Loan",
                new BigDecimal("200000"), new BigDecimal("15000000"),
                24, 180, 8.9, 0.75,
                List.of("ID_PROOF", "ADDRESS_PROOF", "INCOME_PROOF", "BANK_STATEMENT"),
                "Fund domestic and international studies with flexible moratorium period.",
                false
            ),
            createProduct(
                "PROD-GOLD", "GOLD", "Sovereign Gold Loan",
                new BigDecimal("25000"), new BigDecimal("5000000"),
                3, 36, 7.5, 0.25,
                List.of("ID_PROOF", "ADDRESS_PROOF"),
                "Instant liquidity against gold ornaments with minimal documentation and lowest rates.",
                false
            )
        );
        return ResponseEntity.ok(products);
    }

    private Map<String, Object> createProduct(
        String id,
        String type,
        String name,
        BigDecimal minAmount,
        BigDecimal maxAmount,
        int minTenure,
        int maxTenure,
        double interestRate,
        double processingFeePercent,
        List<String> requiredDocs,
        String description,
        boolean popular
    ) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("type", type);
        map.put("name", name);
        map.put("minAmount", minAmount);
        map.put("maxAmount", maxAmount);
        map.put("minTenure", minTenure);
        map.put("maxTenure", maxTenure);
        map.put("interestRate", interestRate);
        map.put("processingFeePercent", processingFeePercent);
        map.put("requiredDocs", requiredDocs);
        map.put("description", description);
        map.put("popular", popular);
        return map;
    }
}
