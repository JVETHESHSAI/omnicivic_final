package com.omnicivic.service;

import com.omnicivic.dto.request.LoginRequest;
import com.omnicivic.dto.request.ResetPasswordRequest;
import com.omnicivic.dto.response.AuthResponse;
import com.omnicivic.dto.response.CommunityBrandingResponse;
import com.omnicivic.entity.Community;
import com.omnicivic.entity.UserAccount;
import com.omnicivic.exception.BadRequestException;
import com.omnicivic.exception.ResourceNotFoundException;
import com.omnicivic.repository.CommunityRepository;
import com.omnicivic.repository.UserAccountRepository;
import com.omnicivic.util.JwtUtil;
import com.omnicivic.util.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAccountRepository userRepo;
    private final CommunityRepository communityRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        UserAccount user = userRepo.findByUsername(request.username())
            .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!user.isActive()) {
            throw new BadCredentialsException("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(
            user.getId(), user.getUsername(), user.getRole(),
            user.getCommunityPrefix(), user.isFirstLogin()
        );

        CommunityBrandingResponse branding = null;
        if (user.getCommunityPrefix() != null && !user.getCommunityPrefix().isEmpty()) {
            branding = communityRepo.findByCommunityPrefix(user.getCommunityPrefix())
                .map(this::toBrandingResponse).orElse(null);
        }

        return new AuthResponse(token, user.getUsername(),
            user.getFirstName(), user.getLastName(), user.getAvatarBase64(),
            user.getRole(), user.getCommunityPrefix(), user.isFirstLogin(), branding);
    }

    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        Long userId = SecurityContextUtil.getCurrentUserId();
        UserAccount user = userRepo.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setFirstLogin(false);
        user.setTempPasswordPlain(null);  // clear once user has set their own password
        userRepo.save(user);

        String token = jwtUtil.generateToken(
            user.getId(), user.getUsername(), user.getRole(),
            user.getCommunityPrefix(), false
        );

        CommunityBrandingResponse branding = null;
        if (user.getCommunityPrefix() != null && !user.getCommunityPrefix().isEmpty()) {
            branding = communityRepo.findByCommunityPrefix(user.getCommunityPrefix())
                .map(this::toBrandingResponse).orElse(null);
        }

        return new AuthResponse(token, user.getUsername(),
            user.getFirstName(), user.getLastName(), user.getAvatarBase64(),
            user.getRole(), user.getCommunityPrefix(), false, branding);
    }

    private CommunityBrandingResponse toBrandingResponse(Community c) {
        return new CommunityBrandingResponse(
            c.getCommunityPrefix(), c.getName(), c.getLogoBase64(),
            c.getBannerBase64(), c.getThemeColor(),
            c.getMapCenterLat(), c.getMapCenterLng(), c.getMapZoom(), c.getMapBoundary(),
            c.getWebsiteUrl(), c.getInstagramUrl(), c.getFacebookUrl(), c.getTwitterUrl()
        );
    }
}
