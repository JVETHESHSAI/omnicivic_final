package com.omnicivic.controller;

import com.omnicivic.dto.request.BrandingRequest;
import com.omnicivic.dto.request.CreateCommunityRequest;
import com.omnicivic.dto.request.MapRequest;
import com.omnicivic.dto.response.CommunityBrandingResponse;
import com.omnicivic.service.CommunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    // Super Admin: register a community
    @PostMapping("/communities")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> registerCommunity(
            @Valid @RequestBody CreateCommunityRequest request) {
        return ResponseEntity.ok(communityService.registerCommunity(request));
    }

    // Super Admin: list all communities
    @GetMapping("/communities")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<CommunityBrandingResponse>> getAllCommunities() {
        return ResponseEntity.ok(communityService.getAllCommunities());
    }

    // Super Admin: list communities with their admin credentials (visible while admin
    // hasn't reset password yet). Used by Super Admin Communities tab.
    @GetMapping("/communities/with-credentials")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getCommunitiesWithCreds() {
        return ResponseEntity.ok(communityService.getCommunitiesWithAdminCreds());
    }

    // Public: get branding by prefix (used by login page to load theme)
    @GetMapping("/community/public/{prefix}")
    public ResponseEntity<CommunityBrandingResponse> getPublicBranding(@PathVariable String prefix) {
        return ResponseEntity.ok(communityService.getPublicBranding(prefix));
    }

    // Authenticated: get own community profile
    @GetMapping("/community/profile")
    public ResponseEntity<CommunityBrandingResponse> getCommunityProfile() {
        return ResponseEntity.ok(communityService.getCommunityProfile());
    }

    // Admin only: update branding
    @PutMapping("/community/branding")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommunityBrandingResponse> updateBranding(
            @RequestBody BrandingRequest request) {
        return ResponseEntity.ok(communityService.updateBranding(request));
    }

    // Admin / Co-Admin: update map
    @PutMapping("/community/map")
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<CommunityBrandingResponse> updateMap(
            @RequestBody MapRequest request) {
        return ResponseEntity.ok(communityService.updateMap(request));
    }

    // Super Admin: deactivate (remove) a community and lock all its users out
    @DeleteMapping("/communities/{prefix}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> deactivateCommunity(@PathVariable String prefix) {
        return ResponseEntity.ok(communityService.deactivateCommunity(prefix));
    }
}
