package com.omnicivic.service;

import com.omnicivic.dto.request.ApproveServiceRequestDto;
import com.omnicivic.dto.request.SubmitServiceRequestDto;
import com.omnicivic.dto.response.CreateUserResponse;
import com.omnicivic.dto.response.ServiceRequestResponse;
import com.omnicivic.entity.Community;
import com.omnicivic.entity.ServiceRequest;
import com.omnicivic.entity.UserAccount;
import com.omnicivic.enums.Role;
import com.omnicivic.exception.BadRequestException;
import com.omnicivic.exception.ResourceNotFoundException;
import com.omnicivic.repository.CommunityRepository;
import com.omnicivic.repository.ServiceRequestRepository;
import com.omnicivic.repository.UserAccountRepository;
import com.omnicivic.util.SecurityContextUtil;
import com.omnicivic.util.UsernameGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceRequestService {

    private final ServiceRequestRepository requestRepo;
    private final CommunityRepository communityRepo;
    private final UserAccountRepository userRepo;
    private final DefaultCategorySeeder defaultCategorySeeder;
    private final UsernameGenerator usernameGenerator;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.platform.url:http://localhost:4200}")
    private String platformUrl;

    @Transactional
    public ServiceRequestResponse submitRequest(SubmitServiceRequestDto dto) {
        ServiceRequest req = ServiceRequest.builder()
            .organizationName(dto.organizationName())
            .ownerName(dto.ownerName())
            .ownerEmail(dto.ownerEmail())
            .ownerPhone(dto.ownerPhone())
            .description(dto.description())
            .address(dto.address())
            .addressLat(dto.addressLat())
            .addressLng(dto.addressLng())
            .logoBase64(dto.logoBase64())
            .websiteUrl(dto.websiteUrl())
            .instagramUrl(dto.instagramUrl())
            .facebookUrl(dto.facebookUrl())
            .twitterUrl(dto.twitterUrl())
            .status("PENDING")
            .build();
        ServiceRequest saved = requestRepo.save(req);
        log.info("New service request received from {} ({})", dto.ownerEmail(), dto.organizationName());
        return toResponse(saved);
    }

    public List<ServiceRequestResponse> getAllRequests(String status) {
        List<ServiceRequest> requests = (status == null || status.isBlank())
            ? requestRepo.findAllByOrderBySubmittedAtDesc()
            : requestRepo.findAllByStatusOrderBySubmittedAtDesc(status.toUpperCase());
        return requests.stream().map(this::toResponse).toList();
    }

    public Map<String, Long> getCounts() {
        return Map.of(
            "pending", requestRepo.countByStatus("PENDING"),
            "approved", requestRepo.countByStatus("APPROVED"),
            "rejected", requestRepo.countByStatus("REJECTED"),
            "total", requestRepo.count()
        );
    }

    @Transactional
    public Map<String, Object> approve(Long requestId, ApproveServiceRequestDto dto) {
        ServiceRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        if (!"PENDING".equals(req.getStatus())) {
            throw new BadRequestException("Request is not pending; current status: " + req.getStatus());
        }

        String prefix = dto.communityPrefix().toUpperCase();
        if (communityRepo.existsByCommunityPrefix(prefix)) {
            // Auto-resolve collision: append digits until unique
            String base = prefix.length() >= 3 ? prefix.substring(0, 3) : prefix;
            String unique = null;
            for (int i = 1; i <= 99; i++) {
                String candidate = (base + i).substring(0, 4);
                if (!communityRepo.existsByCommunityPrefix(candidate)) {
                    unique = candidate;
                    break;
                }
            }
            if (unique == null) {
                throw new BadRequestException(
                    "Prefix " + prefix + " is already in use, and no unique variant could be generated. " +
                    "Please choose a different prefix.");
            }
            log.info("Prefix collision: '{}' was taken, auto-assigned '{}' instead", prefix, unique);
            prefix = unique;
        }

        // 1) Create the community — use the address as the map center if provided
        Double mapLat = req.getAddressLat();
        Double mapLng = req.getAddressLng();
        // Default fallback: Chennai center
        if (mapLat == null || mapLng == null) {
            mapLat = 13.0827;
            mapLng = 80.2707;
        }

        Community community = Community.builder()
            .communityPrefix(prefix)
            .name(req.getOrganizationName())
            .contactEmail(req.getOwnerEmail())
            .contactPhone(req.getOwnerPhone())
            .logoBase64(req.getLogoBase64())
            .themeColor("#2563eb")
            .mapCenterLat(mapLat)
            .mapCenterLng(mapLng)
            .mapZoom(16)
            .websiteUrl(req.getWebsiteUrl())
            .instagramUrl(req.getInstagramUrl())
            .facebookUrl(req.getFacebookUrl())
            .twitterUrl(req.getTwitterUrl())
            .active(true)
            .build();
        communityRepo.save(community);

        // 1b) Seed default categories so residents can immediately report
        defaultCategorySeeder.seedForCommunity(prefix);

        // 2) Auto-generate the admin account
        String[] nameParts = req.getOwnerName().trim().split("\\s+", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        String adminUsername = usernameGenerator.generateForAdmin(prefix);
        String tempPassword = usernameGenerator.generateTempPassword();

        UserAccount admin = UserAccount.builder()
            .communityPrefix(prefix)
            .username(adminUsername)
            .password(passwordEncoder.encode(tempPassword))
            .tempPasswordPlain(tempPassword)
            .firstName(firstName)
            .lastName(lastName)
            .email(req.getOwnerEmail())
            .phone(req.getOwnerPhone())
            .role(Role.ADMIN)
            .firstLogin(true)
            .active(true)
            .build();
        userRepo.save(admin);

        // 3) Update the request
        req.setStatus("APPROVED");
        req.setAssignedPrefix(prefix);
        req.setReviewedBy(SecurityContextUtil.getCurrentUsername());
        req.setReviewedAt(LocalDateTime.now());
        requestRepo.save(req);

        // 4) Email the owner — fires in background thread, does not block
        emailService.sendCredentials(
            req.getOwnerEmail(), req.getOwnerName(),
            req.getOrganizationName(), adminUsername, tempPassword,
            "ADMIN", prefix);

        log.info("Community {} approved (admin={})", prefix, adminUsername);

        return Map.of(
            "request", toResponse(req),
            "credentials", new CreateUserResponse(
                admin.getId(), adminUsername, tempPassword,
                admin.getFirstName(), admin.getLastName(), admin.getEmail(),
                Role.ADMIN, prefix
            ),
            "emailSent", true
        );
    }

    @Transactional
    public ServiceRequestResponse reject(Long requestId, String reason) {
        ServiceRequest req = requestRepo.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        if (!"PENDING".equals(req.getStatus())) {
            throw new BadRequestException("Request is not pending");
        }

        req.setStatus("REJECTED");
        req.setRejectionReason(reason);
        req.setReviewedBy(SecurityContextUtil.getCurrentUsername());
        req.setReviewedAt(LocalDateTime.now());

        emailService.sendRejection(req.getOwnerEmail(), req.getOwnerName(),
            req.getOrganizationName(), reason);

        return toResponse(requestRepo.save(req));
    }

    private ServiceRequestResponse toResponse(ServiceRequest r) {
        return new ServiceRequestResponse(
            r.getId(), r.getOrganizationName(), r.getOwnerName(), r.getOwnerEmail(),
            r.getOwnerPhone(), r.getDescription(),
            r.getAddress(), r.getAddressLat(), r.getAddressLng(),
            r.getLogoBase64(),
            r.getWebsiteUrl(), r.getInstagramUrl(), r.getFacebookUrl(), r.getTwitterUrl(),
            r.getStatus(), r.getAssignedPrefix(), r.getRejectionReason(),
            r.getReviewedBy(), r.getSubmittedAt(), r.getReviewedAt()
        );
    }
}
