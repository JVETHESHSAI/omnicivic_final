package com.omnicivic.service;

import com.omnicivic.entity.AuditLog;
import com.omnicivic.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepo;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String communityPrefix, String performedBy, String action,
                    String entityType, String entityId, String details) {
        auditLogRepo.save(AuditLog.builder()
            .communityPrefix(communityPrefix)
            .performedBy(performedBy)
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .details(details)
            .build());
    }

    public Page<AuditLog> getLogsForCommunity(String prefix, int page, int size) {
        return auditLogRepo.findAllByCommunityPrefixOrderByCreatedAtDesc(prefix, PageRequest.of(page, size));
    }

    public Page<AuditLog> getAllLogs(int page, int size) {
        return auditLogRepo.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }
}
