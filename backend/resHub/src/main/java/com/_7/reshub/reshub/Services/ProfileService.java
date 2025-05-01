package com._7.reshub.reshub.Services;

import com._7.reshub.reshub.Configs.DynamoDbConfig;

import com._7.reshub.reshub.Models.Profile;
import com._7.reshub.reshub.Models.ProfileMetadata;
import com._7.reshub.reshub.Models.QueryMatchesResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.BatchGetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.BatchGetItemResponse;
import software.amazon.awssdk.services.dynamodb.model.DynamoDbException;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;
import software.amazon.awssdk.services.dynamodb.model.KeysAndAttributes;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;
import software.amazon.awssdk.services.dynamodb.model.UpdateItemRequest;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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

    @Autowired
    private FaissService faissService;

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

    // public List<Profile> doGetProfiles(String userId, String genderFilter, boolean filterOutSwipedOn) {
    //     // Fetch blocked users list
    //     List<String> blockedUsers = doGetBlockedUsers(userId);
        
    //     // Scan request to fetch profiles from DynamoDB
    //     ScanRequest scanRequest = ScanRequest.builder()
    //         .tableName(dynamoDbConfig.getUserProfilesTableName())
    //         .build();
    //     ScanResponse scanResponse = dynamoDbClient.scan(scanRequest);
        
    //     // Convert DynamoDB items to Profile object and filter by gender and exclude logged-in user
    //     List<Profile> profiles = scanResponse.items().stream()
    //         .filter(item -> !item.get("userId").s().equals(userId))
    //         .filter(item -> !blockedUsers.contains(item.get("userId").s()))
    //         .filter(item -> "All".equalsIgnoreCase(genderFilter) || 
    //                 (item.containsKey("gender") && item.get("gender").s().equalsIgnoreCase(genderFilter)))
    //         .map(this::convertDynamoItemToProfile)
    //         .collect(Collectors.toList());
    
    //     return profiles;
    // }

    // TODO: Cache user vector in AsyncStorage on signup, login, and profile edit so we dont have to refetch every time?
    private List<Double> getUserVector(String userId) {
        GetItemRequest request = GetItemRequest.builder()
            .tableName(dynamoDbConfig.getUserProfilesTableName())
            .key(Map.of("userId", AttributeValue.builder().s(userId).build()))
            .attributesToGet("normalizedWeightedPrefs") // Adjust if stored under a different key
            .build();
    
        Map<String, AttributeValue> item = dynamoDbClient.getItem(request).item();
    
        if (item == null || !item.containsKey("normalizedWeightedPrefs")) {
            return null;
        }
    
        // Assuming the vector is stored as a list of numbers in a string set or list
        List<AttributeValue> vectorValues = item.get("normalizedWeightedPrefs").l();
    
        return vectorValues.stream()
            .map(attr -> Double.parseDouble(attr.n()))
            .collect(Collectors.toList());
    }    

    public List<Profile> doGetProfiles(String userId, String genderFilter, boolean filterOutSwipedOn) {
        List<String> blockedUsers = doGetBlockedUsers(userId);

        List<Double> userVector = getUserVector(userId);

        if (userVector == null || userVector.isEmpty()) {
            return List.of();
        }

        // Query FAISS for top 100 matches
        QueryMatchesResponse matchesResponse = faissService.doQueryMatches(userVector, 10);
        List<String> topUserIds = matchesResponse.getUserIds();

        // No matches found
        if (topUserIds == null || topUserIds.isEmpty()) {
            return List.of();
        }

        List<String> filteredUserIds = topUserIds.stream()
            .filter(id -> id != null)
            .collect(Collectors.toList());

        // No filtered matches found
        if (filteredUserIds == null || filteredUserIds.isEmpty()) {
            return List.of();
        }
        
        // Convert to DynamoDB key format
        List<Map<String, AttributeValue>> keys = filteredUserIds.stream()
            .map(id -> Map.of("userId", AttributeValue.builder().s(String.valueOf(id)).build()))
            .collect(Collectors.toList());

        // Prepare BatchGetItemRequest
        KeysAndAttributes keysAndAttributes = KeysAndAttributes.builder()
            .keys(keys)
            .build();

        Map<String, KeysAndAttributes> requestItems = Map.of(
            dynamoDbConfig.getUserProfilesTableName(), keysAndAttributes
        );

        BatchGetItemRequest batchRequest = BatchGetItemRequest.builder()
            .requestItems(requestItems)
            .build();

        BatchGetItemResponse batchResponse = dynamoDbClient.batchGetItem(batchRequest);

        List<Map<String, AttributeValue>> items = batchResponse.responses()
            .get(dynamoDbConfig.getUserProfilesTableName());

        // Filter by gender, self, and blocked users
        Map<String, Profile> profileMap = items.stream()
            .filter(item -> {
                String id = item.get("userId").s();
                return !id.equals(userId)
                    && !blockedUsers.contains(id)
                    && ("All".equalsIgnoreCase(genderFilter) ||
                        (item.containsKey("gender") &&
                        item.get("gender").s().equalsIgnoreCase(genderFilter)));
            })
            .map(this::convertDynamoItemToProfile)
            .collect(Collectors.toMap(Profile::getUserId, p -> p));

        // Return in FAISS order
        return filteredUserIds.stream()
            .map(id -> profileMap.get(String.valueOf(id)))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
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
            item.getOrDefault("email", AttributeValue.builder().s("").build()).s(),
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
            parseIfNumberElseZero(item.getOrDefault("smokingStatus", AttributeValue.builder().n("0").build())),
            parseIfNumberElseZero(item.getOrDefault("cleanlinessLevel", AttributeValue.builder().n("0").build())),
            parseIfNumberElseZero(item.getOrDefault("sleepSchedule", AttributeValue.builder().n("0").build())),
            parseIfNumberElseZero(item.getOrDefault("guestFrequency", AttributeValue.builder().n("0").build())),
            parseIfNumberElseZero(item.getOrDefault("hasPets", AttributeValue.builder().n("0").build())),
            parseIfNumberElseZero(item.getOrDefault("noiseLevel", AttributeValue.builder().n("0").build())),
            parseIfNumberElseZero(item.getOrDefault("sharingCommonItems", AttributeValue.builder().n("0").build())),
            parseIfNumberElseZero(item.getOrDefault("dietaryPreference", AttributeValue.builder().n("0").build())),
            item.getOrDefault("allergies", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommateSmokingPreference", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommateCleanlinessLevel", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommateSleepSchedule", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommateGuestFrequency", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommatePetPreference", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommateNoiseTolerance", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommateSharingCommonItems", AttributeValue.builder().s("").build()).s(),
            item.getOrDefault("roommateDietaryPreference", AttributeValue.builder().s("").build()).s(),
            item.containsKey("notifVolume") 
            ? Double.valueOf(item.get("notifVolume").n()) 
            : 1.0,
            item.containsKey("matchSoundEnabled") ? item.get("matchSoundEnabled").bool() : true,
            item.containsKey("messageSoundEnabled") ? item.get("messageSoundEnabled").bool() : true,
            item.getOrDefault("botConversationId", AttributeValue.builder().s("").build()).s()
        );
    }
    
    /*
     * Since some preferences are already saved as strings from previous versions of our app,
     * ensure that this case is handled accordingly (all string values= 0).
     */
    private int parseIfNumberElseZero(AttributeValue attr) {
        if (attr == null || attr.n() == null) return 0;
        try {
            return Integer.parseInt(attr.n());
        } catch (NumberFormatException e) {
            return 0;
        }
    }    
    
    /*
     * Handles retrieving the user ids of the users blocked by the given user.
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

                return blockedUserIds;
            }
        }
        return Collections.emptyList();
    }

    /*
     * Handles retrieving the user ids and then user names of the users blocked by the given user.
     */
    public List<String> doGetBlockedUserNames(String userId) {
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
    public String getFullNameForUserId(String userId) {
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
    public void doAddToBlockedUsers(String blockerId, String blockedId) {
        List<String> blockedUsers = new ArrayList<>(doGetBlockedUsers(blockerId));

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

    public Map<String, List<Double>> getUserIdsAndVectors() {
        Map<String, List<Double>> userProfiles = new HashMap<>();
        
        try {
            ScanRequest scanRequest = ScanRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .attributesToGet("userId", "normalizedWeightedPrefs")
                .build();
            
            ScanResponse scanResponse = dynamoDbClient.scan(scanRequest);

            for (Map<String, AttributeValue> item : scanResponse.items()) {
                String userId = item.get("userId").s();
                
                // Extract and convert normalizedWeightedPrefs (list of numbers)
                if (item.containsKey("normalizedWeightedPrefs") && 
                item.get("normalizedWeightedPrefs") != null && 
                item.get("normalizedWeightedPrefs").hasL()) {
                    List<AttributeValue> rawValues = item.get("normalizedWeightedPrefs").l();
                    List<Double> normalizedWeightedPrefs = new ArrayList<>();
                    
                    for (AttributeValue value : rawValues) {
                        normalizedWeightedPrefs.add(Double.parseDouble(value.n()));
                    }
                    
                    userProfiles.put(userId, normalizedWeightedPrefs);
                }
            }
            
            // Handle pagination if there are more items
            while (scanResponse.lastEvaluatedKey() != null && !scanResponse.lastEvaluatedKey().isEmpty()) {
                scanRequest = scanRequest.toBuilder()
                    .exclusiveStartKey(scanResponse.lastEvaluatedKey())
                    .build();
                scanResponse = dynamoDbClient.scan(scanRequest);
                
                for (Map<String, AttributeValue> item : scanResponse.items()) {
                    String userId = item.get("userId").s();
                    List<AttributeValue> rawValues = item.get("normalizedWeightedPrefs").l();
                    List<Double> normalizedWeightedPrefs = new ArrayList<>();
                    
                    for (AttributeValue value : rawValues) {
                        normalizedWeightedPrefs.add(Double.parseDouble(value.n()));
                    }
                    
                    userProfiles.put(userId, normalizedWeightedPrefs);
                }
            }
        } catch (DynamoDbException e) {
            e.printStackTrace();
            throw new RuntimeException("Error fetching data from DynamoDB", e);
        }
        
        return userProfiles;
    }

    /*
    * Handles adding the bot conversation ID to the user's profile.
    */
    public void doAddBotConversationId(String userId, String conversationId) {
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());

        Map<String, AttributeValue> updateValues = Map.of(
                ":newBotConversationId", AttributeValue.builder().s(conversationId).build()
        );

        UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .updateExpression("SET botConversationId = :newBotConversationId")
                .expressionAttributeValues(updateValues)
                .build();

        dynamoDbClient.updateItem(updateRequest);
    }
}