package com.omnicivic.controller;

import com.omnicivic.dto.response.UserResponse;
import com.omnicivic.entity.UserAccount;
import com.omnicivic.enums.Role;
import com.omnicivic.exception.BadRequestException;
import com.omnicivic.repository.UserAccountRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * One-time bootstrap endpoint to create the FIRST super admin.
 * Once a super admin exists, this endpoint refuses further requests.
 */
@RestController
@RequestMapping("/bootstrap")
@RequiredArgsConstructor
public class SuperAdminBootstrapController {

    private final UserAccountRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> bootstrapStatus() {
        boolean exists = userRepo.findAllByCommunityPrefixAndRoleAndActiveTrue("", Role.SUPER_ADMIN)
            .stream().findAny().isPresent();
        return ResponseEntity.ok(Map.of("superAdminExists", exists));
    }

    @PostMapping("/super-admin")
    public ResponseEntity<UserResponse> createFirstSuperAdmin(
            @Valid @RequestBody BootstrapRequest request) {

        boolean exists = userRepo.findAllByCommunityPrefixAndRoleAndActiveTrue("", Role.SUPER_ADMIN)
            .stream().findAny().isPresent();

        if (exists) {
            throw new BadRequestException(
                "Super admin already exists. This endpoint is disabled.");
        }

        if (userRepo.existsByUsername(request.username())) {
            throw new BadRequestException("Username already taken: " + request.username());
        }

        UserAccount admin = UserAccount.builder()
            .communityPrefix("")
            .username(request.username())
            .password(passwordEncoder.encode(request.password()))
            .firstName(request.firstName())
            .lastName(request.lastName())
            .email(request.email())
            .role(Role.SUPER_ADMIN)
            .firstLogin(false)
            .active(true)
            .build();

        UserAccount saved = userRepo.save(admin);

        return ResponseEntity.ok(new UserResponse(
            saved.getId(), saved.getUsername(), saved.getFirstName(), saved.getLastName(),
            saved.getEmail(), saved.getPhone(), null, null,
            saved.getRole(), saved.getCommunityPrefix(),
            saved.isActive(), saved.isFirstLogin(), saved.getCreatedAt()
        ));
    }

    public record BootstrapRequest(
        @NotBlank String username,
        @NotBlank @Size(min = 8) String password,
        @NotBlank String firstName,
        @NotBlank String lastName,
        String email
    ) {}
}
