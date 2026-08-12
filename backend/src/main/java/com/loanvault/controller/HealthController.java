package com.loanvault.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * ============================================================
 * HEALTH / KEEP-ALIVE CONTROLLER
 * Unauthenticated lightweight endpoint used by uptime monitors
 * (e.g. UptimeRobot, Cron-job.org, Better Stack) to keep Render
 * backend web service awake and avoid 50s-2min cold starts.
 * ============================================================
 */
@RestController
public class HealthController {

    @GetMapping({"/api/health", "/health"})
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "LoanVault Backend",
            "timestamp", System.currentTimeMillis()
        ));
    }
}
