package com.omnicivic.repository;

import com.omnicivic.entity.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {
    Optional<Community> findByCommunityPrefix(String prefix);
    boolean existsByCommunityPrefix(String prefix);
    List<Community> findAllByActiveTrue();
}
