//package com.omnicivic.repository;
//
//import com.omnicivic.entity.Category;
//import com.omnicivic.entity.StaffCategory;
//import com.omnicivic.entity.UserAccount;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//
//@Repository
//public interface StaffCategoryRepository extends JpaRepository<StaffCategory, Long> {
//    List<StaffCategory> findAllByStaff(UserAccount staff);
//    List<StaffCategory> findAllByCategory(Category category);
//    void deleteByStaffAndCategory(UserAccount staff, Category category);
//    void deleteAllByCategory(Category category);
//    boolean existsByStaffAndCategory(UserAccount staff, Category category);
//    List<StaffCategory> findAllByCommunityPrefix(String prefix);
//}


package com.omnicivic.repository;

import com.omnicivic.entity.Category;
import com.omnicivic.entity.StaffCategory;
import com.omnicivic.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StaffCategoryRepository extends JpaRepository<StaffCategory, Long> {
    List<StaffCategory> findAllByStaff(UserAccount staff);
    List<StaffCategory> findAllByCategory(Category category);
    void deleteByStaffAndCategory(UserAccount staff, Category category);
    void deleteAllByCategory(Category category);
    void deleteAllByStaff(UserAccount staff);
    boolean existsByStaffAndCategory(UserAccount staff, Category category);
    List<StaffCategory> findAllByCommunityPrefix(String prefix);
}
