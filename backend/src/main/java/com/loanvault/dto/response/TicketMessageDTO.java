package com.loanvault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ============================================================
 * TICKET MESSAGE DTO
 * Transports continuous chat messages between Borrower and Officer.
 * ============================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketMessageDTO {
    private Long id;
    private String senderRole; // "BORROWER" or "OFFICER"
    private String senderName;
    private String text;
    private String timestamp;
    private boolean isRead;
    private LocalDateTime createdAt;
}
