package com.omnicivic.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ApproveServiceRequestDto(
    @NotBlank
    @Size(min = 4, max = 4)
    @Pattern(regexp = "[A-Z0-9]{4}", message = "Prefix must be 4 uppercase alphanumeric characters")
    String communityPrefix
) {}
