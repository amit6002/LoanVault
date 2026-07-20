package com.loanvault.service.impl;

import com.loanvault.dto.request.CreateTicketRequestDTO;
import com.loanvault.dto.response.SupportTicketDTO;
import com.loanvault.dto.response.TicketMessageDTO;
import com.loanvault.entity.SupportTicket;
import com.loanvault.entity.SupportTicket.TicketStatus;
import com.loanvault.entity.TicketMessage;
import com.loanvault.entity.User;
import com.loanvault.entity.User.Role;
import com.loanvault.repository.SupportTicketRepository;
import com.loanvault.repository.TicketMessageRepository;
import com.loanvault.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

/**
 * ============================================================
 * SUPPORT TICKET SERVICE IMPLEMENTATION
 * Manages continuous multi-turn messaging, automatic status updates
 * (OPEN -> OFFICER_REPLIED -> REOPENED -> RESOLVED), and unread notifications.
 * ============================================================
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final TicketMessageRepository messageRepository;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy hh:mm a");

    @Override
    @Transactional
    public SupportTicketDTO createTicket(User borrower, CreateTicketRequestDTO request) {
        String generatedId = "TKT-2026-" + String.format("%04d", new Random().nextInt(9999));

        SupportTicket ticket = SupportTicket.builder()
                .ticketId(generatedId)
                .borrower(borrower)
                .category(request.getCategory())
                .subject(request.getSubject())
                .description(request.getDescription())
                .status(TicketStatus.OPEN)
                .messages(new ArrayList<>())
                .build();

        TicketMessage initialMessage = TicketMessage.builder()
                .ticket(ticket)
                .sender(borrower)
                .senderRole("BORROWER")
                .messageText(request.getDescription())
                .isRead(true)
                .build();

        ticket.addMessage(initialMessage);
        SupportTicket saved = ticketRepository.save(ticket);
        log.info("Created Support Ticket [{}] for Borrower [{}]", saved.getTicketId(), borrower.getEmail());

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public SupportTicketDTO addMessage(Long ticketId, User sender, String messageText) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found with ID: " + ticketId));

        boolean isOfficer = sender.getRole() == Role.OFFICER || sender.getRole() == Role.MANAGER;
        String senderRole = isOfficer ? "OFFICER" : "BORROWER";

        TicketMessage message = TicketMessage.builder()
                .ticket(ticket)
                .sender(sender)
                .senderRole(senderRole)
                .messageText(messageText)
                .isRead(!isOfficer) // Borrower messages read by default for borrower, officer messages unread until borrower views
                .build();

        ticket.addMessage(message);

        // Update status based on sender
        if (isOfficer) {
            ticket.setStatus(TicketStatus.OFFICER_REPLIED);
        } else {
            // If borrower replies after officer response or resolution, mark REOPENED
            if (ticket.getStatus() == TicketStatus.OFFICER_REPLIED || ticket.getStatus() == TicketStatus.RESOLVED) {
                ticket.setStatus(TicketStatus.REOPENED);
            }
        }

        SupportTicket saved = ticketRepository.save(ticket);
        log.info("Added message to Ticket [{}] by [{}] ({}) -> Status: [{}]",
                ticket.getTicketId(), sender.getName(), senderRole, ticket.getStatus());

        return mapToDTO(saved);
    }

    @Override
    @Transactional
    public SupportTicketDTO updateStatus(Long ticketId, String newStatus, User actor) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found with ID: " + ticketId));

        TicketStatus targetStatus = TicketStatus.valueOf(newStatus.toUpperCase());
        ticket.setStatus(targetStatus);

        if (targetStatus == TicketStatus.RESOLVED || targetStatus == TicketStatus.CLOSED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        SupportTicket saved = ticketRepository.save(ticket);
        log.info("Updated Ticket [{}] status to [{}] by User [{}]", ticket.getTicketId(), targetStatus, actor.getEmail());

        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketDTO> getBorrowerTickets(User borrower) {
        return ticketRepository.findByBorrowerOrderByCreatedAtDesc(borrower).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupportTicketDTO> getOfficerTickets() {
        return ticketRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SupportTicketDTO getTicketById(Long ticketId, User currentUser) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found with ID: " + ticketId));

        if (currentUser.getRole() == Role.BORROWER && ticket.getBorrower().getId().equals(currentUser.getId())) {
            markTicketMessagesAsRead(ticketId, currentUser);
        }

        return mapToDTO(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadOfficerMessagesCount(User borrower) {
        return messageRepository.countUnreadOfficerMessagesForBorrower(borrower.getId());
    }

    @Override
    @Transactional
    public void markTicketMessagesAsRead(Long ticketId, User currentUser) {
        List<TicketMessage> messages = messageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        boolean updated = false;
        for (TicketMessage msg : messages) {
            if ("OFFICER".equals(msg.getSenderRole()) && !msg.isRead()) {
                msg.setRead(true);
                updated = true;
            }
        }
        if (updated) {
            messageRepository.saveAll(messages);
        }
    }

    private SupportTicketDTO mapToDTO(SupportTicket ticket) {
        List<TicketMessageDTO> msgDtos = ticket.getMessages().stream()
                .map(m -> TicketMessageDTO.builder()
                        .id(m.getId())
                        .senderRole(m.getSenderRole())
                        .senderName(m.getSender() != null ? m.getSender().getName() : "User")
                        .text(m.getMessageText())
                        .timestamp(m.getCreatedAt() != null ? m.getCreatedAt().format(TIME_FORMATTER) : "")
                        .isRead(m.isRead())
                        .createdAt(m.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        long unreadCount = msgDtos.stream()
                .filter(m -> "OFFICER".equals(m.getSenderRole()) && !m.isRead())
                .count();

        return SupportTicketDTO.builder()
                .id(ticket.getId())
                .ticketId(ticket.getTicketId())
                .borrowerId(ticket.getBorrower() != null ? ticket.getBorrower().getId() : null)
                .borrowerName(ticket.getBorrower() != null ? ticket.getBorrower().getName() : "N/A")
                .borrowerEmail(ticket.getBorrower() != null ? ticket.getBorrower().getEmail() : "N/A")
                .category(ticket.getCategory())
                .subject(ticket.getSubject())
                .description(ticket.getDescription())
                .status(ticket.getStatus().name())
                .createdAt(ticket.getCreatedAt() != null ? ticket.getCreatedAt().format(TIME_FORMATTER) : "")
                .messages(msgDtos)
                .unreadMessagesCount(unreadCount)
                .build();
    }
}
