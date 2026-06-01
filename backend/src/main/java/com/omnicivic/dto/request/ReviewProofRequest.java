package com.omnicivic.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ReviewProofRequest(
    @NotBlank String decision,       // "APPROVE" or "REJECT"
    String rejectionReason,          // required when decision = REJECT
    Long reassignToStaffId           // optional: reassign to different staff on reject
) {}
