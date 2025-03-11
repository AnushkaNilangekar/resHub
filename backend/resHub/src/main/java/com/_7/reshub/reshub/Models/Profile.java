package com._7.reshub.reshub.Models;

import java.util.List;

/*
 * This class is separate from the ProfileRequest class because it should be used for
 * implementing any logic relating to user profiles. That way we can keep the logic
 * and request data separate since the request can't change but this class may need to.
 */
public class Profile {
    private String userId;
    private String email;
    private String fullName; //TODO should we separate this into first and last name so we can only use one or the other when needed?
    private String gender;
    private String major;
    private String minor; 
    private int age;
    private String residence;
    private List<String> hobbies; 
    private String graduationYear;
    private String bio;
    private String profilePicUrl;

    public Profile(
        String fullName,
        String gender,
        String major,
        String minor,
        int age,
        String residence,
        List<String> hobbies,
        String graduationYear,
        String bio,
        String profilePictureUrl)
    {
        this.fullName = fullName;
        this.gender = gender;
        this.major = major;
        this.minor = minor;
        this.age = age;
        this.residence = residence;
        this.hobbies = hobbies;
        this.graduationYear = graduationYear;
        this.bio = bio;
        this.profilePicUrl = profilePictureUrl;
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

    public String getProfilePicUrl()
    {
        return profilePicUrl;
    }
}
