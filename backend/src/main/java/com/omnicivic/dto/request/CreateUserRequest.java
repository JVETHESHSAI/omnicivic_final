package com.omnicivic.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateUserRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    String email,
    String phone
) {}
