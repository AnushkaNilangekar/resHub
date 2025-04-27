package com._7.reshub.reshub.Models.Requests;

import java.util.List;

public class CreateGroupRequest {
    private List<String> userIds;
    private String groupName;
     // Getters
     public List<String> getUserIds() {
        return userIds;
    }

    public String getGroupName() {
        return groupName;
    }
    
}
