package com.omnicivic.dto.response;

import com.omnicivic.enums.Role;
import java.time.LocalDateTime;

public record UserResponse(
    Long id,
    String username,
    String firstName,
    String lastName,
    String email,
    String phone,
    String avatarBase64,
    String bio,
    Role role,
    String communityPrefix,
    boolean active,
    boolean firstLogin,
    LocalDateTime createdAt
) {}
