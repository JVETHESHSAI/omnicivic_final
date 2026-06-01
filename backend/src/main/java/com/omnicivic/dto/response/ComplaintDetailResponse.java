package com.omnicivic.dto.response;

import com.omnicivic.enums.ComplaintStatus;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Used for DETAIL view (single complaint) — includes full media images.
 * Never sent in list responses to keep payloads small.
 */
public record ComplaintDetailResponse(
    Long id,
    Long communityComplaintNumber,
    String communityPrefix,
    String categoryName,
    Long categoryId,
    String submittedByUsername,
    String assignedToUsername,
    String description,
    Double latitude,
    Double longitude,
    ComplaintStatus status,
    int upvoteCount,
    boolean canUpvote,
    String resolutionNote,
    LocalDateTime estimatedResolutionAt,
    List<String> mediaBase64List,
    List<ComplaintProofResponse> proofs,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    LocalDateTime resolvedAt
) {}
