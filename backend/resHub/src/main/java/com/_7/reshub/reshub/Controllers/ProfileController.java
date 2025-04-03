package com._7.reshub.reshub.Controllers;

import com._7.reshub.reshub.Models.Requests.ProfileRequest;
import com._7.reshub.reshub.Services.ProfileService;
import com._7.reshub.reshub.Services.SwipeService;
import com._7.reshub.reshub.Models.Profile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProfileController {

    @Autowired
    private DynamoDbClient dynamoDbClient;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private SwipeService swipeService;

    /*
     * GET endpoint to retrieve information for a given user.
     * 
     * @params
     * userId: The id of the user whose profile should be retrieved
     * 
     * @return
     * Profile object
     */
    @GetMapping("/getProfile")
    public ResponseEntity<?> getUserProfile(@RequestParam String userId) {
        try {
            Profile profile = profileService.doGetProfile(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST endpoint to create a new user profile.
     * Validates that all required fields are provided and that the email ends with
     * ".edu".
     * Also checks if a profile already exists for the given email.
     *
     * @param request The profile data from the frontend.
     * @return 200 OK if the profile is created successfully; 400 Bad Request if
     *         validation fails.
     */
    @PostMapping("/profile")
    public ResponseEntity<?> createProfile(@RequestBody ProfileRequest request) {
        // Validate that all required fields are provided.
        if (request.getEmail() == null || request.getEmail().trim().isEmpty() ||
                request.getFullName() == null || request.getFullName().trim().isEmpty() ||
                request.getGender() == null || request.getGender().trim().isEmpty() ||
                request.getMajor() == null || request.getMajor().trim().isEmpty() ||
                request.getAge() == null ||
                request.getGraduationYear() == null || request.getGraduationYear().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("All fields are required.");
        }

        // Validate that the email ends with ".edu"
        if (!request.getEmail().endsWith(".edu")) {
            return ResponseEntity.badRequest().body("Email must end with .edu");
        }

        // Build the DynamoDB item.
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("userId", AttributeValue.builder().s(request.getUserId()).build());
        item.put("email", AttributeValue.builder().s(request.getEmail()).build());
        item.put("fullName", AttributeValue.builder().s(request.getFullName()).build());
        item.put("gender", AttributeValue.builder().s(request.getGender()).build());
        item.put("major", AttributeValue.builder().s(request.getMajor()).build());
        // For optional minor field: store an empty string if null.
        item.put("minor", AttributeValue.builder().s(request.getMinor() != null ? request.getMinor() : "").build());
        item.put("age", AttributeValue.builder().n(String.valueOf(request.getAge())).build());
        item.put("residence", AttributeValue.builder()
                .s(request.getResidence() != null ? request.getResidence() : "")
                .build());
        // Convert the hobbies list into a DynamoDB List.
        item.put("hobbies", AttributeValue.builder()
                .l(request.getHobbies() != null ? request.getHobbies().stream()
                        .map(hobby -> AttributeValue.builder().s(hobby).build())
                        .collect(Collectors.toList()) : Collections.emptyList())
                .build());
        item.put("graduationYear", AttributeValue.builder().s(request.getGraduationYear()).build());
        item.put("bio", AttributeValue.builder()
                .s(request.getBio() != null ? request.getBio() : "")
                .build());

        item.put("smokingStatus", AttributeValue.builder()
                .s(request.getSmokingStatus() != null ? request.getSmokingStatus() : "").build());
        item.put("cleanlinessLevel", AttributeValue.builder()
                .s(request.getCleanlinessLevel() != null ? request.getCleanlinessLevel() : "").build());
        item.put("sleepSchedule", AttributeValue.builder()
                .s(request.getSleepSchedule() != null ? request.getSleepSchedule() : "").build());
        item.put("guestFrequency", AttributeValue.builder()
                .s(request.getGuestFrequency() != null ? request.getGuestFrequency() : "").build());
        item.put("hasPets",
                AttributeValue.builder().s(request.getHasPets() != null ? request.getHasPets() : "").build());
        item.put("noiseLevel",
                AttributeValue.builder().s(request.getNoiseLevel() != null ? request.getNoiseLevel() : "").build());
        item.put("sharingCommonItems", AttributeValue.builder()
                .s(request.getSharingCommonItems() != null ? request.getSharingCommonItems() : "").build());
        item.put("dietaryPreference", AttributeValue.builder()
                .s(request.getDietaryPreference() != null ? request.getDietaryPreference() : "").build());
        item.put("allergies",
                AttributeValue.builder().s(request.getAllergies() != null ? request.getAllergies() : "").build());
        item.put("roommateSmokingPreference",
                AttributeValue.builder()
                        .s(request.getRoommateSmokingPreference() != null ? request.getRoommateSmokingPreference() : "")
                        .build());
        item.put("roommateCleanlinessLevel", AttributeValue.builder()
                .s(request.getRoommateCleanlinessLevel() != null ? request.getRoommateCleanlinessLevel() : "").build());
        item.put("roommateSleepSchedule", AttributeValue.builder()
                .s(request.getRoommateSleepSchedule() != null ? request.getRoommateSleepSchedule() : "").build());
        item.put("roommateGuestFrequency", AttributeValue.builder()
                .s(request.getRoommateGuestFrequency() != null ? request.getRoommateGuestFrequency() : "").build());
        item.put("roommatePetPreference", AttributeValue.builder()
                .s(request.getRoommatePetPreference() != null ? request.getRoommatePetPreference() : "").build());
        item.put("roommateNoiseTolerance", AttributeValue.builder()
                .s(request.getRoommateNoiseTolerance() != null ? request.getRoommateNoiseTolerance() : "").build());
        item.put("roommateSharingCommonItems",
                AttributeValue.builder().s(
                        request.getRoommateSharingCommonItems() != null ? request.getRoommateSharingCommonItems() : "")
                        .build());
        item.put("roommateDietaryPreference",
                AttributeValue.builder()
                        .s(request.getRoommateDietaryPreference() != null ? request.getRoommateDietaryPreference() : "")
                        .build());

        String profilePicUrl = request.getProfilePicUrl();
        if (profilePicUrl == null || profilePicUrl.trim().isEmpty()) {
            profilePicUrl = "https://reshub-profile-pics.s3.amazonaws.com/default-avatar.jpg";
        }
        item.put("profilePicUrl", AttributeValue.builder().s(profilePicUrl).build());

        // Save the item to the DynamoDB table.
        PutItemRequest putItemRequest = PutItemRequest.builder()
                .tableName("profiles")
                .item(item)
                .build();
        dynamoDbClient.putItem(putItemRequest);

        return ResponseEntity.ok("Profile created successfully");
    }

    /**
     * GET endpoint that checks whether a profile exists for the specified email.
     * 
     * @param email The email address to check for an existing profile.
     * @return A ResponseEntity containing "exists" if the profile is found, or "not
     *         exists" with HTTP 404 if not.
     */

    @GetMapping("/profile/exists")
    public ResponseEntity<String> profileExists(@RequestParam String userId) {
        // Build the key using the provided userId
        Map<String, AttributeValue> key = new HashMap<>();
        key.put("userId", AttributeValue.builder().s(userId).build());

        // Create a GET request to DynamoDB
        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName("profiles")
                .key(key)
                .build();
        GetItemResponse getItemResponse = dynamoDbClient.getItem(getItemRequest);

        // Return a simple string if found, else 404
        if (getItemResponse.hasItem()) {
            return ResponseEntity.ok("exists");
        } else {
            return ResponseEntity.ok("not exists");
        }
    }

    /**
     * GET endpoint that returns the list of all profiles filtered based on gender
     * and sorted on if they've liked the current user (primary) and how recently active the profile is (secondary).
     * 
     * @param userId            The user currently looking at the page (will not be
     *                          included in result)
     * @param genderFilter      The gender filter to filter profiles by.
     * @param filterOutSwipedOn If true, filters out userIds that the current user
     *                          has already swiped on
     * @return A ResponseEntity containing the list of filtered profiles with HTTP
     *         200,
     *         or an empty list if no profiles match the filter.
     */

     @GetMapping("/getProfiles")
     public ResponseEntity<?> getProfiles(@RequestParam String userId, @RequestParam String genderFilter, @RequestParam boolean filterOutSwipedOn) {
         try {
             List<Profile> profiles = profileService.doGetProfiles(userId, genderFilter, filterOutSwipedOn);
 
             if (filterOutSwipedOn) {
                 List<String> swipedUserIds = swipeService.doGetAllSwipedOn(userId);
 
                 profiles = profiles.stream()
                 .filter(profile -> {
                                 Object userIdObj = profile.getUserId();
                                 return userIdObj != null && !swipedUserIds.contains(userIdObj.toString());
                         })
                         .collect(Collectors.toList());
             }
 
             profiles = profileService.doSortProfiles(userId, profiles);
 
             return ResponseEntity.ok(profiles.isEmpty() ? Collections.emptyList() : profiles);
         } catch (Exception e) {
             e.printStackTrace();
             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                     .body(Map.of("error", e.getMessage()));
         }
     }
     /**
      * PUT endpoint that updates a user's profile information.
      * 
      * @param request The request body containing updated profile details.
      * @return A ResponseEntity with HTTP 200 if the update is successful,
      *         HTTP 400 if the request is invalid, or HTTP 404 if the user profile is not found.
      */
@PutMapping("/updateProfile")
public ResponseEntity<?> updateProfile(@RequestBody ProfileRequest request) {
    try {
        if (request.getUserId() == null || request.getUserId().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("User ID is required");
        }

        Map<String, AttributeValue> key = new HashMap<>();
        key.put("userId", AttributeValue.builder().s(request.getUserId()).build());

        GetItemRequest getItemRequest = GetItemRequest.builder()
            .tableName("profiles")
            .key(key)
            .build();
        GetItemResponse getItemResponse = dynamoDbClient.getItem(getItemRequest);

        if (!getItemResponse.hasItem()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User profile not found");
        }

        Map<String, AttributeValue> attributeValues = new HashMap<>();
        Map<String, String> expressionAttributeNames = new HashMap<>();
        StringBuilder updateExpression = new StringBuilder("SET ");
        List<String> updateList = new ArrayList<>();

        // Basic Profile Info
        addAttribute(updateList, attributeValues, expressionAttributeNames, "fullName", request.getFullName());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "email", request.getEmail());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "age", request.getAge());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "gender", request.getGender());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "major", request.getMajor());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "minor", request.getMinor());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "graduationYear", request.getGraduationYear());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "residence", request.getResidence());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "bio", request.getBio());
        
        // Hobbies 
        if (request.getHobbies() != null && !request.getHobbies().isEmpty()) {
            String attributeKey = ":hobbiesValue";
            String expressionField = "#hobbies";
            
            expressionAttributeNames.put(expressionField, "hobbies");
            
            updateList.add(expressionField + " = " + attributeKey);
            attributeValues.put(attributeKey, AttributeValue.builder()
                .l(request.getHobbies().stream()
                    .map(hobby -> AttributeValue.builder().s(hobby).build())
                    .collect(Collectors.toList()))
                .build());
        }

        // Personal Traits
        addAttribute(updateList, attributeValues, expressionAttributeNames, "smokingStatus", request.getSmokingStatus());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "cleanlinessLevel", request.getCleanlinessLevel());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "sleepSchedule", request.getSleepSchedule());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "guestFrequency", request.getGuestFrequency());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "hasPets", request.getHasPets());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "noiseLevel", request.getNoiseLevel());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "sharingCommonItems", request.getSharingCommonItems());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "dietaryPreference", request.getDietaryPreference());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "allergies", request.getAllergies());

        // Roommate Preferences
        addAttribute(updateList, attributeValues, expressionAttributeNames, "roommateSmokingPreference", request.getRoommateSmokingPreference());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "roommateCleanlinessLevel", request.getRoommateCleanlinessLevel());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "roommateSleepSchedule", request.getRoommateSleepSchedule());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "roommateGuestFrequency", request.getRoommateGuestFrequency());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "roommatePetPreference", request.getRoommatePetPreference());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "roommateNoiseTolerance", request.getRoommateNoiseTolerance());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "roommateSharingCommonItems", request.getRoommateSharingCommonItems());
        addAttribute(updateList, attributeValues, expressionAttributeNames, "roommateDietaryPreference", request.getRoommateDietaryPreference());

        if (updateList.isEmpty()) {
            return ResponseEntity.badRequest().body("No fields to update");
        }

        updateExpression.append(String.join(", ", updateList));

        // Complete request
        UpdateItemRequest updateItemRequest = UpdateItemRequest.builder()
            .tableName("profiles")
            .key(key)
            .updateExpression(updateExpression.toString())
            .expressionAttributeNames(expressionAttributeNames)
            .expressionAttributeValues(attributeValues)
            .build();

        dynamoDbClient.updateItem(updateItemRequest);

        return ResponseEntity.ok("Profile updated successfully");
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", e.getMessage()));
    }
}
     
        //helper methods
        private void addAttribute(
        List<String> updateList, 
        Map<String, AttributeValue> attributeValues, 
        Map<String, String> expressionAttributeNames,
        String fieldName, 
        String value
        ) {
        if (value != null) {
                String cleanFieldName = fieldName.startsWith("#") ? fieldName.substring(1) : fieldName;
                
                String attributeKey = ":" + cleanFieldName + "Value";
                String expressionField = "#" + cleanFieldName;
                
                expressionAttributeNames.put(expressionField, cleanFieldName);
                
                updateList.add(expressionField + " = " + attributeKey);
                attributeValues.put(attributeKey, AttributeValue.builder().s(value).build());
        }
        }

        private void addAttribute(
        List<String> updateList, 
        Map<String, AttributeValue> attributeValues, 
        Map<String, String> expressionAttributeNames,
        String fieldName, 
        Integer value
        ) {
        if (value != null) {
                String cleanFieldName = fieldName.startsWith("#") ? fieldName.substring(1) : fieldName;
                
                String attributeKey = ":" + cleanFieldName + "Value";
                String expressionField = "#" + cleanFieldName;
                
                expressionAttributeNames.put(expressionField, cleanFieldName);
                
                updateList.add(expressionField + " = " + attributeKey);
                attributeValues.put(attributeKey, AttributeValue.builder().n(value.toString()).build());
        }
        }

        @PutMapping("/updateProfilePic")
        public ResponseEntity<?> updateProfilePic(@RequestBody Map<String, String> payload) {
        try {
                String userId = payload.get("userId");
                String profilePicUrl = payload.get("profilePicUrl");

                if (userId == null || userId.trim().isEmpty() || profilePicUrl == null || profilePicUrl.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("User ID and Profile Picture URL are required");
                }

                Map<String, AttributeValue> key = new HashMap<>();
                key.put("userId", AttributeValue.builder().s(userId).build());

                GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName("profiles")
                .key(key)
                .build();
                GetItemResponse getItemResponse = dynamoDbClient.getItem(getItemRequest);

                if (!getItemResponse.hasItem()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User profile not found");
                }

                Map<String, AttributeValue> attributeValues = new HashMap<>();
                attributeValues.put(":profilePicUrl", AttributeValue.builder().s(profilePicUrl).build());

                UpdateItemRequest updateItemRequest = UpdateItemRequest.builder()
                .tableName("profiles")
                .key(key)
                .updateExpression("SET profilePicUrl = :profilePicUrl")
                .expressionAttributeValues(attributeValues)
                .build();

                dynamoDbClient.updateItem(updateItemRequest);

                return ResponseEntity.ok("Profile picture updated successfully");
        } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
        }

        /**
 * DELETE endpoint to remove a user's profile from the database.
 * 
 * @param userId The ID of the user whose profile should be deleted
 * @return HTTP 200 if deletion is successful, HTTP 404 if profile not found, or HTTP 500 if an error occurs
 */
