package com.omnicivic.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SubmitProofRequest(
    @NotBlank String workNote,
    String imageBase64   // optional but encouraged
) {}
