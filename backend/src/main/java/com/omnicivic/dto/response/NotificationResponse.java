package com.omnicivic.dto.response;

import com.omnicivic.enums.NotificationType;
import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    NotificationType type,
    String message,
    Long complaintId,
    boolean read,
    LocalDateTime createdAt
) {}
