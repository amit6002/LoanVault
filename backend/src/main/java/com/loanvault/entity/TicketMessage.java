package com.loanvault.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * ============================================================
 * TICKET MESSAGE ENTITY
 * Represents an individual chat message in a continuous Support Ticket thread.
 * ============================================================
 */
@Entity
@Table(name = "ticket_messages")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class TicketMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "support_ticket_id", nullable = false)
    @JsonIgnoreProperties({"messages", "borrower", "hibernateLazyInitializer", "handler"})
    private SupportTicket ticket;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonIgnoreProperties({"password", "authorities", "hibernateLazyInitializer", "handler"})
    private User sender;

    @Column(nullable = false, length = 20)
    private String senderRole; // "BORROWER" or "OFFICER"

    @Column(nullable = false, length = 2000)
    private String messageText;

    @Column(nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
