package com.omnicivic.entity;

import com.omnicivic.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_account",
    uniqueConstraints = @UniqueConstraint(columnNames = "username"),
    indexes = {
        @Index(name = "idx_user_prefix",       columnList = "community_prefix"),
        @Index(name = "idx_user_prefix_role",  columnList = "community_prefix, role"),
        @Index(name = "idx_user_prefix_active",columnList = "community_prefix, active")
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "community_prefix", nullable = false, length = 4)
    private String communityPrefix;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private String email;
    private String phone;

    @Column(name = "avatar_base64", columnDefinition = "MEDIUMTEXT")
    private String avatarBase64;

    @Column(name = "bio", length = 500)
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "is_first_login", nullable = false)
    private boolean firstLogin = true;

    @Column(name = "temp_password_plain", length = 50)
    private String tempPasswordPlain;

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
