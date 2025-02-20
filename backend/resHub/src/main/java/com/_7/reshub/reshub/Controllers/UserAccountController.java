package com._7.reshub.reshub.Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserAccountController {

    private final DynamoDbClient dynamoDbClient;
    private final PasswordEncoder passwordEncoder;

    // Constructor injection
    public UserAccountController(DynamoDbClient dynamoDbClient, PasswordEncoder passwordEncoder) {
        this.dynamoDbClient = dynamoDbClient;
        this.passwordEncoder = passwordEncoder;
    }

    // Map the JSON body of the signup request
    public static class SignUpRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String phoneNumber;
        private String password;

        // Getters and setters (for Spring to map JSON to this class)
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    // The POST endpoint for sign up
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequest request) {

        // Check if any required field is missing or empty
        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty() ||
            request.getLastName() == null || request.getLastName().trim().isEmpty() ||
            request.getEmail() == null || request.getEmail().trim().isEmpty() ||
            request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty() ||
            request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("All fields are required.");
        }

        // Validate the @purdue.edu domain
        if (!request.getEmail().endsWith("@purdue.edu")) {
            return ResponseEntity.badRequest().body("Email must end with @purdue.edu");
        }

        // Check if the user already exists in DynamoDB (by email)
        Map<String, AttributeValue> key = new HashMap<>();
        key.put("email", AttributeValue.builder().s(request.getEmail()).build());

        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName("userAccounts") // Use your actual table name
                .key(key)
                .build();
        GetItemResponse getItemResponse = dynamoDbClient.getItem(getItemRequest);

        if (getItemResponse.hasItem()) {
            // A user with this email already exists
            return ResponseEntity.badRequest().body("Email already registered. Please log in or use a different email.");
        }

        // Hash the password using BCrypt
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Create a new record for DynamoDB with the hashed password
        Map<String, AttributeValue> newItem = new HashMap<>();
        newItem.put("email", AttributeValue.builder().s(request.getEmail()).build());
        newItem.put("firstName", AttributeValue.builder().s(request.getFirstName()).build());
        newItem.put("lastName", AttributeValue.builder().s(request.getLastName()).build());
        newItem.put("phoneNumber", AttributeValue.builder().s(request.getPhoneNumber()).build());
        newItem.put("password", AttributeValue.builder().s(hashedPassword).build());

        // Put the item in DynamoDB
        PutItemRequest putItemRequest = PutItemRequest.builder()
                .tableName("userAccounts")
                .item(newItem)
                .build();

        dynamoDbClient.putItem(putItemRequest);

        // Return success response
        return ResponseEntity.ok("User registered successfully");
    }
}
