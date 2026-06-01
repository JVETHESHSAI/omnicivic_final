package com.omnicivic.repository;

import com.omnicivic.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findAllByCommunityPrefixAndActiveTrue(String prefix);
    Optional<Category> findByIdAndCommunityPrefix(Long id, String prefix);
    boolean existsByNameAndCommunityPrefix(String name, String prefix);
}
