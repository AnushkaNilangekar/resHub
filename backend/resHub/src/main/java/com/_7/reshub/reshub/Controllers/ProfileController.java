package com._7.reshub.reshub.Controllers;

import com._7.reshub.reshub.Models.Requests.ProfileRequest;
import com._7.reshub.reshub.Services.ProfileService;
import com._7.reshub.reshub.Models.Profile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProfileController {

    @Autowired
    private DynamoDbClient dynamoDbClient;

    @Autowired
    private ProfileService profileService;

    /*
     * GET endpoint to retrieve information for a given user.
     * @params
     * userId: The id of the user whose profile should be retrieved
     * @return
     * Profile object
     */
    @GetMapping("/getProfile")
    public ResponseEntity<?> getUserProfile(@RequestParam String userId) {
        try {
            Profile profile = profileService.retrieveProfile(userId);
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
                request.getResidence() == null || request.getResidence().trim().isEmpty() ||
                request.getHobbies() == null || request.getHobbies().isEmpty() ||
                request.getGraduationYear() == null || request.getGraduationYear().trim().isEmpty() ||
                request.getBio() == null || request.getBio().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("All fields are required.");
        }

        // Validate that the email ends with ".edu"
        if (!request.getEmail().endsWith(".edu")) {
            return ResponseEntity.badRequest().body("Email must end with .edu");
        }

        // Build the DynamoDB item.
        Map<String, AttributeValue> item = new HashMap<>();
        item.put("email", AttributeValue.builder().s(request.getEmail()).build());
        item.put("fullName", AttributeValue.builder().s(request.getFullName()).build());
        item.put("gender", AttributeValue.builder().s(request.getGender()).build());
        item.put("major", AttributeValue.builder().s(request.getMajor()).build());
        // For optional minor field: store an empty string if null.
        item.put("minor", AttributeValue.builder().s(request.getMinor() != null ? request.getMinor() : "").build());
        item.put("age", AttributeValue.builder().n(String.valueOf(request.getAge())).build());
        item.put("residence", AttributeValue.builder().s(request.getResidence()).build());
        // Convert the hobbies list into a DynamoDB List.
        item.put("hobbies", AttributeValue.builder().l(
                request.getHobbies().stream()
                        .map(hobby -> AttributeValue.builder().s(hobby).build())
                        .collect(Collectors.toList()))
                .build());
        item.put("graduationYear", AttributeValue.builder().s(request.getGraduationYear()).build());
        item.put("bio", AttributeValue.builder().s(request.getBio()).build());

        if (request.getProfilePicUrl() != null && !request.getProfilePicUrl().trim().isEmpty()) {
            item.put("profilePicUrl", AttributeValue.builder().s(request.getProfilePicUrl()).build());
        }

        // Save the item to the DynamoDB table.
        PutItemRequest putItemRequest = PutItemRequest.builder()
                .tableName("userProfiles")
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
    public ResponseEntity<String> profileExists(@RequestParam String email) {
        // Build the key using the provided email
        Map<String, AttributeValue> key = new HashMap<>();
        key.put("email", AttributeValue.builder().s(email).build());

        // Create a GET request to DynamoDB
        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName("userProfiles") 
                .key(key)
                .build();
        GetItemResponse getItemResponse = dynamoDbClient.getItem(getItemRequest);

        // Return a simple string if found, else 404
        if (getItemResponse.hasItem()) {
            return ResponseEntity.ok("exists");
        } else {
            return ResponseEntity.status(404).body("not exists");
        }
    }
}
