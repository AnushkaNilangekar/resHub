package com._7.reshub.reshub.Models;

import java.util.List;

public class Profile {
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

    public Profile(
        String fullName,
        String gender,
        String major,
        String minor,
        int age,
        String residence,
        List<String> hobbies,
        String graduationYear,
        String bio)
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
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public String getMinor() {
        return minor;
    }

    public void setMinor(String minor) {
        this.minor = minor;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getResidence() {
        return residence;
    }

    public void setResidence(String residence) {
        this.residence = residence;
    }

    public List<String> getHobbies() {
        return hobbies;
    }

    public void setHobbies(List<String> hobbies) {
        this.hobbies = hobbies;
    }

    public String getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(String graduationYear) {
        this.graduationYear = graduationYear;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }
}
