package com.omnicivic.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SubmitServiceRequestDto(
    @NotBlank String organizationName,
    @NotBlank String ownerName,
    @NotBlank @Email String ownerEmail,
    String ownerPhone,
    String description,
    String address,
    Double addressLat,
    Double addressLng,
    String logoBase64,
    String websiteUrl,
    String instagramUrl,
    String facebookUrl,
    String twitterUrl
) {}
