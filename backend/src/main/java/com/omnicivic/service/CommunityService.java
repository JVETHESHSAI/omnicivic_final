package com.omnicivic.service;

import com.omnicivic.dto.request.BrandingRequest;
import com.omnicivic.dto.request.CreateCommunityRequest;
import com.omnicivic.dto.request.MapRequest;
import com.omnicivic.dto.response.CommunityBrandingResponse;
import com.omnicivic.dto.response.CreateUserResponse;
import com.omnicivic.entity.Community;
import com.omnicivic.entity.UserAccount;
import com.omnicivic.enums.Role;
import com.omnicivic.exception.BadRequestException;
import com.omnicivic.exception.ResourceNotFoundException;
import com.omnicivic.repository.CommunityRepository;
import com.omnicivic.repository.UserAccountRepository;
import com.omnicivic.util.SecurityContextUtil;
import com.omnicivic.util.UsernameGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepo;
    private final UserAccountRepository userRepo;
    private final UsernameGenerator usernameGenerator;
    private final PasswordEncoder passwordEncoder;
    private final DefaultCategorySeeder defaultCategorySeeder;

    @Transactional
    public Map<String, Object> registerCommunity(CreateCommunityRequest request) {
        if (communityRepo.existsByCommunityPrefix(request.communityPrefix())) {
            throw new BadRequestException("Community prefix already in use: " + request.communityPrefix());
        }

        Community community = Community.builder()
            .communityPrefix(request.communityPrefix())
            .name(request.name())
            .contactEmail(request.contactEmail())
            .contactPhone(request.contactPhone())
            .themeColor("#1976D2")
            .build();
        communityRepo.save(community);

        // Keep previous behavior: every new community starts with the standard complaint categories.
        defaultCategorySeeder.seedForCommunity(request.communityPrefix());

        // Auto-generate admin account
        String adminUsername = usernameGenerator.generateForAdmin(request.communityPrefix());
        String tempPassword = usernameGenerator.generateTempPassword();

        UserAccount admin = UserAccount.builder()
            .communityPrefix(request.communityPrefix())
            .username(adminUsername)
            .password(passwordEncoder.encode(tempPassword))
            .firstName(request.adminFirstName())
            .lastName(request.adminLastName())
            .email(request.adminEmail())
            .role(Role.ADMIN)
            .firstLogin(true)
            .active(true)
            .build();
        userRepo.save(admin);

        return Map.of(
            "community", toBrandingResponse(community),
            "admin", new CreateUserResponse(admin.getId(), adminUsername, tempPassword,
                admin.getFirstName(), admin.getLastName(), admin.getEmail(), Role.ADMIN, request.communityPrefix())
        );
    }

    /**
     * Super Admin: list communities WITH their admin credentials (until reset).
     * Plain temp passwords are returned only while user.firstLogin == true.
     */
    public List<Map<String, Object>> getCommunitiesWithAdminCreds() {
        return communityRepo.findAll().stream()
            .map(c -> {
                Map<String, Object> entry = new HashMap<>();
                entry.put("communityPrefix", c.getCommunityPrefix());
                entry.put("name", c.getName());
                entry.put("themeColor", c.getThemeColor());
                entry.put("logoBase64", c.getLogoBase64());
                entry.put("active", c.isActive());
                entry.put("contactEmail", c.getContactEmail());
                entry.put("createdAt", c.getCreatedAt());

                userRepo.findAllByCommunityPrefixAndRoleAndActiveTrue(
                        c.getCommunityPrefix(), com.omnicivic.enums.Role.ADMIN)
                    .stream().findFirst().ifPresent(admin -> {
                        entry.put("adminUsername", admin.getUsername());
                        entry.put("adminEmail", admin.getEmail());
                        entry.put("adminFirstLogin", admin.isFirstLogin());
                        // Only expose plain temp password if user hasn't logged in yet
                        if (admin.isFirstLogin() && admin.getTempPasswordPlain() != null) {
                            entry.put("tempPassword", admin.getTempPasswordPlain());
                        }
                    });
                return entry;
            }).toList();
    }

    public List<CommunityBrandingResponse> getAllCommunities() {
        return communityRepo.findAllByActiveTrue().stream()
            .map(this::toBrandingResponse).toList();
    }

    @Cacheable(value = "branding", key = "#root.target.getCurrentPrefix()")
    public CommunityBrandingResponse getCommunityProfile() {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        return communityRepo.findByCommunityPrefix(prefix)
            .map(this::toBrandingResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Community not found"));
    }

    @Transactional
    @CacheEvict(value = "branding", allEntries = true)
    public CommunityBrandingResponse updateBranding(BrandingRequest request) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Community community = communityRepo.findByCommunityPrefix(prefix)
            .orElseThrow(() -> new ResourceNotFoundException("Community not found"));

        if (request.logoBase64() != null) community.setLogoBase64(request.logoBase64());
        if (request.bannerBase64() != null) community.setBannerBase64(request.bannerBase64());
        if (request.themeColor() != null) community.setThemeColor(request.themeColor());

        return toBrandingResponse(communityRepo.save(community));
    }

    @Transactional
    @CacheEvict(value = "branding", allEntries = true)
    public CommunityBrandingResponse updateMap(MapRequest request) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Community community = communityRepo.findByCommunityPrefix(prefix)
            .orElseThrow(() -> new ResourceNotFoundException("Community not found"));

        if (request.mapCenterLat() != null) community.setMapCenterLat(request.mapCenterLat());
        if (request.mapCenterLng() != null) community.setMapCenterLng(request.mapCenterLng());
        if (request.mapZoom() != null) community.setMapZoom(request.mapZoom());
        if (request.mapBoundary() != null) community.setMapBoundary(request.mapBoundary());

        return toBrandingResponse(communityRepo.save(community));
    }

    @Cacheable(value = "branding", key = "#prefix")
    public CommunityBrandingResponse getPublicBranding(String prefix) {
        return communityRepo.findByCommunityPrefix(prefix.toUpperCase())
            .map(this::toBrandingResponse)
            .orElseThrow(() -> new ResourceNotFoundException("Community not found"));
    }

    /**
     * Super Admin: remove a community.
     * Soft delete — community is marked inactive, all users in that community
     * are deactivated (so their JWTs can't be reused). Data is preserved for audit.
     */
    @Transactional
    public Map<String, Object> deactivateCommunity(String prefix) {
        Community community = communityRepo.findByCommunityPrefix(prefix.toUpperCase())
            .orElseThrow(() -> new ResourceNotFoundException("Community not found"));

        community.setActive(false);
        communityRepo.save(community);

        // Deactivate all users belonging to this community
        var users = userRepo.findAllByCommunityPrefixAndActiveTrue(prefix.toUpperCase());
        users.forEach(u -> u.setActive(false));
        userRepo.saveAll(users);

        return Map.of(
            "communityPrefix", prefix.toUpperCase(),
            "deactivatedUsers", users.size(),
            "message", "Community and all its users have been deactivated."
        );
    }

    private CommunityBrandingResponse toBrandingResponse(Community c) {
        return new CommunityBrandingResponse(
            c.getCommunityPrefix(), c.getName(), c.getLogoBase64(),
            c.getBannerBase64(), c.getThemeColor(),
            c.getMapCenterLat(), c.getMapCenterLng(), c.getMapZoom(), c.getMapBoundary(),
            c.getWebsiteUrl(), c.getInstagramUrl(), c.getFacebookUrl(), c.getTwitterUrl()
        );
    }


    public String getCurrentPrefix() {
        return com.omnicivic.util.SecurityContextUtil.getCurrentCommunityPrefix();
    }
}
