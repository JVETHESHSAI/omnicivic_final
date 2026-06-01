package com.omnicivic.service;

import com.omnicivic.entity.Category;
import com.omnicivic.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DefaultCategorySeeder {

    private final CategoryRepository categoryRepo;

    public void seedForCommunity(String prefix) {
        String[][] defaults = {
            {"Roads & Lighting",  "Street lights, road damage, potholes, signs", "road"},
            {"Water Supply",      "Low pressure, leaks, discoloration, no water",  "water"},
            {"Electrical",        "Power outages, tripping, faulty wiring",        "electric"},
            {"Elevator",          "Stuck, noisy, door issues, out of service",     "lift"},
            {"Plumbing",          "Blocked drains, leaking pipes, sewage",         "pipe"},
            {"Landscaping",       "Overgrown hedges, fallen trees, dead plants",   "tree"},
            {"Garbage & Waste",   "Missed collection, overflowing bins, litter",   "trash"},
            {"Security",          "Broken gates, CCTV, lighting at entry points",  "lock"},
            {"Parking",           "Illegal parking, broken barriers, line marking","car"},
            {"Common Areas",      "Gym, clubhouse, hallways, lifts, lobby",        "building"},
            {"Others",            "Anything that doesn't fit above categories",    "misc"}
        };

        for (String[] category : defaults) {
            if (!categoryRepo.existsByNameAndCommunityPrefix(category[0], prefix)) {
                categoryRepo.save(Category.builder()
                    .communityPrefix(prefix)
                    .name(category[0])
                    .description(category[1])
                    .iconName(category[2])
                    .active(true)
                    .build());
            }
        }

        log.info("Seeded {} default categories for {}", defaults.length, prefix);
    }
}
