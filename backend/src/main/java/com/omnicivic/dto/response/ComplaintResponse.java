////package com.omnicivic.dto.response;
////
////import com.omnicivic.enums.ComplaintStatus;
////import java.time.LocalDateTime;
////import java.util.List;
////
/////**
//// * Used for LIST views — no media images to keep payload small.
//// * Images are only sent in ComplaintDetailResponse (single complaint fetch).
//// */
////public record ComplaintResponse(
////    Long id,
////    Long communityComplaintNumber,
////    String communityPrefix,
////    String categoryName,
////    Long categoryId,
////    String submittedByUsername,
////    String assignedToUsername,
////    String description,
////    Double latitude,
////    Double longitude,
////    ComplaintStatus status,
////    int upvoteCount,
////    String resolutionNote,
////    List<ComplaintProofResponse> proofs,
////    LocalDateTime createdAt,
////    LocalDateTime updatedAt,
////    LocalDateTime resolvedAt
////) {}
//
//
//package com.omnicivic.dto.response;
//
//import com.omnicivic.enums.ComplaintStatus;
//import java.time.LocalDateTime;
//import java.util.List;
//
///**
// * Used for LIST views.
// * thumbnailBase64 = first photo only (for card preview thumbnails).
// * Full mediaBase64List is only in ComplaintDetailResponse (single fetch).
// */
//public record ComplaintResponse(
//        Long id,
//        Long communityComplaintNumber,
//        String communityPrefix,
//        String categoryName,
//        Long categoryId,
//        String submittedByUsername,
//        String assignedToUsername,
//        String description,
//        Double latitude,
//        Double longitude,
//        ComplaintStatus status,
//        int upvoteCount,
//        String resolutionNote,
//        String thumbnailBase64,        // first photo only — for card thumbnails
//        List<String> mediaBase64List,  // full list — populated same as thumbnail for list view
//        List<ComplaintProofResponse> proofs,
//        LocalDateTime createdAt,
//        LocalDateTime updatedAt,
//        LocalDateTime resolvedAt
//) {}


package com.omnicivic.dto.response;

import com.omnicivic.enums.ComplaintStatus;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Used for LIST views.
 * thumbnailBase64 = first photo only (for card preview thumbnails).
 * Full mediaBase64List is only in ComplaintDetailResponse (single fetch).
 */
public record ComplaintResponse(
        Long id,
        Long communityComplaintNumber,
        String communityPrefix,
        String categoryName,
        Long categoryId,
        String submittedByUsername,
        String assignedToUsername,
        String description,
        Double latitude,
        Double longitude,
        ComplaintStatus status,
        int upvoteCount,
        boolean canUpvote,
        String resolutionNote,
        LocalDateTime estimatedResolutionAt,
        String thumbnailBase64,
        List<String> mediaBase64List,
        List<ComplaintProofResponse> proofs,
        boolean myProofRejected,       // true if the requesting staff had a proof rejected and it was reassigned away
        String myRejectionReason,      // rejection reason for the requesting staff's rejected proof
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime resolvedAt
) {}
