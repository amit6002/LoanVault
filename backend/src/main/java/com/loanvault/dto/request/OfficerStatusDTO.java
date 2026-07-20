package com.loanvault.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ============================================================
 * OFFICER STATUS REQUEST DTO
 * Used by admins/managers to toggle officer active/leave status.
 * ============================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficerStatusDTO {
    private Boolean active;
    private Boolean onLeave;
}
