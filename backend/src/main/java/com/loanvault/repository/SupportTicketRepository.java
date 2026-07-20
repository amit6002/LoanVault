package com.loanvault.repository;

import com.loanvault.entity.SupportTicket;
import com.loanvault.entity.SupportTicket.TicketStatus;
import com.loanvault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ============================================================
 * SUPPORT TICKET REPOSITORY
 * Query methods for borrower tickets and officer helpdesk queue.
 * ============================================================
 */
@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    Optional<SupportTicket> findByTicketId(String ticketId);

    List<SupportTicket> findByBorrowerOrderByCreatedAtDesc(User borrower);

    List<SupportTicket> findByBorrowerIdOrderByCreatedAtDesc(Long borrowerId);

    List<SupportTicket> findAllByOrderByCreatedAtDesc();

    List<SupportTicket> findByStatusInOrderByCreatedAtDesc(List<TicketStatus> statuses);
}
