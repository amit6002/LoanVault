package com.loanvault.repository;

import com.loanvault.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByActorEmailContainingIgnoreCaseOrActionContainingIgnoreCase(
        String email, String action, Pageable pageable
    );

    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);
}
