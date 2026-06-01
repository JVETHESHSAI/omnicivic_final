package com.omnicivic.dto.response;

import java.time.LocalDateTime;

public record ServiceRequestResponse(
    Long id,
    String organizationName,
    String ownerName,
    String ownerEmail,
    String ownerPhone,
    String description,
    String address,
    Double addressLat,
    Double addressLng,
    String logoBase64,
    String websiteUrl,
    String instagramUrl,
    String facebookUrl,
    String twitterUrl,
    String status,
    String assignedPrefix,
    String rejectionReason,
    String reviewedBy,
    LocalDateTime submittedAt,
    LocalDateTime reviewedAt
) {}
