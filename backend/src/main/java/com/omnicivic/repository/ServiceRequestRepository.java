package com.omnicivic.repository;

import com.omnicivic.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findAllByStatusOrderBySubmittedAtDesc(String status);
    List<ServiceRequest> findAllByOrderBySubmittedAtDesc();
    long countByStatus(String status);
}
