package com.omnicivic.util;

import com.omnicivic.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UsernameGenerator {

    private final UserAccountRepository userAccountRepository;

    /**
     * Resident/Staff: {firstName}{PREFIX}  → e.g. johnWFC1
     * On collision, appends sequence: johnWFC12, johnWFC13 …
     */
    public String generateForUser(String firstName, String communityPrefix) {
        String base = firstName.toLowerCase() + communityPrefix;
        if (!userAccountRepository.existsByUsername(base)) {
            return base;
        }
        int seq = 2;
        while (userAccountRepository.existsByUsername(base + seq)) {
            seq++;
        }
        return base + seq;
    }

    /**
     * Admin: {PREFIX}ADMIN  → e.g. WFC1ADMIN
     * On collision (co-admin additions), appends sequence.
     */
    public String generateForAdmin(String communityPrefix) {
        String base = communityPrefix + "ADMIN";
        if (!userAccountRepository.existsByUsername(base)) {
            return base;
        }
        int seq = 2;
        while (userAccountRepository.existsByUsername(base + seq)) {
            seq++;
        }
        return base + seq;
    }

    /**
     * Temporary password generation.
     */
    public String generateTempPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(chars.charAt((int) (Math.random() * chars.length())));
        }
        return sb.toString();
    }
}
