package com.omnicivic.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "community")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "community_prefix", unique = true, nullable = false, length = 4)
    private String communityPrefix;

    @Column(nullable = false)
    private String name;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone")
    private String contactPhone;

    // Branding
    @Column(name = "logo_base64", columnDefinition = "LONGTEXT")
    private String logoBase64;

    @Column(name = "banner_base64", columnDefinition = "LONGTEXT")
    private String bannerBase64;

    @Column(name = "theme_color", length = 7)
    private String themeColor;

    // Map boundary (GeoJSON polygon as string)
    @Column(name = "map_boundary", columnDefinition = "TEXT")
    private String mapBoundary;

    // Social media links
    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "instagram_url")
    private String instagramUrl;

    @Column(name = "facebook_url")
    private String facebookUrl;

    @Column(name = "twitter_url")
    private String twitterUrl;

    @Column(name = "map_center_lat")
    private Double mapCenterLat;

    @Column(name = "map_center_lng")
    private Double mapCenterLng;

    @Column(name = "map_zoom")
    private Integer mapZoom;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
