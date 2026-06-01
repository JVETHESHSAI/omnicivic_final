package com.omnicivic.controller;

import com.omnicivic.entity.AuditLog;
import com.omnicivic.service.AuditService;
import com.omnicivic.util.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    // Super Admin: global audit logs
    @GetMapping("/logs")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Page<AuditLog>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(auditService.getAllLogs(page, size));
    }

    // Admin/Co-Admin: community-scoped logs
    @GetMapping("/community/logs")
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<Page<AuditLog>> getCommunityLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        return ResponseEntity.ok(auditService.getLogsForCommunity(prefix, page, size));
    }
}
