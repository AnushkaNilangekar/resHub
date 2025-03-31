package com._7.reshub.reshub.Models;

public class ProfileMetadata {
    private final Profile profile;
    private final boolean isLiked;
    private final long lastActive;

    public ProfileMetadata(Profile profile, boolean isLiked, long lastActive) {
        this.profile = profile;
        this.isLiked = isLiked;
        this.lastActive = lastActive;
    }
    
    public Profile getProfile() {
        return profile;
    }

    public boolean getIsLiked() {
        return isLiked;
    }

    public long getLastActive()
    {
        return lastActive;
    }
}