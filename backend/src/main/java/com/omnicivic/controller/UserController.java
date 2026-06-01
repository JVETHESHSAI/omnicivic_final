package com.omnicivic.controller;

import com.omnicivic.dto.request.CreateUserRequest;
import com.omnicivic.dto.response.CreateUserResponse;
import com.omnicivic.dto.response.UserResponse;
import com.omnicivic.enums.Role;
import com.omnicivic.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @RequestBody UserService.UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(required = false) String role) {
        if (role != null) {
            return ResponseEntity.ok(userService.getUsersByRole(Role.valueOf(role.toUpperCase())));
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/residents")
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<CreateUserResponse> createResident(
            @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.createResident(request));
    }

    @PostMapping("/staff")
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<CreateUserResponse> createStaff(
            @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.createStaff(request));
    }

    @PostMapping("/admins")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CreateUserResponse> createCoAdmin(
            @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.createCoAdmin(request));
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deactivateUser(id));
    }
}
