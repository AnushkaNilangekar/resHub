package com._7.reshub.reshub.Models;

import java.time.Instant;
import java.util.UUID;

public class ForumPost {
    private String postId;
    private String userId;
    private String residenceHall;
    private String content;
    private Instant createdAt;
    private String fullName;

    public ForumPost() {
        this.postId = UUID.randomUUID().toString();
        this.createdAt = Instant.now();
    }

    public String getPostId() {
        return postId;
    }

    public void setPostId(String postId) {
        this.postId = postId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getResidenceHall() {
        return residenceHall;
    }

    public void setResidenceHall(String residenceHall) {
        this.residenceHall = residenceHall;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
}