package com.loanvault.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ============================================================
 * SUPPORT TICKET ENTITY
 * Tracks borrower helpdesk requests and continuous chat threads.
 * ============================================================
 */
@Entity
@Table(name = "support_tickets")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ticketId;   // e.g. TKT-2026-9081

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "borrower_id", nullable = false)
    @JsonIgnoreProperties({"password", "authorities", "hibernateLazyInitializer", "handler"})
    private User borrower;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private String category;   // EMI, DOCUMENT, ACCOUNT, GENERAL

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    @Column(length = 1000)
    private String resolutionNote;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<TicketMessage> messages = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime lastUpdatedAt;

    @Column
    private LocalDateTime resolvedAt;

    public void addMessage(TicketMessage message) {
        messages.add(message);
        message.setTicket(this);
        this.lastUpdatedAt = LocalDateTime.now();
    }

    public enum TicketStatus {
        OPEN,
        IN_PROGRESS,
        OFFICER_REPLIED,
        REOPENED,
        RESOLVED,
        CLOSED
    }
}
