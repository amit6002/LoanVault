package com.loanvault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * ============================================================
 * SUPPORT TICKET DTO
 * Transports support ticket details and full message history.
 * ============================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketDTO {
    private Long id;
    private String ticketId;
    private Long borrowerId;
    private String borrowerName;
    private String borrowerEmail;
    private String category;
    private String subject;
    private String description;
    private String status;
    private String createdAt;
    private List<TicketMessageDTO> messages;
    private long unreadMessagesCount;
}
