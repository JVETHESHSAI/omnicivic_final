//package com.omnicivic.service;
//
//import com.omnicivic.dto.request.CreateUserRequest;
//import com.omnicivic.dto.response.CreateUserResponse;
//import com.omnicivic.dto.response.UserResponse;
//import com.omnicivic.entity.UserAccount;
//import com.omnicivic.enums.Role;
//import com.omnicivic.exception.BadRequestException;
//import com.omnicivic.exception.ResourceNotFoundException;
//import com.omnicivic.repository.CommunityRepository;
//import com.omnicivic.repository.UserAccountRepository;
//import com.omnicivic.util.SecurityContextUtil;
//import com.omnicivic.util.UsernameGenerator;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class UserService {
//
//    private final UserAccountRepository userRepo;
//    private final CommunityRepository communityRepo;
//    private final UsernameGenerator usernameGenerator;
//    private final PasswordEncoder passwordEncoder;
//    private final EmailService emailService;
//
//    @Transactional
//    public CreateUserResponse createResident(CreateUserRequest request) {
//        return createUser(request, Role.RESIDENT);
//    }
//
//    @Transactional
//    public CreateUserResponse createStaff(CreateUserRequest request) {
//        return createUser(request, Role.STAFF);
//    }
//
//    @Transactional
//    public CreateUserResponse createCoAdmin(CreateUserRequest request) {
//        return createUser(request, Role.CO_ADMIN);
//    }
//
//    private CreateUserResponse createUser(CreateUserRequest request, Role role) {
//        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
//        String username = usernameGenerator.generateForUser(request.firstName(), prefix);
//        String tempPassword = usernameGenerator.generateTempPassword();
//
//        UserAccount user = UserAccount.builder()
//            .communityPrefix(prefix)
//            .username(username)
//            .password(passwordEncoder.encode(tempPassword))
//            .tempPasswordPlain(tempPassword)
//            .firstName(request.firstName())
//            .lastName(request.lastName())
//            .email(request.email())
//            .phone(request.phone())
//            .role(role)
//            .firstLogin(true)
//            .active(true)
//            .build();
//
//        userRepo.save(user);
//
//        // Email credentials automatically (best-effort, never blocks)
//        String orgName = communityRepo.findByCommunityPrefix(prefix)
//            .map(c -> c.getName())
//            .orElse(prefix);
//        String displayName = (request.firstName() + " " + request.lastName()).trim();
//        emailService.sendCredentials(
//            request.email(), displayName, orgName,
//            username, tempPassword, role.name(), prefix);
//
//        return new CreateUserResponse(user.getId(), username, tempPassword,
//            user.getFirstName(), user.getLastName(), user.getEmail(), role, prefix);
//    }
//
//    public List<UserResponse> getAllUsers() {
//        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
//        return userRepo.findAllByCommunityPrefixAndActiveTrue(prefix)
//            .stream().map(this::toResponse).toList();
//    }
//
//    public List<UserResponse> getUsersByRole(Role role) {
//        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
//        return userRepo.findAllByCommunityPrefixAndRoleAndActiveTrue(prefix, role)
//            .stream().map(this::toResponse).toList();
//    }
//
//    @Transactional
//    public UserResponse deactivateUser(Long userId) {
//        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
//        UserAccount user = userRepo.findByIdAndCommunityPrefix(userId, prefix)
//            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
//
//        if (user.getRole() == Role.ADMIN) {
//            throw new BadRequestException("Cannot deactivate the admin account");
//        }
//        user.setActive(false);
//        return toResponse(userRepo.save(user));
//    }
//
//    public UserResponse getCurrentUser() {
//        Long userId = SecurityContextUtil.getCurrentUserId();
//        return userRepo.findById(userId)
//            .map(this::toResponse)
//            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
//    }
//
//    @Transactional
//    public UserResponse updateProfile(UpdateProfileRequest request) {
//        Long userId = SecurityContextUtil.getCurrentUserId();
//        UserAccount user = userRepo.findById(userId)
//            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
//        if (request.firstName() != null && !request.firstName().isBlank())
//            user.setFirstName(request.firstName().trim());
//        if (request.lastName() != null && !request.lastName().isBlank())
//            user.setLastName(request.lastName().trim());
//        if (request.phone() != null) user.setPhone(request.phone().trim());
//        if (request.bio() != null) user.setBio(request.bio().trim());
//        if (request.avatarBase64() != null) user.setAvatarBase64(request.avatarBase64());
//        return toResponse(userRepo.save(user));
//    }
//
//    public record UpdateProfileRequest(
//        String firstName,
//        String lastName,
//        String phone,
//        String bio,
//        String avatarBase64
//    ) {}
//
//    private UserResponse toResponse(UserAccount u) {
//        return new UserResponse(u.getId(), u.getUsername(), u.getFirstName(), u.getLastName(),
//            u.getEmail(), u.getPhone(), u.getAvatarBase64(), u.getBio(),
//            u.getRole(), u.getCommunityPrefix(),
//            u.isActive(), u.isFirstLogin(), u.getCreatedAt());
//    }
//}


