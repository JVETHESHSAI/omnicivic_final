package com.omnicivic.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AssignComplaintRequest(
    @NotNull Long staffId,
    LocalDateTime estimatedResolutionAt
) {}
