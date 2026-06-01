package com.omnicivic.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "complaint_upvote",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_complaint_upvote_complaint_user", columnNames = {"complaint_id", "upvoted_by"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintUpvote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "community_prefix", nullable = false, length = 4)
    private String communityPrefix;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "upvoted_by", nullable = false)
    private UserAccount upvotedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
