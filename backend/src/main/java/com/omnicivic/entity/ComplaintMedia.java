package com.omnicivic.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_media")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "community_prefix", nullable = false, length = 4)
    private String communityPrefix;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "media_type")
    private String mediaType;

    @Column(name = "data_base64", columnDefinition = "LONGTEXT", nullable = false)
    private String dataBase64;

    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}
