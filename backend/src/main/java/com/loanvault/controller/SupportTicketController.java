package com.loanvault.controller;

import com.loanvault.dto.request.AddMessageRequestDTO;
import com.loanvault.dto.request.CreateTicketRequestDTO;
import com.loanvault.dto.response.ApiResponse;
import com.loanvault.dto.response.SupportTicketDTO;
import com.loanvault.entity.User;
import com.loanvault.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ============================================================
 * SUPPORT TICKET REST CONTROLLER
 * REST APIs for continuous support chat between Borrowers and Officers.
 * ============================================================
 */
@RestController
@RequestMapping("/api/support/tickets")
@RequiredArgsConstructor
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    @PostMapping
    @PreAuthorize("hasRole('BORROWER')")
    public ResponseEntity<ApiResponse> createTicket(
            @RequestBody CreateTicketRequestDTO request,
            @AuthenticationPrincipal User currentUser) {
        SupportTicketDTO ticket = supportTicketService.createTicket(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Ticket created successfully!", ticket));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse> addMessage(
            @PathVariable Long id,
            @RequestBody AddMessageRequestDTO request,
            @AuthenticationPrincipal User currentUser) {
        SupportTicketDTO ticket = supportTicketService.addMessage(id, currentUser, request.getText());
        return ResponseEntity.ok(ApiResponse.success("Message sent successfully!", ticket));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal User currentUser) {
        SupportTicketDTO ticket = supportTicketService.updateStatus(id, status, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated to " + status, ticket));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('BORROWER')")
    public ResponseEntity<List<SupportTicketDTO>> getMyTickets(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(supportTicketService.getBorrowerTickets(currentUser));
    }

    @GetMapping("/officer")
    @PreAuthorize("hasAnyRole('OFFICER', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<SupportTicketDTO>> getOfficerTickets() {
        return ResponseEntity.ok(supportTicketService.getOfficerTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicketDTO> getTicketById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(supportTicketService.getTicketById(id, currentUser));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasRole('BORROWER')")
    public ResponseEntity<Map<String, Object>> getUnreadCount(@AuthenticationPrincipal User currentUser) {
        long count = supportTicketService.getUnreadOfficerMessagesCount(currentUser);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PostMapping("/{id}/read")
    @PreAuthorize("hasRole('BORROWER')")
    public ResponseEntity<ApiResponse> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        supportTicketService.markTicketMessagesAsRead(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Messages marked as read", null));
    }
}
