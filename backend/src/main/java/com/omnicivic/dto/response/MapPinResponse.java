package com.omnicivic.dto.response;

import com.omnicivic.enums.ComplaintStatus;

public record MapPinResponse(
    Long complaintId,
    Double latitude,
    Double longitude,
    ComplaintStatus status,
    String categoryName,
    String description
) {}
