package com._7.reshub.reshub.Controllers;

import com._7.reshub.reshub.Models.Requests.SignUpRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class UserAccountController {

    @Autowired
    private final DynamoDbClient dynamoDbClient;
    // Create a BCryptPasswordEncoder instance for password hashing
    private final PasswordEncoder passwordEncoder;

    // Constructor injection
    public UserAccountController(DynamoDbClient dynamoDbClient, PasswordEncoder passwordEncoder) {
        this.dynamoDbClient = dynamoDbClient;
        this.passwordEncoder = passwordEncoder;
    }

    // The POST endpoint for sign up
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequest request) {

        // Check if any required field is missing or empty
        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty() ||
            request.getLastName() == null || request.getLastName().trim().isEmpty() ||
            request.getEmail() == null || request.getEmail().trim().isEmpty() ||
            request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("All fields are required.");
        }

        String email = request.getEmail();
        String domain = "@purdue.edu";
        // Validate that the email ends with ".edu"
        if (!email.endsWith(domain) || email.length() <= domain.length()) {
            return ResponseEntity.badRequest().body("Email must end with .edu and fulfill minimum length requirement.");
        }

        /// Check if the user already exists in DynamoDB (by email)
        QueryRequest queryRequest = QueryRequest.builder()
            .tableName("accounts") // Use your actual table name
            .indexName("email-index") // Replace with your actual GSI name
            .keyConditionExpression("email = :email")
            .expressionAttributeValues(Map.of(
            ":email", AttributeValue.builder().s(request.getEmail()).build()
            ))
            .build();

        QueryResponse queryResponse = dynamoDbClient.query(queryRequest);

        if (!queryResponse.items().isEmpty()) {
            // A user with this email already exists
            return ResponseEntity.badRequest().body("Email already registered. Please log in or use a different email.");
        }

        // Hash the password using BCrypt
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        // Create a new record for DynamoDB with the hashed password
        Map<String, AttributeValue> newItem = new HashMap<>();
        String userId = UUID.randomUUID().toString();
        newItem.put("userId", AttributeValue.builder().s(userId).build());
        newItem.put("email", AttributeValue.builder().s(request.getEmail()).build());
        newItem.put("firstName", AttributeValue.builder().s(request.getFirstName()).build());
        newItem.put("lastName", AttributeValue.builder().s(request.getLastName()).build());
        newItem.put("password", AttributeValue.builder().s(hashedPassword).build());

        // Put the item in DynamoDB
        PutItemRequest putItemRequest = PutItemRequest.builder()
                .tableName("accounts")
                .item(newItem)
                .build();

        dynamoDbClient.putItem(putItemRequest);

        // Return success response
        return ResponseEntity.ok("User registered successfully");
    }
}
