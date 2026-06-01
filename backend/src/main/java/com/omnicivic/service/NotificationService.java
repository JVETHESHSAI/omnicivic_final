package com.omnicivic.service;

import com.omnicivic.dto.response.NotificationResponse;
import com.omnicivic.entity.Complaint;
import com.omnicivic.entity.Notification;
import com.omnicivic.entity.UserAccount;
import com.omnicivic.enums.NotificationType;
import com.omnicivic.exception.ResourceNotFoundException;
import com.omnicivic.repository.NotificationRepository;
import com.omnicivic.util.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final EmailService emailService; // separate bean — @Async proxy works correctly

    @Transactional
    public void notify(UserAccount recipient, Complaint complaint,
                       NotificationType type, String message) {
        // 1. Save to DB instantly
        Notification notification = Notification.builder()
            .communityPrefix(recipient.getCommunityPrefix())
            .recipient(recipient)
            .complaint(complaint)
            .type(type)
            .message(message)
            .read(false)
            .build();
        notificationRepo.save(notification);

        // 2. Send email in background — API returns immediately, email sends async
        if (recipient.getEmail() != null && !recipient.getEmail().isBlank()) {
            emailService.sendAsync(
                recipient.getEmail(),
                "OmniCivic — " + type.name(),
                message
            );
        }
    }

    public List<NotificationResponse> getMyNotifications() {
        Long userId = SecurityContextUtil.getCurrentUserId();
        return notificationRepo.findAllByRecipientIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toResponse).toList();
    }

    public long getUnreadCount() {
        Long userId = SecurityContextUtil.getCurrentUserId();
        return notificationRepo.countByRecipientIdAndReadFalse(userId);
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        Long userId = SecurityContextUtil.getCurrentUserId();
        Notification n = notificationRepo.findByIdAndRecipientId(notificationId, userId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        n.setRead(true);
        return toResponse(notificationRepo.save(n));
    }

    @Transactional
    public void markAllAsRead() {
        Long userId = SecurityContextUtil.getCurrentUserId();
        notificationRepo.findAllByRecipientIdAndReadFalseOrderByCreatedAtDesc(userId)
            .forEach(n -> n.setRead(true));
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
            n.getId(), n.getType(), n.getMessage(),
            n.getComplaint() != null ? n.getComplaint().getId() : null,
            n.isRead(), n.getCreatedAt()
        );
    }
}
