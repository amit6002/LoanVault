package com.loanvault.service;

import com.loanvault.entity.AuditLog;
import com.loanvault.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * ============================================================
 * AUDIT SERVICE
 * Records all significant system events asynchronously.
 * Called from AuthService, LoanApplicationService, etc.
 * @Async ensures logging doesn't slow down the main request.
 * ============================================================
 */
@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(String actorEmail, String action, String entityType,
                    String entityId, String description) {
        AuditLog log = AuditLog.builder()
            .actorEmail(actorEmail)
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .description(description)
            .status("SUCCESS")
            .build();
        auditLogRepository.save(log);
    }

    @Async
    public void logFailure(String actorEmail, String action, String description) {
        AuditLog log = AuditLog.builder()
            .actorEmail(actorEmail)
            .action(action)
            .description(description)
            .status("FAILURE")
            .build();
        auditLogRepository.save(log);
    }
}
