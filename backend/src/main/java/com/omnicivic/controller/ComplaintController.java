package com.omnicivic.controller;

import com.omnicivic.dto.request.AssignComplaintRequest;
import com.omnicivic.dto.request.CreateComplaintRequest;
import com.omnicivic.dto.request.ReviewProofRequest;
import com.omnicivic.dto.request.SubmitProofRequest;
import com.omnicivic.dto.response.ComplaintDetailResponse;
import com.omnicivic.dto.response.ComplaintResponse;
import com.omnicivic.dto.response.MapPinResponse;
import com.omnicivic.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    /** Submit a new complaint */
    @PostMapping
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<Map<String, Object>> submitComplaint(
            @Valid @RequestBody CreateComplaintRequest request) {
        return ResponseEntity.ok(complaintService.submitComplaint(request));
    }

    /** View my own complaints */
    @GetMapping("/my")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints() {
        return ResponseEntity.ok(complaintService.getMyComplaints());
    }

    /** Delete my own complaint before work starts */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<Void> deleteMyComplaint(@PathVariable Long id) {
        complaintService.deleteMyComplaint(id);
        return ResponseEntity.noContent().build();
    }

    /** Community feed - all complaints visible to residents (for home feed) */
    @GetMapping("/community-feed")
    @PreAuthorize("hasAnyRole('RESIDENT','STAFF')")
    public ResponseEntity<List<ComplaintResponse>> getCommunityFeed() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    /** Upvote a duplicate complaint */
    @PostMapping("/{id}/upvote")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ComplaintResponse> upvote(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.upvote(id));
    }

    /** View complaints assigned to me */
    @GetMapping("/assigned")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<ComplaintResponse>> getAssignedComplaints() {
        return ResponseEntity.ok(complaintService.getAssignedComplaints());
    }

    /**
     * All complaints this staff ever worked on (including reassigned-away ones).
     * Used by staff dashboard for accurate stats.
     */
    @GetMapping("/my-work-history")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<ComplaintResponse>> getMyWorkHistory() {
        return ResponseEntity.ok(complaintService.getMyWorkHistory());
    }

    /** Start work: ASSIGNED -> IN_PROGRESS */
    @PutMapping("/{id}/start")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ComplaintResponse> startWork(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.startWork(id));
    }

    /** Submit proof of work: IN_PROGRESS -> PROOF_SUBMITTED */
    @PostMapping("/{id}/proof")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ComplaintResponse> submitProof(
            @PathVariable Long id,
            @Valid @RequestBody SubmitProofRequest request) {
        return ResponseEntity.ok(complaintService.submitProof(id, request));
    }

    /** View all complaints in this community */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    /** Assign or escalate to staff: OPEN/SUBMITTED/ASSIGNED -> ASSIGNED */
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<ComplaintResponse> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignComplaintRequest request) {
        return ResponseEntity.ok(complaintService.assignComplaint(id, request));
    }

    /** Reassign from any active status */
    @PutMapping("/{id}/reassign")
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<ComplaintResponse> reassignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignComplaintRequest request) {
        return ResponseEntity.ok(complaintService.reassignComplaint(id, request));
    }

    /**
     * Review staff proof: PROOF_SUBMITTED -> RESOLVED (approve) or ASSIGNED (reject).
     * Body: { "decision": "APPROVE" } or { "decision": "REJECT", "rejectionReason": "...", "reassignToStaffId": 5 }
     */
    @PostMapping("/{id}/proof/review")
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<ComplaintResponse> reviewProof(
            @PathVariable Long id,
            @Valid @RequestBody ReviewProofRequest request) {
        return ResponseEntity.ok(complaintService.reviewProof(id, request));
    }

    /** Close complaint: RESOLVED -> CLOSED */
    @PutMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<ComplaintResponse> closeComplaint(
            @PathVariable Long id,
            @RequestParam(defaultValue = "") String resolutionNote) {
        return ResponseEntity.ok(complaintService.closeComplaint(id, resolutionNote));
    }

    /** Get single complaint by id (all roles) - includes full media images */
    @GetMapping("/{id}")
    public ResponseEntity<ComplaintDetailResponse> getComplaintById(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    /** Map pins (role-scoped) */
    @GetMapping("/map/pins")
    public ResponseEntity<List<MapPinResponse>> getMapPins() {
        return ResponseEntity.ok(complaintService.getMapPins());
    }
}
