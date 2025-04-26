package com._7.reshub.reshub.Models;

import java.time.Instant;
import java.util.List;

/*
 * This class is separate from the ProfileRequest class because it should be used for
 * implementing any logic relating to user profiles. That way we can keep the logic
 * and request data separate since the request can't change but this class may need to.
 */
public class Profile {
    private String userId;
    private String email;
    private String fullName; // TODO: Consider separating this into first and last name if needed.
    private String gender;
    private String major;
    private String minor;
    private int age;
    private String residence;
    private List<String> hobbies;
    private String graduationYear;
    private String bio;
    private Instant lastTimeActive;
    private String profilePicUrl;

    // New fields for the user's own traits
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

    //Notifs
    private Double notifVolume;
    private Boolean matchSoundEnabled;
    private Boolean messageSoundEnabled;

    /**
     * Constructor for Profile including new traits and roommate preferences.
     */
    public Profile(
            String userId,
            String fullName,
            String email,
            String gender,
            String major,
            String minor,
            Integer age,
            String residence,
            List<String> hobbies,
            String graduationYear,
            String bio,
            Instant lastTimeActive,
            String profilePicUrl,
            String smokingStatus,
            String cleanlinessLevel,
            String sleepSchedule,
            String guestFrequency,
            String hasPets,
            String noiseLevel,
            String sharingCommonItems,
            String dietaryPreference,
            String allergies,
            String roommateSmokingPreference,
            String roommateCleanlinessLevel,
            String roommateSleepSchedule,
            String roommateGuestFrequency,
            String roommatePetPreference,
            String roommateNoiseTolerance,
            String roommateSharingCommonItems,
            String roommateDietaryPreference, 
            Double notifVolume,
            Boolean matchSoundEnabled,
            Boolean messageSoundEnabled
        ) 
        {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.gender = gender;
        this.major = major;
        this.minor = minor;
        this.age = age;
        this.residence = residence;
        this.hobbies = hobbies;
        this.graduationYear = graduationYear;
        this.bio = bio;
        this.lastTimeActive = lastTimeActive;
        this.profilePicUrl = profilePicUrl;
        this.smokingStatus = smokingStatus;
        this.cleanlinessLevel = cleanlinessLevel;
        this.sleepSchedule = sleepSchedule;
        this.guestFrequency = guestFrequency;
        this.hasPets = hasPets;
        this.noiseLevel = noiseLevel;
        this.sharingCommonItems = sharingCommonItems;
        this.dietaryPreference = dietaryPreference;
        this.allergies = allergies;
        this.roommateSmokingPreference = roommateSmokingPreference;
        this.roommateCleanlinessLevel = roommateCleanlinessLevel;
        this.roommateSleepSchedule = roommateSleepSchedule;
        this.roommateGuestFrequency = roommateGuestFrequency;
        this.roommatePetPreference = roommatePetPreference;
        this.roommateNoiseTolerance = roommateNoiseTolerance;
        this.roommateSharingCommonItems = roommateSharingCommonItems;
        this.roommateDietaryPreference = roommateDietaryPreference;
        this.notifVolume = notifVolume != null ? notifVolume : 1.0;
        this.matchSoundEnabled = matchSoundEnabled != null ? matchSoundEnabled : true; 
        this.messageSoundEnabled = messageSoundEnabled != null ? messageSoundEnabled : true; 
    }

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

    public int getAge() {
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

    public Instant getLastTimeActive() {
        return lastTimeActive;
    }

    public String getProfilePicUrl() {
        return profilePicUrl;
    }

    // Getters for user's own traits
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

    // Getters for roommate preferences
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

    public Double getNotifVolume() {
        return notifVolume;
    }
    public Boolean getMatchSoundEnabled() {
        return matchSoundEnabled;
    }
    
    public Boolean getMessageSoundEnabled() {
        return messageSoundEnabled;
    }
}
