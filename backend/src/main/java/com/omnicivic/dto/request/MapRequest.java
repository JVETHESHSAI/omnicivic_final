package com.omnicivic.dto.request;

public record MapRequest(
    Double mapCenterLat,
    Double mapCenterLng,
    Integer mapZoom,
    String mapBoundary
) {}
