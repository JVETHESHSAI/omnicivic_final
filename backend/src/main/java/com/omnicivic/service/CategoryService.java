//package com.omnicivic.service;
//
//import com.omnicivic.dto.request.CategoryRequest;
//import com.omnicivic.entity.Category;
//import com.omnicivic.entity.StaffCategory;
//import com.omnicivic.entity.UserAccount;
//import com.omnicivic.enums.Role;
//import com.omnicivic.exception.BadRequestException;
//import com.omnicivic.exception.ResourceNotFoundException;
//import com.omnicivic.repository.CategoryRepository;
//import com.omnicivic.repository.StaffCategoryRepository;
//import com.omnicivic.repository.UserAccountRepository;
//import com.omnicivic.util.SecurityContextUtil;
//import lombok.RequiredArgsConstructor;
//import org.springframework.cache.annotation.CacheEvict;
//import org.springframework.cache.annotation.Cacheable;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class CategoryService {
//
//    private final CategoryRepository categoryRepo;
//    private final StaffCategoryRepository staffCategoryRepo;
//    private final UserAccountRepository userRepo;
//
//    @Cacheable(value = "categories", key = "#root.target.getCurrentPrefix()")
//    public List<Category> getAllCategories() {
//        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
//        return categoryRepo.findAllByCommunityPrefixAndActiveTrue(prefix);
//    }
//
//    @Transactional
//    @CacheEvict(value = "categories", allEntries = true)
//    public Category createCategory(CategoryRequest request) {
//        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
//        if (categoryRepo.existsByNameAndCommunityPrefix(request.name(), prefix)) {
//            throw new BadRequestException("Category already exists: " + request.name());
//        }
//        Category category = Category.builder()
//            .communityPrefix(prefix)
//            .name(request.name())
//            .description(request.description())
//            .iconName(request.iconName())
//            .active(true)
//            .build();
//        return categoryRepo.save(category);
//    }
//
//    @Transactional
//    @CacheEvict(value = "categories", allEntries = true)
//    public Category updateCategory(Long id, CategoryRequest request) {
//        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
//        Category category = categoryRepo.findByIdAndCommunityPrefix(id, prefix)
//            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
//        category.setName(request.name());
//        category.setDescription(request.description());
//        category.setIconName(request.iconName());
//        return categoryRepo.save(category);
//    }
//
//    @Transactional
//    public void deleteCategory(Long id) {
//        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
//        Category category = categoryRepo.findByIdAndCommunityPrefix(id, prefix)
//            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
//        // Delete staff-category links first to avoid FK constraint violation
//        staffCategoryRepo.deleteAllByCategory(category);
//        // Then hard-delete the category
//        categoryRepo.delete(category);
//    }
//
//    @Transactional
//    public void assignStaffToCategory(Long categoryId, Long staffId) {
//        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
//        Category category = categoryRepo.findByIdAndCommunityPrefix(categoryId, prefix)
//            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
//        UserAccount staff = userRepo.findByIdAndCommunityPrefix(staffId, prefix)
//            .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
//        if (staff.getRole() != Role.STAFF) {
//            throw new BadRequestException("User is not a staff member");
//        }
//        if (!staffCategoryRepo.existsByStaffAndCategory(staff, category)) {
//            staffCategoryRepo.save(StaffCategory.builder()
//                .communityPrefix(prefix)
//                .staff(staff)
//                .category(category)
//                .build());
//        }
//    }
//
//    @Transactional
//    public void removeStaffFromCategory(Long categoryId, Long staffId) {
//        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
//        Category category = categoryRepo.findByIdAndCommunityPrefix(categoryId, prefix)
//            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
//        UserAccount staff = userRepo.findByIdAndCommunityPrefix(staffId, prefix)
//            .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
//        staffCategoryRepo.deleteByStaffAndCategory(staff, category);
//    }
//
//    public List<UserAccount> getStaffForCategory(Long categoryId) {
//        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
//        Category category = categoryRepo.findByIdAndCommunityPrefix(categoryId, prefix)
//            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
//        return staffCategoryRepo.findAllByCategory(category)
//            .stream().map(StaffCategory::getStaff).toList();
//    }
//
//
//    public String getCurrentPrefix() {
//        return com.omnicivic.util.SecurityContextUtil.getCurrentCommunityPrefix();
//    }
//}



