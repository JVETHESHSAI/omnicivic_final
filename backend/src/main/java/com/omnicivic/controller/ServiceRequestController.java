package com.omnicivic.controller;

import com.omnicivic.dto.request.ApproveServiceRequestDto;
import com.omnicivic.dto.request.SubmitServiceRequestDto;
import com.omnicivic.dto.response.ServiceRequestResponse;
import com.omnicivic.service.ServiceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/service-requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService service;

    /** Public endpoint — called by the company website. No auth required. */
    @PostMapping("/submit")
    public ResponseEntity<ServiceRequestResponse> submit(
            @Valid @RequestBody SubmitServiceRequestDto dto) {
        return ResponseEntity.ok(service.submitRequest(dto));
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<ServiceRequestResponse>> getAll(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(service.getAllRequests(status));
    }

    @GetMapping("/counts")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Long>> getCounts() {
        return ResponseEntity.ok(service.getCounts());
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> approve(
            @PathVariable Long id,
            @Valid @RequestBody ApproveServiceRequestDto dto) {
        return ResponseEntity.ok(service.approve(id, dto));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ServiceRequestResponse> reject(
            @PathVariable Long id,
            @RequestParam(defaultValue = "") String reason) {
        return ResponseEntity.ok(service.reject(id, reason));
    }
}
