package com.loanvault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ============================================================
 * LOAN ASSIGNMENT RESULT DTO
 * Summarizes the output of dynamic Round Robin loan assignment.
 * ============================================================
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanAssignmentResultDTO {
    private String applicationReferenceId;
    private Long branchId;
    private String branchCode;
    private String branchName;
    private Long managerId;
    private String managerName;
    private Long officerId;
    private String officerName;
    private String officerEmail;
    private int assignedOfficerIndex;
    private String assignmentStatus; // e.g. "ASSIGNED", "PENDING_ASSIGNMENT"
    private String message;
    private LocalDateTime timestamp;
}
