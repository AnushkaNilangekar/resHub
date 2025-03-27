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
     * GET endpoint that returns the list of all profiles filtered based on gender.
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
     public ResponseEntity<?> getProfiles(@RequestParam String userId, @RequestParam String genderFilter,
             @RequestParam boolean filterOutSwipedOn) {
         try {
             List<Map<String, Object>> profiles = profileService.doGetProfiles(userId, genderFilter);
 
             if (filterOutSwipedOn) {
                 List<String> swipedUserIds = swipeService.doGetAllSwipedOn(userId);
 
                 profiles = profiles.stream()
                         .filter(profile -> {
                             Object userIdObj = profile.get("userId");
                             return userIdObj != null && !swipedUserIds.contains(userIdObj.toString());
                         })
                         .collect(Collectors.toList());
             }
 
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
     
             System.out.println("Received Update Request:");
             System.out.println("User ID: " + request.getUserId());
             System.out.println("Full Name: " + request.getFullName());
             System.out.println("Gender: " + request.getGender());
             System.out.println("Major: " + request.getMajor());
             System.out.println("Minor: " + request.getMinor());
             System.out.println("Graduation Year: " + request.getGraduationYear());
             System.out.println("Residence: " + request.getResidence());
             System.out.println("Bio: " + request.getBio());
             System.out.println("Hobbies: " + (request.getHobbies() != null ? request.getHobbies().toString() : "null"));
     
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
     
             addAttribute(updateList, attributeValues, expressionAttributeNames, "age", request.getAge());
             addAttribute(updateList, attributeValues, expressionAttributeNames, "bio", request.getBio());
             addAttribute(updateList, attributeValues, expressionAttributeNames, "gender", request.getGender());
             addAttribute(updateList, attributeValues, expressionAttributeNames, "major", request.getMajor());
             addAttribute(updateList, attributeValues, expressionAttributeNames, "minor", request.getMinor());
             addAttribute(updateList, attributeValues, expressionAttributeNames, "residence", request.getResidence());
             addAttribute(updateList, attributeValues, expressionAttributeNames, "graduationYear", request.getGraduationYear());
             
             // handle hobbies 
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
     
             if (updateList.isEmpty()) {
                 return ResponseEntity.badRequest().body("No fields to update");
             }
     
             updateExpression.append(String.join(", ", updateList));
     
             // complete request
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
     
}
        