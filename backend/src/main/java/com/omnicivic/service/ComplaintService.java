
package com.omnicivic.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omnicivic.dto.request.AssignComplaintRequest;
import com.omnicivic.dto.request.CreateComplaintRequest;
import com.omnicivic.dto.request.ReviewProofRequest;
import com.omnicivic.dto.request.SubmitProofRequest;
import com.omnicivic.dto.response.ComplaintDetailResponse;
import com.omnicivic.dto.response.ComplaintProofResponse;
import com.omnicivic.dto.response.ComplaintResponse;
import com.omnicivic.dto.response.MapPinResponse;
import com.omnicivic.entity.*;
import com.omnicivic.enums.ComplaintStatus;
import com.omnicivic.enums.NotificationType;
import com.omnicivic.enums.Role;
import com.omnicivic.exception.BadRequestException;
import com.omnicivic.exception.ResourceNotFoundException;
import com.omnicivic.filter.JwtAuthFilter.JwtDetails;
import com.omnicivic.repository.*;
import com.omnicivic.util.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private static final double DUPLICATE_RADIUS_METERS = 50.0;
    @Value("${app.complaints.default-eta-days:4}")
    private int defaultEtaDays;
    @Value("${app.complaints.allowed-radius-meters:200}")
    private double allowedRadiusMeters;

    private final ComplaintRepository complaintRepo;
    private final CommunityRepository communityRepo;
    private final CategoryRepository categoryRepo;
    private final UserAccountRepository userRepo;
    private final ComplaintProofRepository proofRepo;
    private final ComplaintUpvoteRepository complaintUpvoteRepo;
    private final NotificationRepository notificationRepo;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    // ── Submit Complaint (RESIDENT) ───────────────────────────────────────────

    @Transactional
    @CacheEvict(value = "complaints", allEntries = true)
    public Map<String, Object> submitComplaint(CreateComplaintRequest request) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Long userId = SecurityContextUtil.getCurrentUserId();

        UserAccount resident = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Category category = categoryRepo.findByIdAndCommunityPrefix(request.categoryId(), prefix)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        List<Complaint> nearby = complaintRepo.findNearbyOpenComplaints(
                prefix, category.getId(), request.latitude(), request.longitude(), DUPLICATE_RADIUS_METERS);

        if (!nearby.isEmpty()) {
            Complaint dup = nearby.get(0);
            return Map.of(
                    "duplicate", true,
                    "existingComplaint", toResponse(dup),
                    "message", "A similar complaint exists within 50 meters. Consider upvoting it instead."
            );
        }

        validateComplaintLocation(prefix, request.latitude(), request.longitude());

        Complaint complaint = Complaint.builder()
                .communityPrefix(prefix)
                .submittedBy(resident)
                .category(category)
                .description(request.description())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .status(ComplaintStatus.SUBMITTED)
                .estimatedResolutionAt(defaultEstimatedResolutionAt())
                .upvoteCount(0)
                .build();

        if (request.mediaBase64List() != null) {
            for (String b64 : request.mediaBase64List()) {
                complaint.getMediaList().add(ComplaintMedia.builder()
                        .communityPrefix(prefix)
                        .complaint(complaint)
                        .dataBase64(b64)
                        .build());
            }
        }

        Complaint saved = complaintRepo.save(complaint);
        // Assign community-scoped sequential number after first save (needs the id to exist)
        saved.setCommunityComplaintNumber(complaintRepo.nextCommunityComplaintNumber(prefix));
        saved.setStatus(ComplaintStatus.OPEN);
        complaintRepo.save(saved);

        notifyAdmins(prefix, saved, NotificationType.COMPLAINT_SUBMITTED,
                "New complaint submitted: " + category.getName() + " — " + request.description());

        return Map.of("duplicate", false, "complaint", toResponse(saved));
    }

    @Transactional
    @CacheEvict(value = "complaints", allEntries = true)
    public void deleteMyComplaint(Long complaintId) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Long userId = SecurityContextUtil.getCurrentUserId();
        Complaint complaint = getComplaintForPrefix(complaintId, prefix);

        if (!complaint.getSubmittedBy().getId().equals(userId)) {
            throw new BadRequestException("You can delete only your own complaints");
        }
        if (!List.of(ComplaintStatus.SUBMITTED, ComplaintStatus.OPEN).contains(complaint.getStatus())) {
            throw new BadRequestException("Only newly submitted complaints can be deleted");
        }

        notificationRepo.deleteAllByComplaintId(complaintId);
        complaintRepo.delete(complaint);
    }

    // ── Assign to Staff (ADMIN / CO_ADMIN) ────────────────────────────────────

    @Transactional
    @CacheEvict(value = "complaints", allEntries = true)
    public ComplaintResponse assignComplaint(Long complaintId, AssignComplaintRequest request) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Complaint complaint = getComplaintForPrefix(complaintId, prefix);

        if (!List.of(ComplaintStatus.OPEN, ComplaintStatus.SUBMITTED, ComplaintStatus.ASSIGNED)
                .contains(complaint.getStatus())) {
            throw new BadRequestException("Cannot assign a complaint in status: " + complaint.getStatus());
        }

        UserAccount staff = userRepo.findByIdAndCommunityPrefix(request.staffId(), prefix)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        if (staff.getRole() != Role.STAFF) {
            throw new BadRequestException("Can only assign to staff members");
        }

        complaint.setAssignedTo(staff);
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        complaint.setEstimatedResolutionAt(resolveAssignmentEta(complaint, request));
        Complaint saved = complaintRepo.save(complaint);

        notificationService.notify(staff, saved, NotificationType.COMPLAINT_ASSIGNED,
                "You have been assigned complaint #" + (complaint.getCommunityComplaintNumber() != null ? complaint.getCommunityComplaintNumber() : complaint.getId())
                        + ": " + complaint.getCategory().getName());

        return toResponse(saved);
    }

    // ── Staff: Start Work (ASSIGNED → IN_PROGRESS) ────────────────────────────

    @Transactional
    @CacheEvict(value = "complaints", allEntries = true)
    public ComplaintResponse startWork(Long complaintId) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Long userId = SecurityContextUtil.getCurrentUserId();
        Complaint complaint = getComplaintForPrefix(complaintId, prefix);

        if (complaint.getStatus() != ComplaintStatus.ASSIGNED) {
            throw new BadRequestException("Can only start work on an ASSIGNED complaint");
        }
        if (complaint.getAssignedTo() == null || !complaint.getAssignedTo().getId().equals(userId)) {
            throw new BadRequestException("You are not assigned to this complaint");
        }

        complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        Complaint saved = complaintRepo.save(complaint);

        notifyAdmins(prefix, saved, NotificationType.STATUS_UPDATED,
                "Complaint #" + (saved.getCommunityComplaintNumber() != null ? saved.getCommunityComplaintNumber() : saved.getId()) + " is now IN PROGRESS by "
                        + saved.getAssignedTo().getUsername());

        return toResponse(saved);
    }

    // ── Staff: Submit Proof (IN_PROGRESS → PROOF_SUBMITTED) ──────────────────

    @Transactional
    @CacheEvict(value = "complaints", allEntries = true)
    public ComplaintResponse submitProof(Long complaintId, SubmitProofRequest request) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Long userId = SecurityContextUtil.getCurrentUserId();
        Complaint complaint = getComplaintForPrefix(complaintId, prefix);

        if (complaint.getStatus() != ComplaintStatus.IN_PROGRESS) {
            throw new BadRequestException("Proof can only be submitted when the complaint is IN PROGRESS");
        }
        if (complaint.getAssignedTo() == null || !complaint.getAssignedTo().getId().equals(userId)) {
            throw new BadRequestException("You are not assigned to this complaint");
        }

        UserAccount staff = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ComplaintProof proof = ComplaintProof.builder()
                .communityPrefix(prefix)
                .complaint(complaint)
                .submittedBy(staff)
                .workNote(request.workNote())
                .imageBase64(request.imageBase64())
                .status("PENDING")
                .build();

        proofRepo.save(proof);
        complaint.setStatus(ComplaintStatus.PROOF_SUBMITTED);
        Complaint saved = complaintRepo.save(complaint);

        notifyAdmins(prefix, saved, NotificationType.PROOF_SUBMITTED,
                "Staff " + staff.getUsername() + " submitted proof for complaint #"
                        + (saved.getCommunityComplaintNumber() != null ? saved.getCommunityComplaintNumber() : saved.getId()) + ". Please review and verify.");

        return toResponse(saved);
    }

    // ── Admin: Review Proof ───────────────────────────────────────────────────

    @Transactional
    @CacheEvict(value = "complaints", allEntries = true)
    public ComplaintResponse reviewProof(Long complaintId, ReviewProofRequest request) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Long adminId = SecurityContextUtil.getCurrentUserId();
        Complaint complaint = getComplaintForPrefix(complaintId, prefix);

        if (complaint.getStatus() != ComplaintStatus.PROOF_SUBMITTED) {
            throw new BadRequestException("No pending proof to review for complaint #" + complaintId);
        }

        ComplaintProof proof = proofRepo
                .findFirstByComplaintIdAndStatusOrderBySubmittedAtDesc(complaintId, "PENDING")
                .orElseThrow(() -> new ResourceNotFoundException("No pending proof found"));

        UserAccount admin = userRepo.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        proof.setReviewedBy(admin);
        proof.setReviewedAt(LocalDateTime.now());

        if ("APPROVE".equalsIgnoreCase(request.decision())) {
            proof.setStatus("APPROVED");
            proofRepo.save(proof);
            complaint.setStatus(ComplaintStatus.RESOLVED);
            complaint.setResolvedAt(LocalDateTime.now());
            Complaint saved = complaintRepo.save(complaint);
            notificationService.notify(complaint.getAssignedTo(), saved,
                    NotificationType.PROOF_APPROVED,
                    "Your proof for complaint #" + (saved.getCommunityComplaintNumber() != null ? saved.getCommunityComplaintNumber() : saved.getId()) + " has been approved. Good work!");
            notificationService.notify(complaint.getSubmittedBy(), saved,
                    NotificationType.STATUS_UPDATED,
                    "Your complaint #" + (saved.getCommunityComplaintNumber() != null ? saved.getCommunityComplaintNumber() : saved.getId()) + " has been resolved. Awaiting final closure by admin.");
            return toResponse(saved);

        } else if ("REJECT".equalsIgnoreCase(request.decision())) {
            if (request.rejectionReason() == null || request.rejectionReason().isBlank()) {
                throw new BadRequestException("Rejection reason is required when rejecting proof");
            }
            proof.setStatus("REJECTED");
            proof.setRejectionReason(request.rejectionReason());
            proofRepo.save(proof);

            UserAccount staffToAssign = complaint.getAssignedTo();
            if (request.reassignToStaffId() != null) {
                staffToAssign = userRepo.findByIdAndCommunityPrefix(request.reassignToStaffId(), prefix)
                        .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
                if (staffToAssign.getRole() != Role.STAFF) {
                    throw new BadRequestException("Can only assign to a STAFF member");
                }
            }

            complaint.setAssignedTo(staffToAssign);
            complaint.setStatus(ComplaintStatus.ASSIGNED);
            Complaint saved = complaintRepo.save(complaint);

            // Check: is this a different staff than whoever submitted the proof?
            boolean isNewStaff = request.reassignToStaffId() != null &&
                    !request.reassignToStaffId().equals(proof.getSubmittedBy().getId());

            if (isNewStaff) {
                // Notify original proof submitter their work was rejected
                notificationService.notify(proof.getSubmittedBy(), saved, NotificationType.PROOF_REJECTED,
                        "Your proof for complaint #" + saved.getCommunityComplaintNumber() + " was rejected: "
                                + request.rejectionReason());
                // Notify newly assigned staff with a clean assignment notification (no "rejected" wording)
                notificationService.notify(staffToAssign, saved, NotificationType.COMPLAINT_ASSIGNED,
                        "Complaint #" + saved.getCommunityComplaintNumber() + " has been assigned to you: "
                                + saved.getCategory().getName());
            } else {
                // Same staff — tell them their proof was rejected and they need to redo
                notificationService.notify(staffToAssign, saved, NotificationType.PROOF_REJECTED,
                        "Your proof for complaint #" + saved.getCommunityComplaintNumber() + " was rejected: "
                                + request.rejectionReason() + ". Please redo the work and submit new proof.");
            }
            notificationService.notify(complaint.getSubmittedBy(), saved,
                    NotificationType.STATUS_UPDATED,
                    "Work on your complaint #" + saved.getCommunityComplaintNumber() + " needs to be redone. It has been reassigned to staff.");
            return toResponse(saved);

        } else {
            throw new BadRequestException("Decision must be APPROVE or REJECT");
        }
    }

    // ── Admin: Close Complaint ────────────────────────────────────────────────

    @Transactional
    @CacheEvict(value = "complaints", allEntries = true)
    public ComplaintResponse closeComplaint(Long complaintId, String resolutionNote) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Complaint complaint = getComplaintForPrefix(complaintId, prefix);

        if (complaint.getStatus() != ComplaintStatus.RESOLVED) {
            throw new BadRequestException("Only RESOLVED complaints can be closed. Current status: " + complaint.getStatus());
        }

        complaint.setStatus(ComplaintStatus.CLOSED);
        complaint.setResolutionNote(resolutionNote);
        complaint.setResolvedAt(LocalDateTime.now());
        Complaint saved = complaintRepo.save(complaint);

        notificationService.notify(complaint.getSubmittedBy(), saved,
                NotificationType.COMPLAINT_CLOSED,
                "Your complaint #" + (saved.getCommunityComplaintNumber() != null ? saved.getCommunityComplaintNumber() : saved.getId()) + " has been officially closed. Note: " + resolutionNote);

        return toResponse(saved);
    }

    // ── Admin: Reassign ───────────────────────────────────────────────────────

    @Transactional
    @CacheEvict(value = "complaints", allEntries = true)
    public ComplaintResponse reassignComplaint(Long complaintId, AssignComplaintRequest request) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Complaint complaint = getComplaintForPrefix(complaintId, prefix);

        List<ComplaintStatus> reassignableStatuses = List.of(
                ComplaintStatus.OPEN, ComplaintStatus.SUBMITTED,
                ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS
        );
        if (!reassignableStatuses.contains(complaint.getStatus())) {
            throw new BadRequestException("Cannot reassign a complaint in status: " + complaint.getStatus()
                    + ". Use Review Proof to reject proof and reassign.");
        }

        UserAccount staff = userRepo.findByIdAndCommunityPrefix(request.staffId(), prefix)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        if (staff.getRole() != Role.STAFF) {
            throw new BadRequestException("Can only assign to staff members");
        }

        complaint.setAssignedTo(staff);
        complaint.setStatus(ComplaintStatus.ASSIGNED);
        complaint.setEstimatedResolutionAt(resolveAssignmentEta(complaint, request));
        Complaint saved = complaintRepo.save(complaint);

        notificationService.notify(staff, saved, NotificationType.COMPLAINT_ASSIGNED,
                "Complaint #" + (saved.getCommunityComplaintNumber() != null ? saved.getCommunityComplaintNumber() : saved.getId()) + " has been assigned to you: " + saved.getCategory().getName());

        return toResponse(saved);
    }

    // ── Upvote ────────────────────────────────────────────────────────────────

    @Transactional
    @CacheEvict(value = "complaints", allEntries = true)
    public ComplaintResponse upvote(Long complaintId) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Long userId = SecurityContextUtil.getCurrentUserId();
        Complaint complaint = getComplaintForPrefix(complaintId, prefix);

        if (complaint.getSubmittedBy() != null && complaint.getSubmittedBy().getId().equals(userId)) {
            throw new BadRequestException("You cannot upvote your own complaint");
        }
        if (complaintUpvoteRepo.existsByComplaintIdAndUpvotedById(complaintId, userId)) {
            throw new BadRequestException("You have already marked this complaint as affecting you");
        }

        UserAccount resident = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        complaintUpvoteRepo.save(ComplaintUpvote.builder()
                .communityPrefix(prefix)
                .complaint(complaint)
                .upvotedBy(resident)
                .build());
        complaint.setUpvoteCount((int) complaintUpvoteRepo.countByComplaintId(complaintId));
        return toResponse(complaintRepo.save(complaint));
    }

    // ── Queries (cached) ──────────────────────────────────────────────────────

    @Cacheable(value = "complaints", key = "'all:' + #root.target.getCurrentPrefix()")
    public List<ComplaintResponse> getAllComplaints() {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        List<Complaint> complaints = complaintRepo.findAllByCommunityPrefixOrderByIdAsc(prefix);
        return mergeMediaAndMap(complaints, prefix);
    }

    @Cacheable(value = "complaints", key = "'my:' + #root.target.getCurrentUserId() + ':' + #root.target.getCurrentPrefix()")
    public List<ComplaintResponse> getMyComplaints() {
        Long userId = SecurityContextUtil.getCurrentUserId();
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        List<Complaint> complaints = complaintRepo.findAllBySubmittedByIdAndCommunityPrefixOrderByIdAsc(userId, prefix);
        return mergeMediaAndMap(complaints, prefix);
    }

    @Cacheable(value = "complaints", key = "'assigned:' + #root.target.getCurrentUserId() + ':' + #root.target.getCurrentPrefix()")
    public List<ComplaintResponse> getAssignedComplaints() {
        Long userId = SecurityContextUtil.getCurrentUserId();
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        List<Complaint> complaints = complaintRepo.findAllByAssignedToIdAndCommunityPrefixOrderByIdAsc(userId, prefix);
        return mergeMediaAndMap(complaints, prefix);
    }

    @Cacheable(value = "complaints", key = "'history:' + #root.target.getCurrentUserId() + ':' + #root.target.getCurrentPrefix()")
    public List<ComplaintResponse> getMyWorkHistory() {
        Long userId = SecurityContextUtil.getCurrentUserId();
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        String username = SecurityContextUtil.getCurrentUsername();
        List<Complaint> complaints = complaintRepo.findAllEverWorkedByStaff(prefix, userId);
        return mergeMediaAndMapForStaff(complaints, prefix, username);
    }

    /**
     * Fetches media separately (avoids multiple-bags Hibernate error),
     * builds a map of complaintId -> mediaList, then maps complaints to responses.
     */
    private List<ComplaintResponse> mergeMediaAndMap(List<Complaint> complaints, String prefix) {
        if (complaints.isEmpty()) {
            return List.of();
        }
        Long currentUserId = getOptionalCurrentUserId();
        java.util.Set<Long> upvotedComplaintIds = currentUserId != null
                ? complaintUpvoteRepo.findAllByComplaintIdInAndUpvotedById(
                        complaints.stream().map(Complaint::getId).toList(),
                        currentUserId
                ).stream().map(upvote -> upvote.getComplaint().getId()).collect(java.util.stream.Collectors.toSet())
                : java.util.Set.of();
        // Fetch media in a separate query
        Map<Long, List<String>> mediaMap = complaintRepo.findAllWithMediaByCommunityPrefix(prefix)
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        Complaint::getId,
                        c -> c.getMediaList() != null
                                ? c.getMediaList().stream().map(ComplaintMedia::getDataBase64).toList()
                                : List.of()
                ));
        return complaints.stream()
                .map(c -> toResponseWithMedia(c, mediaMap.getOrDefault(c.getId(), List.of()), upvotedComplaintIds.contains(c.getId())))
                .toList();
    }

    /**
     * Like mergeMediaAndMap but also sets myProofRejected/myRejectionReason
     * so frontend can reliably identify rejected-and-handed-over complaints.
     */
    private List<ComplaintResponse> mergeMediaAndMapForStaff(
            List<Complaint> complaints, String prefix, String staffUsername) {
        Map<Long, List<String>> mediaMap = complaintRepo.findAllWithMediaByCommunityPrefix(prefix)
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        Complaint::getId,
                        c -> c.getMediaList() != null
                                ? c.getMediaList().stream().map(ComplaintMedia::getDataBase64).toList()
                                : List.of()
                ));
        return complaints.stream()
                .map(c -> {
                    // Find a REJECTED proof submitted by this staff where they were later NOT approved
                    ComplaintProof rejectedProof = c.getProofs() != null
                            ? c.getProofs().stream()
                            .filter(p -> p.getSubmittedBy() != null
                                    && staffUsername.equals(p.getSubmittedBy().getUsername())
                                    && "REJECTED".equals(p.getStatus()))
                            .findFirst().orElse(null)
                            : null;
                    // Only mark as myProofRejected if there's NO subsequent APPROVED proof by this staff
                    boolean hasApproved = c.getProofs() != null && c.getProofs().stream()
                            .anyMatch(p -> p.getSubmittedBy() != null
                                    && staffUsername.equals(p.getSubmittedBy().getUsername())
                                    && "APPROVED".equals(p.getStatus()));
                    boolean myProofRejected = rejectedProof != null && !hasApproved
                            && !staffUsername.equals(
                            c.getAssignedTo() != null ? c.getAssignedTo().getUsername() : "");
                    String myRejectionReason = myProofRejected ? rejectedProof.getRejectionReason() : null;

                    List<String> media = mediaMap.getOrDefault(c.getId(), List.of());
                    List<ComplaintProofResponse> proofs = c.getProofs() != null
                            ? c.getProofs().stream()
                            .sorted((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()))
                            .map(this::toProofResponse).toList()
                            : List.of();
                    String thumbnail = media.isEmpty() ? null : media.get(0);
                    return new ComplaintResponse(
                            c.getId(), c.getCommunityComplaintNumber(), c.getCommunityPrefix(),
                            c.getCategory() != null ? c.getCategory().getName() : null,
                            c.getCategory() != null ? c.getCategory().getId() : null,
                            c.getSubmittedBy() != null ? c.getSubmittedBy().getUsername() : null,
                            c.getAssignedTo() != null ? c.getAssignedTo().getUsername() : null,
                            c.getDescription(), c.getLatitude(), c.getLongitude(),
                            c.getStatus(), c.getUpvoteCount(), false, c.getResolutionNote(), c.getEstimatedResolutionAt(),
                            thumbnail, media, proofs,
                            myProofRejected, myRejectionReason,
                            c.getCreatedAt(), c.getUpdatedAt(), c.getResolvedAt()
                    );
                }).toList();
    }

    /**
     * Detail view — returns full data including media images.
     * Not cached because images are large — fetched fresh each time.
     */
    public ComplaintDetailResponse getComplaintById(Long id) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Complaint c = complaintRepo.findByIdAndCommunityPrefixWithMedia(id, prefix)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        return toDetailResponse(c);
    }

    // ── Map Pins ──────────────────────────────────────────────────────────────

    public List<MapPinResponse> getMapPins() {
        JwtDetails details = SecurityContextUtil.getCurrentUserDetails();
        String prefix = details.communityPrefix();
        List<Complaint> complaints;
        if (details.role().equals(Role.STAFF.name())) {
            complaints = complaintRepo.findPinsForStaff(prefix, details.userId());
        } else {
            complaints = complaintRepo.findAllPinsForAdmin(prefix);
        }
        return complaints.stream().map(c -> new MapPinResponse(
                c.getId(), c.getLatitude(), c.getLongitude(),
                c.getStatus(), c.getCategory().getName(), c.getDescription()
        )).toList();
    }

    // ── Cache key helpers (called by SpEL) ───────────────────────────────────

    public String getCurrentPrefix() {
        return SecurityContextUtil.getCurrentCommunityPrefix();
    }

    public Long getCurrentUserId() {
        return SecurityContextUtil.getCurrentUserId();
    }

    private Long getOptionalCurrentUserId() {
        try {
            return SecurityContextUtil.getCurrentUserId();
        } catch (Exception ignored) {
            return null;
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private LocalDateTime defaultEstimatedResolutionAt() {
        int days = defaultEtaDays > 0 ? defaultEtaDays : 4;
        return LocalDateTime.now().plusDays(days);
    }

    private LocalDateTime resolveAssignmentEta(Complaint complaint, AssignComplaintRequest request) {
        if (request.estimatedResolutionAt() != null) {
            return request.estimatedResolutionAt();
        }
        if (complaint.getEstimatedResolutionAt() != null) {
            return complaint.getEstimatedResolutionAt();
        }
        return defaultEstimatedResolutionAt();
    }

    private void validateComplaintLocation(String prefix, double latitude, double longitude) {
        Community community = communityRepo.findByCommunityPrefix(prefix)
                .orElseThrow(() -> new ResourceNotFoundException("Community not found"));

        if (isWithinCommunityArea(community, latitude, longitude)) {
            return;
        }

        throw new BadRequestException("This location is outside your community area. Please choose a point inside your location.");
    }

    private boolean isWithinCommunityArea(Community community, double latitude, double longitude) {
        if (community.getMapBoundary() != null && !community.getMapBoundary().isBlank()) {
            try {
                var polygon = extractPolygonPoints(community.getMapBoundary());
                if (!polygon.isEmpty()) {
                    return pointInPolygon(longitude, latitude, polygon);
                }
            } catch (Exception ignored) {
                // Fall back to center-radius validation if boundary data is malformed.
            }
        }

        if (community.getMapCenterLat() != null && community.getMapCenterLng() != null) {
            return haversineMeters(
                    latitude, longitude,
                    community.getMapCenterLat(), community.getMapCenterLng()
            ) <= allowedRadiusMeters;
        }

        return true;
    }

    private java.util.List<double[]> extractPolygonPoints(String boundaryJson) throws Exception {
        JsonNode root = objectMapper.readTree(boundaryJson);
        JsonNode geometry = root;

        if ("Feature".equalsIgnoreCase(root.path("type").asText())) {
            geometry = root.path("geometry");
        } else if ("FeatureCollection".equalsIgnoreCase(root.path("type").asText())
                && root.path("features").isArray()
                && !root.path("features").isEmpty()) {
            geometry = root.path("features").get(0).path("geometry");
        }

        if (!"Polygon".equalsIgnoreCase(geometry.path("type").asText())) {
            return java.util.List.of();
        }

        JsonNode firstRing = geometry.path("coordinates").isArray() ? geometry.path("coordinates").get(0) : null;
        if (firstRing == null || !firstRing.isArray()) {
            return java.util.List.of();
        }

        java.util.List<double[]> points = new java.util.ArrayList<>();
        for (JsonNode point : firstRing) {
            if (point.isArray() && point.size() >= 2) {
                points.add(new double[]{ point.get(0).asDouble(), point.get(1).asDouble() }); // [lng, lat]
            }
        }
        return points;
    }

    private boolean pointInPolygon(double x, double y, java.util.List<double[]> polygon) {
        boolean inside = false;
        for (int i = 0, j = polygon.size() - 1; i < polygon.size(); j = i++) {
            double xi = polygon.get(i)[0];
            double yi = polygon.get(i)[1];
            double xj = polygon.get(j)[0];
            double yj = polygon.get(j)[1];

            boolean intersects = ((yi > y) != (yj > y))
                    && (x < (xj - xi) * (y - yi) / ((yj - yi) == 0 ? 1e-12 : (yj - yi)) + xi);
            if (intersects) {
                inside = !inside;
            }
        }
        return inside;
    }

    private double haversineMeters(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.pow(Math.sin(dLat / 2), 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.pow(Math.sin(dLng / 2), 2);
        return 6371000 * 2 * Math.asin(Math.sqrt(a));
    }

    private Complaint getComplaintForPrefix(Long id, String prefix) {
        return complaintRepo.findByIdAndCommunityPrefix(id, prefix)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
    }

    private void notifyAdmins(String prefix, Complaint complaint,
                              NotificationType type, String message) {
        userRepo.findAllByCommunityPrefixAndRoleAndActiveTrue(prefix, Role.ADMIN)
                .forEach(a -> notificationService.notify(a, complaint, type, message));
        userRepo.findAllByCommunityPrefixAndRoleAndActiveTrue(prefix, Role.CO_ADMIN)
                .forEach(a -> notificationService.notify(a, complaint, type, message));
    }

    private ComplaintProofResponse toProofResponse(ComplaintProof p) {
        return new ComplaintProofResponse(
                p.getId(),
                p.getSubmittedBy() != null ? p.getSubmittedBy().getUsername() : null,
                p.getWorkNote(),
                p.getImageBase64(),
                p.getStatus(),
                p.getRejectionReason(),
                p.getReviewedBy() != null ? p.getReviewedBy().getUsername() : null,
                p.getSubmittedAt(),
                p.getReviewedAt()
        );
    }

    /** List response — includes thumbnail and media if already loaded */
    private ComplaintResponse toResponse(Complaint c) {
        boolean hasUpvoted = false;
        Long userId = getOptionalCurrentUserId();
        if (userId != null) {
            hasUpvoted = complaintUpvoteRepo.existsByComplaintIdAndUpvotedById(c.getId(), userId);
        }
        return toResponseWithMedia(c, null, hasUpvoted);
    }

    private ComplaintResponse toResponseWithMedia(Complaint c, List<String> mediaOverride, boolean hasUpvoted) {
        List<ComplaintProofResponse> proofs = c.getProofs() != null
                ? c.getProofs().stream()
                .sorted((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()))
                .map(this::toProofResponse).toList()
                : List.of();
        List<String> media = mediaOverride != null ? mediaOverride
                : (c.getMediaList() != null
                ? c.getMediaList().stream().map(ComplaintMedia::getDataBase64).toList()
                : List.of());
        String thumbnail = media.isEmpty() ? null : media.get(0);
        boolean canUpvote = canCurrentUserUpvote(c, hasUpvoted);
        return new ComplaintResponse(
                c.getId(), c.getCommunityComplaintNumber(), c.getCommunityPrefix(),
                c.getCategory() != null ? c.getCategory().getName() : null,
                c.getCategory() != null ? c.getCategory().getId() : null,
                c.getSubmittedBy() != null ? c.getSubmittedBy().getUsername() : null,
                c.getAssignedTo() != null ? c.getAssignedTo().getUsername() : null,
                c.getDescription(), c.getLatitude(), c.getLongitude(),
                c.getStatus(), c.getUpvoteCount(), canUpvote, c.getResolutionNote(), c.getEstimatedResolutionAt(),
                thumbnail, media,
                proofs, false, null,
                c.getCreatedAt(), c.getUpdatedAt(), c.getResolvedAt()
        );
    }

    /** Detail response — WITH images */
    private ComplaintDetailResponse toDetailResponse(Complaint c) {
        boolean hasUpvoted = false;
        Long userId = getOptionalCurrentUserId();
        if (userId != null) {
            hasUpvoted = complaintUpvoteRepo.existsByComplaintIdAndUpvotedById(c.getId(), userId);
        }
        List<String> media = c.getMediaList() != null
                ? c.getMediaList().stream().map(ComplaintMedia::getDataBase64).toList()
                : List.of();
        List<ComplaintProofResponse> proofs = c.getProofs() != null
                ? c.getProofs().stream()
                .sorted((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()))
                .map(this::toProofResponse).toList()
                : List.of();
        return new ComplaintDetailResponse(
                c.getId(), c.getCommunityComplaintNumber(), c.getCommunityPrefix(),
                c.getCategory() != null ? c.getCategory().getName() : null,
                c.getCategory() != null ? c.getCategory().getId() : null,
                c.getSubmittedBy() != null ? c.getSubmittedBy().getUsername() : null,
                c.getAssignedTo() != null ? c.getAssignedTo().getUsername() : null,
                c.getDescription(), c.getLatitude(), c.getLongitude(),
                c.getStatus(), c.getUpvoteCount(), canCurrentUserUpvote(c, hasUpvoted), c.getResolutionNote(), c.getEstimatedResolutionAt(),
                media, proofs, c.getCreatedAt(), c.getUpdatedAt(), c.getResolvedAt()
        );
    }

    private boolean canCurrentUserUpvote(Complaint complaint, boolean hasUpvoted) {
        try {
            JwtDetails details = SecurityContextUtil.getCurrentUserDetails();
            if (!Role.RESIDENT.name().equals(details.role())) {
                return false;
            }
            if (hasUpvoted) {
                return false;
            }
            return complaint.getSubmittedBy() == null || !complaint.getSubmittedBy().getId().equals(details.userId());
        } catch (Exception ignored) {
            return false;
        }
    }
}
