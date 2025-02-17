package com._7.reshub.reshub.Controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    static class UserProfile {
        public String id;
        public String name;
        public String gender;
        public String bio;

        public UserProfile(String id, String name, String gender, String bio) {
            this.id = id;
            this.name = name;
            this.gender = gender;
            this.bio = bio;
        }
    }

    private List<UserProfile> dummyProfiles = List.of(
        new UserProfile("1", "Alice", "Female", "I love painting and hiking."),
        new UserProfile("2", "Bob", "Male", "Tech enthusiast and coffee lover."),
        new UserProfile("3", "Charlie", "Non-binary", "Music producer and traveler.")
    );

    @GetMapping("getProfiles")
    public List<UserProfile> getProfiles(@RequestParam String genderFilter) {
        return dummyProfiles.stream()
            .filter(profile -> genderFilter.equalsIgnoreCase("All") || profile.gender.equalsIgnoreCase(genderFilter))
            .collect(Collectors.toList());
    }
}
