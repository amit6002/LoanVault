package com.loanvault.controller;

import com.loanvault.entity.AuditLog;
import com.loanvault.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * ============================================================
 * AUDIT TRAIL CONTROLLER
 * Admin-only endpoint for viewing the immutable event log.
 *
 * GET /api/admin/audit-logs?search=&page=0&size=20
 * ============================================================
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLog>> getAuditLogs(
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());

        Page<AuditLog> logs;
        if (search != null && !search.isBlank()) {
            logs = auditLogRepository
                .findByActorEmailContainingIgnoreCaseOrActionContainingIgnoreCase(
                    search, search, pageable
                );
        } else {
            logs = auditLogRepository.findAllByOrderByTimestampDesc(pageable);
        }

        return ResponseEntity.ok(logs);
    }
}
