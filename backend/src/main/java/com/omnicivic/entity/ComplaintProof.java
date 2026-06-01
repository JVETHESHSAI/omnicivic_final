package com.omnicivic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Proof submitted by staff after completing work.
 * Admin reviews this to accept or reject before closing.
 */
@Entity
@Table(name = "complaint_proof")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintProof {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "community_prefix", nullable = false, length = 4)
    private String communityPrefix;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by", nullable = false)
    private UserAccount submittedBy;

    /** Staff's note describing what was done */
    @Column(name = "work_note", columnDefinition = "TEXT", nullable = false)
    private String workNote;

    /** Base64-encoded proof image (optional but strongly encouraged) */
    @Column(name = "image_base64", columnDefinition = "LONGTEXT")
    private String imageBase64;

    /** PENDING / APPROVED / REJECTED */
    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    /** Admin's rejection reason (filled when rejected) */
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private UserAccount reviewedBy;

    @Column(name = "submitted_at", updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }
}
