package com.omnicivic.util;

import com.omnicivic.filter.JwtAuthFilter.JwtDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

public class SecurityContextUtil {

    public static JwtDetails getCurrentUserDetails() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof UsernamePasswordAuthenticationToken token
            && token.getDetails() instanceof JwtDetails details) {
            return details;
        }
        throw new IllegalStateException("No authenticated user in context");
    }

    public static Long getCurrentUserId() {
        return getCurrentUserDetails().userId();
    }

    public static String getCurrentCommunityPrefix() {
        return getCurrentUserDetails().communityPrefix();
    }

    public static String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
