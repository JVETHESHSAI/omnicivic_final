package com.omnicivic.dto.request;

public record BrandingRequest(
    String logoBase64,
    String bannerBase64,
    String themeColor
) {}
