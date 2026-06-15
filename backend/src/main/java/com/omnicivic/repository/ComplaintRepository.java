


package com.omnicivic.repository;

import com.omnicivic.entity.Complaint;
import com.omnicivic.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    /**
     * All complaints for admin — JOIN FETCH to fix N+1.
     * Media (images) intentionally NOT fetched here — list view doesn't need images.
     */
    @Query("""
        SELECT DISTINCT c FROM Complaint c
        JOIN FETCH c.submittedBy
        JOIN FETCH c.category
        LEFT JOIN FETCH c.assignedTo
        LEFT JOIN FETCH c.proofs p
        LEFT JOIN FETCH p.submittedBy
        LEFT JOIN FETCH p.reviewedBy
        WHERE c.communityPrefix = :prefix
        ORDER BY c.id ASC
        """)
    List<Complaint> findAllByCommunityPrefixOrderByIdAsc(@Param("prefix") String prefix);

    /**
     * Resident's own complaints — JOIN FETCH, no images in list.
     */
    @Query("""
        SELECT DISTINCT c FROM Complaint c
        JOIN FETCH c.submittedBy
        JOIN FETCH c.category
        LEFT JOIN FETCH c.assignedTo
        LEFT JOIN FETCH c.proofs p
        LEFT JOIN FETCH p.submittedBy
        LEFT JOIN FETCH p.reviewedBy
        WHERE c.submittedBy.id = :userId
          AND c.communityPrefix = :prefix
        ORDER BY c.id ASC
        """)
    List<Complaint> findAllBySubmittedByIdAndCommunityPrefixOrderByIdAsc(
            @Param("userId") Long userId,
            @Param("prefix") String prefix
    );

    /**
     * Staff currently assigned complaints — JOIN FETCH, no images in list.
     */
    @Query("""
        SELECT DISTINCT c FROM Complaint c
        JOIN FETCH c.submittedBy
        JOIN FETCH c.category
        LEFT JOIN FETCH c.assignedTo
        LEFT JOIN FETCH c.proofs p
        LEFT JOIN FETCH p.submittedBy
        LEFT JOIN FETCH p.reviewedBy
        WHERE c.assignedTo.id = :staffId
          AND c.communityPrefix = :prefix
        ORDER BY c.id ASC
        """)
    List<Complaint> findAllByAssignedToIdAndCommunityPrefixOrderByIdAsc(
            @Param("staffId") Long staffId,
            @Param("prefix") String prefix
    );

    /**
     * Single complaint with full data including media — used for detail view only.
     */
    @Query("""
        SELECT DISTINCT c FROM Complaint c
        JOIN FETCH c.submittedBy
        JOIN FETCH c.category
        LEFT JOIN FETCH c.assignedTo
        LEFT JOIN FETCH c.proofs p
        LEFT JOIN FETCH p.submittedBy
        LEFT JOIN FETCH p.reviewedBy
        WHERE c.id = :id
          AND c.communityPrefix = :prefix
        """)
    Optional<Complaint> findByIdAndCommunityPrefixWithMedia(
            @Param("id") Long id,
            @Param("prefix") String prefix
    );

    /**
     * Next community-scoped complaint number — MAX(communityComplaintNumber) + 1.
     */
    @Query("SELECT COALESCE(MAX(c.communityComplaintNumber), 0) + 1 FROM Complaint c WHERE c.communityPrefix = :prefix")
    Long nextCommunityComplaintNumber(@Param("prefix") String prefix);

    /**
     * Lightweight lookup without media (used internally for updates).
     */
    Optional<Complaint> findByIdAndCommunityPrefix(Long id, String prefix);

    /**
     * Fetch complaints WITH their media — used only when we need thumbnails.
     * Separate from the main list query to avoid Hibernate multiple-bags exception.
     */
    @Query("""
        SELECT DISTINCT c FROM Complaint c
        LEFT JOIN FETCH c.mediaList
        WHERE c.communityPrefix = :prefix
        """)
    List<Complaint> findAllWithMediaByCommunityPrefix(@Param("prefix") String prefix);

    /**
     * All complaints staff has EVER worked on — for dashboard stats.
     */
    @Query("""
        SELECT DISTINCT c FROM Complaint c
        JOIN FETCH c.submittedBy
        JOIN FETCH c.category
        LEFT JOIN FETCH c.assignedTo
        LEFT JOIN FETCH c.proofs p
        LEFT JOIN FETCH p.submittedBy
        LEFT JOIN FETCH p.reviewedBy
        WHERE c.communityPrefix = :prefix
          AND (c.assignedTo.id = :staffId OR p.submittedBy.id = :staffId)
        ORDER BY c.id ASC
        """)
    List<Complaint> findAllEverWorkedByStaff(
            @Param("prefix") String prefix,
            @Param("staffId") Long staffId
    );

    /**
     * Haversine duplicate check — lightweight, no joins needed.
     */
    @Query(value = """
        SELECT c.* FROM complaint c
        WHERE c.community_prefix = :prefix
          AND c.category_id = :categoryId
          AND c.status NOT IN ('RESOLVED', 'CLOSED')
          AND (
            6371000 * 2 * ASIN(
              SQRT(
                POWER(SIN(RADIANS(:lat - c.latitude) / 2), 2) +
                COS(RADIANS(:lat)) * COS(RADIANS(c.latitude)) *
                POWER(SIN(RADIANS(:lng - c.longitude) / 2), 2)
              )
            )
          ) <= :radiusMeters
        """, nativeQuery = true)
    List<Complaint> findNearbyOpenComplaints(
            @Param("prefix") String prefix,
            @Param("categoryId") Long categoryId,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMeters") double radiusMeters
    );

    /**
     * Map pins — lightweight, no media.
     */
    @Query("""
        SELECT c FROM Complaint c
        JOIN FETCH c.category
        WHERE c.communityPrefix = :prefix
          AND c.status NOT IN (com.omnicivic.enums.ComplaintStatus.CLOSED)
        """)
    List<Complaint> findAllPinsForAdmin(@Param("prefix") String prefix);

    @Query("""
        SELECT c FROM Complaint c
        JOIN FETCH c.category
        WHERE c.communityPrefix = :prefix
          AND c.assignedTo.id = :staffId
          AND c.status NOT IN (com.omnicivic.enums.ComplaintStatus.CLOSED)
        """)
    List<Complaint> findPinsForStaff(
            @Param("prefix") String prefix,
            @Param("staffId") Long staffId
    );
}
