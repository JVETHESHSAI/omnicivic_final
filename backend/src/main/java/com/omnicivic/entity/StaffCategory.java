package com.omnicivic.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "staff_category",
    uniqueConstraints = @UniqueConstraint(columnNames = {"staff_id", "category_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "community_prefix", nullable = false, length = 4)
    private String communityPrefix;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private UserAccount staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