package com.omnicivic.service;

import com.omnicivic.dto.request.CategoryRequest;
import com.omnicivic.dto.response.UserResponse;
import com.omnicivic.entity.Category;
import com.omnicivic.entity.StaffCategory;
import com.omnicivic.entity.UserAccount;
import com.omnicivic.enums.Role;
import com.omnicivic.exception.BadRequestException;
import com.omnicivic.exception.ResourceNotFoundException;
import com.omnicivic.repository.CategoryRepository;
import com.omnicivic.repository.StaffCategoryRepository;
import com.omnicivic.repository.UserAccountRepository;
import com.omnicivic.util.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepo;
    private final StaffCategoryRepository staffCategoryRepo;
    private final UserAccountRepository userRepo;

    @Cacheable(value = "categories", key = "#root.target.getCurrentPrefix()")
    public List<Category> getAllCategories() {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        return categoryRepo.findAllByCommunityPrefixAndActiveTrue(prefix);
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public Category createCategory(CategoryRequest request) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        if (categoryRepo.existsByNameAndCommunityPrefix(request.name(), prefix)) {
            throw new BadRequestException("Category already exists: " + request.name());
        }
        Category category = Category.builder()
                .communityPrefix(prefix)
                .name(request.name())
                .description(request.description())
                .iconName(request.iconName())
                .active(true)
                .build();
        return categoryRepo.save(category);
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public Category updateCategory(Long id, CategoryRequest request) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Category category = categoryRepo.findByIdAndCommunityPrefix(id, prefix)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        category.setName(request.name());
        category.setDescription(request.description());
        category.setIconName(request.iconName());
        return categoryRepo.save(category);
    }

    @Transactional
    @CacheEvict(value = "categories", allEntries = true)
    public void deleteCategory(Long id) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Category category = categoryRepo.findByIdAndCommunityPrefix(id, prefix)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        // Delete staff-category links first to avoid FK constraint violation
        staffCategoryRepo.deleteAllByCategory(category);
        // Then hard-delete the category
        categoryRepo.delete(category);
    }

    @Transactional
    public void assignStaffToCategory(Long categoryId, Long staffId) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Category category = categoryRepo.findByIdAndCommunityPrefix(categoryId, prefix)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        UserAccount staff = userRepo.findByIdAndCommunityPrefix(staffId, prefix)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        if (staff.getRole() != Role.STAFF) {
            throw new BadRequestException("User is not a staff member");
        }
        if (!staffCategoryRepo.existsByStaffAndCategory(staff, category)) {
            staffCategoryRepo.save(StaffCategory.builder()
                    .communityPrefix(prefix)
                    .staff(staff)
                    .category(category)
                    .build());
        }
    }

    @Transactional
    public void removeStaffFromCategory(Long categoryId, Long staffId) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Category category = categoryRepo.findByIdAndCommunityPrefix(categoryId, prefix)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        UserAccount staff = userRepo.findByIdAndCommunityPrefix(staffId, prefix)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        staffCategoryRepo.deleteByStaffAndCategory(staff, category);
    }

    public List<UserAccount> getStaffForCategory(Long categoryId) {
        String prefix = SecurityContextUtil.getCurrentCommunityPrefix();
        Category category = categoryRepo.findByIdAndCommunityPrefix(categoryId, prefix)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return staffCategoryRepo.findAllByCategory(category)
                .stream().map(StaffCategory::getStaff).toList();
    }

    /** Returns staff as UserResponse DTOs — safe for JSON serialization */
    public List<UserResponse> getStaffForCategoryAsDto(Long categoryId) {
        return getStaffForCategory(categoryId).stream()
                .map(u -> new UserResponse(
                        u.getId(), u.getUsername(), u.getFirstName(), u.getLastName(),
                        u.getEmail(), u.getPhone(),
                        u.getAvatarBase64(), u.getBio(),
                        u.getRole(), u.getCommunityPrefix(),
                        u.isActive(), u.isFirstLogin(), u.getCreatedAt()))
                .toList();
    }


    public String getCurrentPrefix() {
        return com.omnicivic.util.SecurityContextUtil.getCurrentCommunityPrefix();
    }
}
