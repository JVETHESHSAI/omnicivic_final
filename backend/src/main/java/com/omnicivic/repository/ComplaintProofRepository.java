package com.omnicivic.repository;

import com.omnicivic.entity.ComplaintProof;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintProofRepository extends JpaRepository<ComplaintProof, Long> {

    List<ComplaintProof> findAllByComplaintIdOrderBySubmittedAtDesc(Long complaintId);

    /** Latest PENDING proof for a complaint */
    Optional<ComplaintProof> findFirstByComplaintIdAndStatusOrderBySubmittedAtDesc(
            Long complaintId, String status);
}
