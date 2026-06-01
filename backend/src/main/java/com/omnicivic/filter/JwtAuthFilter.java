package com.omnicivic.filter;

import com.omnicivic.entity.UserAccount;
import com.omnicivic.repository.UserAccountRepository;
import com.omnicivic.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserAccountRepository userRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.extractUsername(token);
                    String role = jwtUtil.extractRole(token).name();
                    String prefix = jwtUtil.extractCommunityPrefix(token);
                    Long userId = jwtUtil.extractUserId(token);
                    Boolean isFirstLogin = jwtUtil.extractIsFirstLogin(token);

                    // Verify the user still exists AND is still active.
                    // Deactivated users (or those whose community has been removed)
                    // are blocked at this layer regardless of token validity.
                    Optional<UserAccount> userOpt = userRepo.findByUsername(username);
                    if (userOpt.isEmpty() || !userOpt.get().isActive()) {
                        rejectWith(response, HttpServletResponse.SC_UNAUTHORIZED,
                            "ACCOUNT_INACTIVE", "Your account has been deactivated.");
                        return;
                    }

                    var auth = new UsernamePasswordAuthenticationToken(
                        username,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                    auth.setDetails(new JwtDetails(userId, prefix, isFirstLogin, role));
                    SecurityContextHolder.getContext().setAuthentication(auth);

                    // First-login gate
                    if (Boolean.TRUE.equals(isFirstLogin)) {
                        String path = request.getRequestURI();
                        if (!path.startsWith("/auth/reset-password") && !path.startsWith("/auth/logout")) {
                            rejectWith(response, HttpServletResponse.SC_FORBIDDEN,
                                "PASSWORD_RESET_REQUIRED",
                                "Please reset your password before continuing.");
                            return;
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Cannot set user authentication: {}", e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }

    private void rejectWith(HttpServletResponse response, int status, String error, String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write(
            "{\"error\":\"" + error + "\",\"message\":\"" + message + "\"}"
        );
    }

    public record JwtDetails(Long userId, String communityPrefix, Boolean isFirstLogin, String role) {}
}