package com.omnicivic.service;

import com.omnicivic.dto.request.CreateUserRequest;
import com.omnicivic.dto.response.CreateUserResponse;
import com.omnicivic.dto.response.UserResponse;
import com.omnicivic.entity.UserAccount;
import com.omnicivic.enums.Role;
import com.omnicivic.exception.BadRequestException;
import com.omnicivic.exception.ResourceNotFoundException;
import com.omnicivic.repository.CommunityRepository;
import com.omnicivic.repository.StaffCategoryRepository;
import com.omnicivic.repository.UserAccountRepository;
import com.omnicivic.util.SecurityContextUtil;
import com.omnicivic.util.UsernameGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserAccountRepository userRepo;
    private final CommunityRepository communityRepo;
    private final StaffCategoryRepository staffCategoryRepo;
    private final UsernameGenerator usernameGenerator;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public CreateUserResponse createResident(CreateUserRequest request) {
        return createUser(request, Role.RESIDENT);
    }

    @Transactional
    public CreateUserResponse createStaff(CreateUserRequest request) {
        return createUser(request, Role.STAFF);
    }

    @Transactional
    public CreateUserResponse createCoAdmin(CreateUserRequest request) {
        return createUser(request, Role.CO_ADMIN);
    }

    private CreateUserResponse createUser(CreateUserRequest request, Role role) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        String username = usernameGenerator.generateForUser(request.firstName(), prefix);
        String tempPassword = usernameGenerator.generateTempPassword();

        UserAccount user = UserAccount.builder()
                .communityPrefix(prefix)
                .username(username)
                .password(passwordEncoder.encode(tempPassword))
                .tempPasswordPlain(tempPassword)
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .phone(request.phone())
                .role(role)
                .firstLogin(true)
                .active(true)
                .build();

        userRepo.save(user);

        // Email credentials automatically (best-effort, never blocks)
        String orgName = communityRepo.findByCommunityPrefix(prefix)
                .map(c -> c.getName())
                .orElse(prefix);
        String displayName = (request.firstName() + " " + request.lastName()).trim();
        emailService.sendCredentials(
                request.email(), displayName, orgName,
                username, tempPassword, role.name(), prefix);

        return new CreateUserResponse(user.getId(), username, tempPassword,
                user.getFirstName(), user.getLastName(), user.getEmail(), role, prefix);
    }

    public List<UserResponse> getAllUsers() {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        return userRepo.findAllByCommunityPrefixAndActiveTrue(prefix)
                .stream().map(this::toResponse).toList();
    }

    public List<UserResponse> getUsersByRole(Role role) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        return userRepo.findAllByCommunityPrefixAndRoleAndActiveTrue(prefix, role)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public UserResponse deactivateUser(Long userId) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        UserAccount user = userRepo.findByIdAndCommunityPrefix(userId, prefix)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot deactivate the admin account");
        }
        user.setActive(false);
        userRepo.save(user);

        // If staff — remove from all category assignments in this community
        if (user.getRole() == Role.STAFF) {
            staffCategoryRepo.deleteAllByStaff(user);
        }

        return toResponse(user);
    }

    public UserResponse getCurrentUser() {
        Long userId = SecurityContextUtil.getCurrentUserId();
        return userRepo.findById(userId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        Long userId = SecurityContextUtil.getCurrentUserId();
        UserAccount user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (request.firstName() != null && !request.firstName().isBlank())
            user.setFirstName(request.firstName().trim());
        if (request.lastName() != null && !request.lastName().isBlank())
            user.setLastName(request.lastName().trim());
        if (request.phone() != null) user.setPhone(request.phone().trim());
        if (request.bio() != null) user.setBio(request.bio().trim());
        if (request.avatarBase64() != null) user.setAvatarBase64(request.avatarBase64());
        return toResponse(userRepo.save(user));
    }

    public record UpdateProfileRequest(
            String firstName,
            String lastName,
            String phone,
            String bio,
            String avatarBase64
    ) {}

    private UserResponse toResponse(UserAccount u) {
        return new UserResponse(u.getId(), u.getUsername(), u.getFirstName(), u.getLastName(),
                u.getEmail(), u.getPhone(), u.getAvatarBase64(), u.getBio(),
                u.getRole(), u.getCommunityPrefix(),
                u.isActive(), u.isFirstLogin(), u.getCreatedAt());
    }
}
