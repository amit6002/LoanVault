package com.loanvault.repository;

import com.loanvault.entity.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ============================================================
 * TICKET MESSAGE REPOSITORY
 * Queries chat messages and unread message notifications.
 * ============================================================
 */
@Repository
public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {

    List<TicketMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

    @Query("SELECT COUNT(m) FROM TicketMessage m WHERE m.ticket.borrower.id = :borrowerId AND m.senderRole = 'OFFICER' AND m.isRead = false")
    long countUnreadOfficerMessagesForBorrower(@Param("borrowerId") Long borrowerId);
}
