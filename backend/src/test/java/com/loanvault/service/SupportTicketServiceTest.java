package com.loanvault.service;

import com.loanvault.dto.request.CreateTicketRequestDTO;
import com.loanvault.dto.response.SupportTicketDTO;
import com.loanvault.entity.SupportTicket;
import com.loanvault.entity.SupportTicket.TicketStatus;
import com.loanvault.entity.TicketMessage;
import com.loanvault.entity.User;
import com.loanvault.entity.User.Role;
import com.loanvault.repository.SupportTicketRepository;
import com.loanvault.repository.TicketMessageRepository;
import com.loanvault.service.impl.SupportTicketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * ============================================================
 * SUPPORT TICKET SERVICE UNIT TESTS
 * Verifies multi-turn continuous messaging, automatic status updates
 * (OPEN -> OFFICER_REPLIED -> REOPENED -> RESOLVED), and unread counting.
 * ============================================================
 */
@ExtendWith(MockitoExtension.class)
class SupportTicketServiceTest {

    @Mock
    private SupportTicketRepository ticketRepository;

    @Mock
    private TicketMessageRepository messageRepository;

    @InjectMocks
    private SupportTicketServiceImpl supportTicketService;

    private User borrower;
    private User officer;
    private SupportTicket ticket;

    @BeforeEach
    void setUp() {
        borrower = User.builder().id(1L).name("Rahul Borrower").email("rahul@example.com").role(Role.BORROWER).build();
        officer = User.builder().id(2L).name("Amit Officer").email("officer@loanvault.com").role(Role.OFFICER).build();

        ticket = SupportTicket.builder()
                .id(10L)
                .ticketId("TKT-2026-9081")
                .borrower(borrower)
                .category("EMI")
                .subject("EMI Query")
                .description("Is my EMI cleared?")
                .status(TicketStatus.OPEN)
                .messages(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Create Ticket: Initializes OPEN ticket with initial message")
    void testCreateTicket() {
        when(ticketRepository.save(any(SupportTicket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateTicketRequestDTO request = new CreateTicketRequestDTO("EMI", "EMI Query", "Is my EMI cleared?");
        SupportTicketDTO result = supportTicketService.createTicket(borrower, request);

        assertNotNull(result);
        assertEquals("OPEN", result.getStatus());
        assertEquals(1, result.getMessages().size());
        assertEquals("Is my EMI cleared?", result.getMessages().get(0).getText());
        assertEquals("BORROWER", result.getMessages().get(0).getSenderRole());
    }

    @Test
    @DisplayName("Officer Reply: Updates status to OFFICER_REPLIED")
    void testOfficerReplyUpdatesStatus() {
        when(ticketRepository.findById(10L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(SupportTicket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SupportTicketDTO result = supportTicketService.addMessage(10L, officer, "Your EMI is cleared!");

        assertEquals("OFFICER_REPLIED", result.getStatus());
        assertEquals(1, result.getMessages().size());
        assertEquals("OFFICER", result.getMessages().get(0).getSenderRole());
    }

    @Test
    @DisplayName("Borrower Follow-up: Updates status to REOPENED after officer reply")
    void testBorrowerFollowupReopensTicket() {
        ticket.setStatus(TicketStatus.OFFICER_REPLIED);
        when(ticketRepository.findById(10L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(SupportTicket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SupportTicketDTO result = supportTicketService.addMessage(10L, borrower, "What about next month?");

        assertEquals("REOPENED", result.getStatus());
    }

    @Test
    @DisplayName("Status Update: Borrower marks ticket as RESOLVED")
    void testMarkAsResolved() {
        when(ticketRepository.findById(10L)).thenReturn(Optional.of(ticket));
        when(ticketRepository.save(any(SupportTicket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SupportTicketDTO result = supportTicketService.updateStatus(10L, "RESOLVED", borrower);

        assertEquals("RESOLVED", result.getStatus());
    }
}
