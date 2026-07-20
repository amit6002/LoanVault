package com.loanvault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ============================================================
 * BRANCH RESPONSE DTO
 * Transports servicing branch details, manager info, and officer metrics.
 * ============================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchDTO {
    private Long id;
    private String code;
    private String name;
    private String city;
    private String state;
    private String pincode;
    private Long managerId;
    private String managerName;
    private String managerEmail;
    private boolean active;
    private int totalOfficersCount;
    private int activeOfficersCount;
    private int lastAssignedOfficerIndex;
    private Long lastAssignedOfficerId;
}
