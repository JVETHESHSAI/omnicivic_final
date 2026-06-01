package com.omnicivic.repository;

import com.omnicivic.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    List<Notification> findAllByRecipientIdAndReadFalseOrderByCreatedAtDesc(Long recipientId);
    long countByRecipientIdAndReadFalse(Long recipientId);
    Optional<Notification> findByIdAndRecipientId(Long id, Long recipientId);
    void deleteAllByComplaintId(Long complaintId);
}
