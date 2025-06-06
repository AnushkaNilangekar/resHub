package com._7.reshub.reshub.Models.Requests;

import java.util.List;

/*
 * This class represents the JSON body for a profile creation request.
 * It now includes additional fields for the user's own traits and their roommate preferences.
 */

public class ProfileRequest {
    private String userId;
    private String email; // User email (unique key)
    private String fullName; // Full name of the user
    private String gender; // Gender (dropdown)
    private String major; // Major field of study
    private String minor; // Minor field (optional)
    private int age; // Age (numeric input)
    private String residence; // Residence name (e.g., res hall, apt, house, etc.)
    private List<String> hobbies; // Hobbies as an array (multi-select UI)
    private String graduationYear; // Graduation year (dropdown: "2025", … ,"2030", or "n/a")
    private String bio; // Bio (paragraph about themselves for their profile)
    private String profilePicUrl; // Profile Picture (upload)

    // New fields for user's own traits
    private String smokingStatus;
    private String cleanlinessLevel;
    private String sleepSchedule;
    private String guestFrequency;
    private String hasPets;
    private String noiseLevel;
    private String sharingCommonItems;
    private String dietaryPreference;
    private String allergies;
    // New fields for roommate preferences
    private String roommateSmokingPreference;
    private String roommateCleanlinessLevel;
    private String roommateSleepSchedule;
    private String roommateGuestFrequency;
    private String roommatePetPreference;
    private String roommateNoiseTolerance;
    private String roommateSharingCommonItems;
    private String roommateDietaryPreference;

    // Getters for all fields

    public String getUserId() {
        return userId;
    }

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

    public String getSmokingStatus() {
        return smokingStatus;
    }

    public String getCleanlinessLevel() {
        return cleanlinessLevel;
    }

    public String getSleepSchedule() {
        return sleepSchedule;
    }

    public String getGuestFrequency() {
        return guestFrequency;
    }

    public String getHasPets() {
        return hasPets;
    }

    public String getNoiseLevel() {
        return noiseLevel;
    }

    public String getSharingCommonItems() {
        return sharingCommonItems;
    }

    public String getDietaryPreference() {
        return dietaryPreference;
    }

    public String getAllergies() {
        return allergies;
    }

    public String getRoommateSmokingPreference() {
        return roommateSmokingPreference;
    }

    public String getRoommateCleanlinessLevel() {
        return roommateCleanlinessLevel;
    }

    public String getRoommateSleepSchedule() {
        return roommateSleepSchedule;
    }

    public String getRoommateGuestFrequency() {
        return roommateGuestFrequency;
    }

    public String getRoommatePetPreference() {
        return roommatePetPreference;
    }

    public String getRoommateNoiseTolerance() {
        return roommateNoiseTolerance;
    }

    public String getRoommateSharingCommonItems() {
        return roommateSharingCommonItems;
    }

    public String getRoommateDietaryPreference() {
        return roommateDietaryPreference;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public void setMinor(String minor) {
        this.minor = minor;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public void setResidence(String residence) {
        this.residence = residence;
    }

    public void setHobbies(List<String> hobbies) {
        this.hobbies = hobbies;
    }

    public void setGraduationYear(String graduationYear) {
        this.graduationYear = graduationYear;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setProfilePicUrl(String profilePicUrl) {
        this.profilePicUrl = profilePicUrl;
    }

    public void setSmokingStatus(String smokingStatus) {
        this.smokingStatus = smokingStatus;
    }

    public void setCleanlinessLevel(String cleanlinessLevel) {
        this.cleanlinessLevel = cleanlinessLevel;
    }

    public void setSleepSchedule(String sleepSchedule) {
        this.sleepSchedule = sleepSchedule;
    }

    public void setGuestFrequency(String guestFrequency) {
        this.guestFrequency = guestFrequency;
    }

    public void setHasPets(String hasPets) {
        this.hasPets = hasPets;
    }

    public void setNoiseLevel(String noiseLevel) {
        this.noiseLevel = noiseLevel;
    }

    public void setSharingCommonItems(String sharingCommonItems) {
        this.sharingCommonItems = sharingCommonItems;
    }

    public void setDietaryPreference(String dietaryPreference) {
        this.dietaryPreference = dietaryPreference;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    public void setRoommateSmokingPreference(String roommateSmokingPreference) {
        this.roommateSmokingPreference = roommateSmokingPreference;
    }

    public void setRoommateCleanlinessLevel(String roommateCleanlinessLevel) {
        this.roommateCleanlinessLevel = roommateCleanlinessLevel;
    }

    public void setRoommateSleepSchedule(String roommateSleepSchedule) {
        this.roommateSleepSchedule = roommateSleepSchedule;
    }

    public void setRoommateGuestFrequency(String roommateGuestFrequency) {
        this.roommateGuestFrequency = roommateGuestFrequency;
    }

    public void setRoommatePetPreference(String roommatePetPreference) {
        this.roommatePetPreference = roommatePetPreference;
    }

    public void setRoommateNoiseTolerance(String roommateNoiseTolerance) {
        this.roommateNoiseTolerance = roommateNoiseTolerance;
    }

    public void setRoommateSharingCommonItems(String roommateSharingCommonItems) {
        this.roommateSharingCommonItems = roommateSharingCommonItems;
    }

    public void setRoommateDietaryPreference(String roommateDietaryPreference) {
        this.roommateDietaryPreference = roommateDietaryPreference;
    }
}
