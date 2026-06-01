package com.omnicivic.repository;

import com.omnicivic.entity.ComplaintUpvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ComplaintUpvoteRepository extends JpaRepository<ComplaintUpvote, Long> {
    boolean existsByComplaintIdAndUpvotedById(Long complaintId, Long userId);
    long countByComplaintId(Long complaintId);
    List<ComplaintUpvote> findAllByComplaintIdInAndUpvotedById(Collection<Long> complaintIds, Long userId);
}
