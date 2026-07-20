package com.loanvault.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ============================================================
 * ADD MESSAGE REQUEST DTO
 * Data passed when posting a new chat message in a ticket thread.
 * ============================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddMessageRequestDTO {
    private String text;
}
