package com.omnicivic.dto.response;

import java.time.LocalDateTime;

public record ComplaintProofResponse(
    Long id,
    String submittedByUsername,
    String workNote,
    String imageBase64,
    String status,           // PENDING / APPROVED / REJECTED
    String rejectionReason,
    String reviewedByUsername,
    LocalDateTime submittedAt,
    LocalDateTime reviewedAt
) {}