@DeleteMapping("/deleteProfile")
public ResponseEntity<?> deleteProfile(@RequestParam String userId) {
    try {
        // Build the key for the DynamoDB query
        Map<String, AttributeValue> key = new HashMap<>();
        key.put("userId", AttributeValue.builder().s(userId).build());

        // Check if the profile exists
        GetItemRequest getItemRequest = GetItemRequest.builder()
            .tableName("profiles")
            .key(key)
            .build();
        GetItemResponse getItemResponse = dynamoDbClient.getItem(getItemRequest);

        if (!getItemResponse.hasItem()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Profile not found for userId: " + userId));
        }

        // Delete the profile
        DeleteItemRequest deleteItemRequest = DeleteItemRequest.builder()
            .tableName("profiles")
            .key(key)
            .build();
        
        dynamoDbClient.deleteItem(deleteItemRequest);

        return ResponseEntity.ok(Map.of("message", "Profile deleted successfully"));
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
    }
}

        
        @GetMapping("/getBlockedUsers")
        public List<String> getBlockedUsers(@RequestParam String userId) {
                try {
                List<String> blockedUsers = profileService.doGetBlockedUsers(userId);
                return blockedUsers;
                } catch (Exception e) {
                e.printStackTrace();
                return List.of("Error: " + e.getMessage());
                }
        }

        @GetMapping("/isBlocked")
        public boolean isBlocked(@RequestParam String blockerId, @RequestParam String blockedId) {
                try {
                List<String> blockedUsers = getBlockedUsers(blockerId);
                return blockedUsers.contains(blockedId);
                } catch (Exception e) {
                e.printStackTrace();
                return false;
                }
        }

        @PostMapping("/blockUser")
        public ResponseEntity<?> blockUser(@RequestParam String blockerId, @RequestParam String blockedId) {
                try {
                profileService.doAddToBlockedUsers(blockerId, blockedId);
                return ResponseEntity.ok("Blocked successfully");
                } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.badRequest().body("Failed to block user: " + e.getMessage());
                }
        }

        /*@GetMapping("/getReportedChats")
        public List<String> getReportedChats(@RequestParam String userId) {
                try {
                List<String> reportedChats = chatService.doGetReportedChats(userId);
                return reportedChats;
                } catch (Exception e) {
                e.printStackTrace();
                return List.of("Error: " + e.getMessage());
                }
        }*/
}