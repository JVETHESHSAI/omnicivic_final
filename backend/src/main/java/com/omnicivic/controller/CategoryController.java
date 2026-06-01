//package com.omnicivic.controller;
//
//import com.omnicivic.dto.request.CategoryRequest;
//import com.omnicivic.dto.response.UserResponse;
//import com.omnicivic.entity.Category;
//import com.omnicivic.entity.UserAccount;
//import com.omnicivic.service.CategoryService;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/categories")
//@RequiredArgsConstructor
//public class CategoryController {
//
//    private final CategoryService categoryService;
//
//    @GetMapping
//    public ResponseEntity<List<Category>> getAllCategories() {
//        return ResponseEntity.ok(categoryService.getAllCategories());
//    }
//
//    @PostMapping
//    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
//    public ResponseEntity<Category> createCategory(@Valid @RequestBody CategoryRequest request) {
//        return ResponseEntity.ok(categoryService.createCategory(request));
//    }
//
//    @PutMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
//    public ResponseEntity<Category> updateCategory(@PathVariable Long id,
//                                                    @Valid @RequestBody CategoryRequest request) {
//        return ResponseEntity.ok(categoryService.updateCategory(id, request));
//    }
//
//    @DeleteMapping("/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
//    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
//        categoryService.deleteCategory(id);
//        return ResponseEntity.noContent().build();
//    }
//
//    @PostMapping("/{id}/staff/{staffId}")
//    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
//    public ResponseEntity<Map<String, String>> assignStaff(@PathVariable Long id,
//                                                            @PathVariable Long staffId) {
//        categoryService.assignStaffToCategory(id, staffId);
//        return ResponseEntity.ok(Map.of("message", "Staff assigned successfully"));
//    }
//
//    @DeleteMapping("/{id}/staff/{staffId}")
//    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
//    public ResponseEntity<Void> removeStaff(@PathVariable Long id,
//                                             @PathVariable Long staffId) {
//        categoryService.removeStaffFromCategory(id, staffId);
//        return ResponseEntity.noContent().build();
//    }
//
//    @GetMapping("/{id}/staff")
//    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
//    public ResponseEntity<List<UserAccount>> getStaffForCategory(@PathVariable Long id) {
//        return ResponseEntity.ok(categoryService.getStaffForCategory(id));
//    }
//}

package com.omnicivic.controller;

import com.omnicivic.dto.request.CategoryRequest;
import com.omnicivic.dto.response.UserResponse;
import com.omnicivic.entity.Category;
import com.omnicivic.dto.response.UserResponse;
import com.omnicivic.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id,
                                                   @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/staff/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<Map<String, String>> assignStaff(@PathVariable Long id,
                                                           @PathVariable Long staffId) {
        categoryService.assignStaffToCategory(id, staffId);
        return ResponseEntity.ok(Map.of("message", "Staff assigned successfully"));
    }

    @DeleteMapping("/{id}/staff/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<Void> removeStaff(@PathVariable Long id,
                                            @PathVariable Long staffId) {
        categoryService.removeStaffFromCategory(id, staffId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/staff")
    @PreAuthorize("hasAnyRole('ADMIN','CO_ADMIN')")
    public ResponseEntity<List<UserResponse>> getStaffForCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getStaffForCategoryAsDto(id));
    }
}
