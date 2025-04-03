package com._7.reshub.reshub.Services;

import com._7.reshub.reshub.Configs.DynamoDbConfig;
import com._7.reshub.reshub.Models.Profile;
import com._7.reshub.reshub.Models.ProfileMetadata;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;
import software.amazon.awssdk.services.dynamodb.model.UpdateItemRequest;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    @Autowired
    private DynamoDbConfig dynamoDbConfig;

    @Autowired
    private DynamoDbClient dynamoDbClient;

    @Autowired
    private SwipeService swipeService;

    /*
     * Handles retrieving information for the given user id and returns a Profile
     * object
     */
    public Profile doGetProfile(String userId) {
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());

        GetItemRequest getItemRequest = GetItemRequest.builder()
            .tableName(dynamoDbConfig.getUserProfilesTableName())
            .key(key)
            .build();

        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);

        if (response.hasItem()) {
            Map<String, AttributeValue> item = response.item();
    
            Profile profile = convertDynamoItemToProfile(item);
            return profile;
        }

        return null;
    }

    public List<Profile> doGetProfiles(String userId, String genderFilter, boolean filterOutSwipedOn) {
        // Scan request to fetch profiles from DynamoDB
        ScanRequest scanRequest = ScanRequest.builder()
            .tableName(dynamoDbConfig.getUserProfilesTableName())
            .build();
        ScanResponse scanResponse = dynamoDbClient.scan(scanRequest);
        
        // Convert DynamoDB items to Profile object and filter by gender and exclude logged-in user
        List<Profile> profiles = scanResponse.items().stream()
            .filter(item -> !item.get("userId").s().equals(userId))
            .filter(item -> "All".equalsIgnoreCase(genderFilter) || 
                    (item.containsKey("gender") && item.get("gender").s().equalsIgnoreCase(genderFilter)))
            .map(this::convertDynamoItemToProfile)
            .collect(Collectors.toList());
    
        return profiles;
    }

    public List<Profile> doSortProfiles(String userId, List<Profile> profiles) {
        List<String> usersWhoSwipedRight = swipeService.doGetAllUsersWhoSwipedRightOn(userId);
    
        // Precompute liked status and last active times using parallel streams to improve load times
        List<ProfileMetadata> profileMetadataList = profiles.parallelStream()
            .map(profile -> {
                boolean isLiked = usersWhoSwipedRight.contains(profile.getUserId().toString());
    
                // Get the last time active or set it to a very old timestamp if null
                long lastActive = (profile.getLastTimeActive() != null)
                    ? profile.getLastTimeActive().toEpochMilli()
                    : Long.MIN_VALUE;
    
                return new ProfileMetadata(profile, isLiked, lastActive);
            })
            .collect(Collectors.toList());
    
        // Sort profiles: first by liked status (true comes first), then by last time active (most recent comes first)
        profileMetadataList.sort((metadata1, metadata2) -> {
            if (metadata1.getIsLiked() != metadata2.getIsLiked()) {
                return Boolean.compare(metadata2.getIsLiked(), metadata1.getIsLiked());
            }
    
            return Long.compare(metadata2.getLastActive(), metadata1.getLastActive());
        });
    
        return profileMetadataList.stream()
            .map(ProfileMetadata::getProfile)
            .collect(Collectors.toList());
    }
    
    private Profile convertDynamoItemToProfile(Map<String, AttributeValue> item) {
        return new Profile(
            item.getOrDefault("userId", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("fullName", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("gender", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("major", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("minor", AttributeValue.builder().s("").build()).s(),
            Integer.parseInt(item.getOrDefault("age", AttributeValue.builder().n("0").build()).n()),
            item.getOrDefault("residence", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("hobbies", AttributeValue.builder().l(Collections.emptyList()).build()).l()
                .stream().map(AttributeValue::s).collect(Collectors.toList()),
            item.getOrDefault("graduationYear", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("bio", AttributeValue.builder().s("").build()).s(),
            Optional.ofNullable(item.getOrDefault("lastTimeActive", AttributeValue.builder().s("").build()).s())
                .filter(s -> !s.isEmpty())
                .map(Instant::parse)
                .orElse(null),
            item.getOrDefault("profilePicUrl", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("smokingStatus", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("cleanlinessLevel", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("sleepSchedule", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("guestFrequency", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("hasPets", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("noiseLevel", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("sharingCommonItems", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("dietaryPreference", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("allergies", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommateSmokingPreference", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommateCleanlinessLevel", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommateSleepSchedule", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommateGuestFrequency", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommatePetPreference", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommateNoiseTolerance", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommateSharingCommonItems", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommateDietaryPreference", AttributeValue.builder().s("").build()).s()
        );
    }
    
    
    /*
     * Handles retrieving the user ids and then user names of the users blocked by the given user.
     */
    public List<String> doGetBlockedUsers(String userId) {
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());

        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .build();

        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);

        if (response.hasItem()) {
            Map<String, AttributeValue> item = response.item();
            AttributeValue blockedUsersAttribute = item.get("blockedUsers");

            if (blockedUsersAttribute != null && blockedUsersAttribute.l() != null) {
                List<String> blockedUserIds = blockedUsersAttribute.l().stream()
                        .map(AttributeValue::s)
                        .collect(Collectors.toList());

                // Fetch full names for each blocked user ID
                List<String> blockedUserFullNames = blockedUserIds.stream()
                        .map(blockedUserId -> getFullNameForUserId(blockedUserId))
                        .collect(Collectors.toList());

                return blockedUserFullNames;
            }
        }
        return Collections.emptyList();
    }

    // Helper method to fetch the full name for a given user ID
    private String getFullNameForUserId(String userId) {
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());

        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .attributesToGet("fullName") // Fetch only the fullName attribute
                .build();

        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);

        if (response.hasItem() && response.item().containsKey("fullName")) {
            return response.item().get("fullName").s();
        } else {
            return "User ID: " + userId; // Or handle the case where the name is not found
        }
    }


    public boolean isUserBlocked(String blockerId, String blockedId) {
        try {
            List<String> blockedUsers = doGetBlockedUsers(blockerId);
            return blockedUsers.contains(blockedId);
        } catch (Exception e) {
            throw new RuntimeException("Error checking blocked status", e);
        }
    }

    /*
     * Handles adding the new blocked user to the user1's account in the accounts
     * table
     */
    /*public void doAddToBlockedUsers(String blockerId, String blockedId) {
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(blockerId).build());
    
        Map<String, AttributeValue> updateValues = Map.of(
                ":blockedId", AttributeValue.builder().s(blockedId).build()
        );
    
        UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .updateExpression("SET blockedUsers = list_append(blockedUsers, :blockedUser)")
                .expressionAttributeValues(updateValues)
                .build();
    
        dynamoDbClient.updateItem(updateRequest);
    }*/

    public void doAddToBlockedUsers(String blockerId, String blockedId) {
        List<String> blockedUsers = new ArrayList<>(doGetBlockedUsers(blockerId)); // Assuming doGetBlockedUsers works

        if (!blockedUsers.contains(blockedId)) {
            blockedUsers.add(blockedId);
        }

        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(blockerId).build());

        Map<String, AttributeValue> updateValues = Map.of(
                ":newBlockedUsers", AttributeValue.builder().l(blockedUsers.stream()
                        .map(blocked -> AttributeValue.builder().s(blocked).build())
                        .collect(Collectors.toList())).build()
        );

        UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .updateExpression("SET blockedUsers = :newBlockedUsers")
                .expressionAttributeValues(updateValues)
                .build();

        dynamoDbClient.updateItem(updateRequest);
    }

}
