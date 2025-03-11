package com._7.reshub.reshub.Models.Requests;

import java.util.List;

// Class representing the JSON body for a profile creation request.
public class ProfileRequest {
    private String userId;
    private String email; // User email (unique key)
    private String fullName; // Full name of the user
    private String gender; // Gender (dropdown)
    private String major; // Major field of study
    private String minor; // Minor field (optional)
    private int age; // Age (numeric input)
    private String residence; // Residence name (e.g., res hall, apt, house, etc.)
    private List<String> hobbies; // Hobbies as an array (multi-select ui)
    private String graduationYear; // Graduation year (dropdown: "2025", … ,"2030", or "n/a")
    private String bio; // Bio (paragraph about themselves for their profile)
    private String profilePicUrl; //Profile Picture (upload)

    public String getUserId() {
        return userId;
    }

    // Getters and setters for JSON mapping
    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getGender() {
        return gender;
    }

    public String getMajor() {
        return major;
    }

    public String getMinor() {
        return minor;
    }

    public Integer getAge() {
        return age;
    }

    public String getResidence() {
        return residence;
    }

    public List<String> getHobbies() {
        return hobbies;
    }

    public String getGraduationYear() {
        return graduationYear;
    }

    public String getBio() {
        return bio;
    }

    public String getProfilePicUrl() {
        return profilePicUrl;
    }
}
