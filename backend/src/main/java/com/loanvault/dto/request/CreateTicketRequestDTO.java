package com.loanvault.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ============================================================
 * CREATE TICKET REQUEST DTO
 * Data passed when a borrower raises a new support query.
 * ============================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketRequestDTO {
    private String category;
    private String subject;
    private String description;
}
