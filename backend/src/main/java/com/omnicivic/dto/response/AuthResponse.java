package com.omnicivic.dto.response;

import com.omnicivic.enums.Role;

public record AuthResponse(
    String token,
    String username,
    String firstName,
    String lastName,
    String avatarBase64,
    Role role,
    String communityPrefix,
    boolean isFirstLogin,
    CommunityBrandingResponse branding
) {}
