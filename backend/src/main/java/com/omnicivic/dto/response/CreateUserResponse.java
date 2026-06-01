package com.omnicivic.dto.response;

import com.omnicivic.enums.Role;

public record CreateUserResponse(
    Long id,
    String username,
    String temporaryPassword,
    String firstName,
    String lastName,
    String email,
    Role role,
    String communityPrefix
) {}
