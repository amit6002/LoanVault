package com.loanvault.service;

import com.loanvault.dto.request.CreateTicketRequestDTO;
import com.loanvault.dto.response.SupportTicketDTO;
import com.loanvault.entity.User;

import java.util.List;

/**
 * ============================================================
 * SUPPORT TICKET SERVICE INTERFACE
 * Manages ticket creation, multi-turn messaging, status transitions,
 * and unread notifications.
 * ============================================================
 */
public interface SupportTicketService {

    SupportTicketDTO createTicket(User borrower, CreateTicketRequestDTO request);

    SupportTicketDTO addMessage(Long ticketId, User sender, String messageText);

    SupportTicketDTO updateStatus(Long ticketId, String newStatus, User actor);

    List<SupportTicketDTO> getBorrowerTickets(User borrower);

    List<SupportTicketDTO> getOfficerTickets();

    SupportTicketDTO getTicketById(Long ticketId, User currentUser);

    long getUnreadOfficerMessagesCount(User borrower);

    void markTicketMessagesAsRead(Long ticketId, User currentUser);
}
