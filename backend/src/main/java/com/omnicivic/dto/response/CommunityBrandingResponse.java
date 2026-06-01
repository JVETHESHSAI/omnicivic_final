package com.omnicivic.dto.response;

public record CommunityBrandingResponse(
    String communityPrefix,
    String name,
    String logoBase64,
    String bannerBase64,
    String themeColor,
    Double mapCenterLat,
    Double mapCenterLng,
    Integer mapZoom,
    String mapBoundary,
    String websiteUrl,
    String instagramUrl,
    String facebookUrl,
    String twitterUrl
) {}
