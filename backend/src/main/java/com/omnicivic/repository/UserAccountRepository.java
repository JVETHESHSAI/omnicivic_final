package com.omnicivic.repository;

import com.omnicivic.entity.UserAccount;
import com.omnicivic.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {
    Optional<UserAccount> findByUsername(String username);
    boolean existsByUsername(String username);
    List<UserAccount> findAllByCommunityPrefixAndActiveTrue(String prefix);
    List<UserAccount> findAllByCommunityPrefixAndRoleAndActiveTrue(String prefix, Role role);
    Optional<UserAccount> findByIdAndCommunityPrefix(Long id, String prefix);
    long countByCommunityPrefixAndFirstNameAndLastNameAndCommunityPrefix(String prefix, String firstName, String lastName, String prefix2);
}
