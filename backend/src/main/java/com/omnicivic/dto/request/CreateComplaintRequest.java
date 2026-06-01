package com.omnicivic.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateComplaintRequest(
    @NotNull Long categoryId,
    @NotBlank String description,
    @NotNull Double latitude,
    @NotNull Double longitude,
    List<String> mediaBase64List  // optional photo attachments
) {}
