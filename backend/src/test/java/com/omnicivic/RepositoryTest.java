package com.omnicivic;

import com.omnicivic.entity.*;
import com.omnicivic.enums.ComplaintStatus;
import com.omnicivic.enums.Role;
import com.omnicivic.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class RepositoryTest {

    @Autowired CommunityRepository communityRepo;
    @Autowired UserAccountRepository userRepo;
    @Autowired CategoryRepository categoryRepo;
    @Autowired ComplaintRepository complaintRepo;

    private static final String PREFIX = "TST1";

    @BeforeEach
    void setUp() {
        communityRepo.save(Community.builder()
            .communityPrefix(PREFIX).name("Test Community").active(true).build());

        userRepo.save(UserAccount.builder()
            .communityPrefix(PREFIX).username("TST1ADMIN")
            .password("hashed").firstName("Admin").lastName("User")
            .role(Role.ADMIN).firstLogin(false).active(true).build());
    }

    @Test
    void communityPrefixIsUnique() {
        assertThat(communityRepo.existsByCommunityPrefix(PREFIX)).isTrue();
        assertThat(communityRepo.existsByCommunityPrefix("NONE")).isFalse();
    }

    @Test
    void userFoundByUsername() {
        var user = userRepo.findByUsername("TST1ADMIN");
        assertThat(user).isPresent();
        assertThat(user.get().getRole()).isEqualTo(Role.ADMIN);
    }

    @Test
    void categoryIsolatedByPrefix() {
        categoryRepo.save(Category.builder().communityPrefix(PREFIX)
            .name("Roads").active(true).build());
        categoryRepo.save(Category.builder().communityPrefix("OTH2")
            .name("Water").active(true).build());

        List<Category> results = categoryRepo.findAllByCommunityPrefixAndActiveTrue(PREFIX);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getName()).isEqualTo("Roads");
    }

    @Test
    void haversineDetectsNearbyComplaint() {
        UserAccount user = userRepo.findByUsername("TST1ADMIN").get();
        Category cat = categoryRepo.save(Category.builder()
            .communityPrefix(PREFIX).name("Roads").active(true).build());

        // Save a complaint at lat/lng 13.0827, 80.2707 (Chennai center)
        complaintRepo.save(Complaint.builder()
            .communityPrefix(PREFIX)
            .submittedBy(user).category(cat)
            .description("Pothole")
            .latitude(13.0827).longitude(80.2707)
            .status(ComplaintStatus.OPEN)
            .upvoteCount(0)
            .build());

        // Query within 50m — should find it
        List<Complaint> nearby = complaintRepo.findNearbyOpenComplaints(
            PREFIX, cat.getId(), 13.0827, 80.2707, 50.0);
        assertThat(nearby).hasSize(1);

        // Query 1km away — should NOT find it
        List<Complaint> farAway = complaintRepo.findNearbyOpenComplaints(
            PREFIX, cat.getId(), 13.0918, 80.2800, 50.0);
        assertThat(farAway).isEmpty();
    }
}
