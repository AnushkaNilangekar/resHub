package com._7.reshub.reshub.Controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;
import java.util.HashMap;
import java.util.Map;
import com._7.reshub.reshub.Utils.JwtUtil;
import com._7.reshub.reshub.Models.PasswordResetRequest;
import com._7.reshub.reshub.Services.UserService;
import com._7.reshub.reshub.Services.SwipeService;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private DynamoDbClient dynamoDbClient;

    @Autowired
    private SwipeService swipeService;

    @Autowired
    private JwtUtil jwtUtil;  

    @Autowired
    private UserService userService;

    private static final String TABLE_NAME = "accounts"; 

    private final PasswordEncoder passwordEncoder;

    public AuthController(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            String email = loginRequest.get("email");
            String password = loginRequest.get("password");

            // query user by email using GSI
            QueryRequest queryRequest = QueryRequest.builder()
                .tableName(TABLE_NAME)
                .indexName("email-index")  
                .keyConditionExpression("email = :email")
                .expressionAttributeValues(Map.of(":email", AttributeValue.builder().s(email).build()))
                .build();

            QueryResponse queryResponse = dynamoDbClient.query(queryRequest);

            if (queryResponse.count() == 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found."));
            }

            // extracting the user data
            Map<String, AttributeValue> item = queryResponse.items().get(0);
            String storedPasswordHash = item.get("password").s();
            String userId = item.get("userId").s(); // Retrieve userid

            // confirming the password
            if (passwordEncoder.matches(password, storedPasswordHash)) {
                String token = jwtUtil.generateToken(userId);  // Use userid in JWT
                return ResponseEntity.ok(Map.of("message", "Login successful!", "token", token,"userId", userId));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password."));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    // generate and send password reset token
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> requestBody) {
        String email = requestBody.get("email");
        String response = userService.generatePasswordResetToken(email);
        return ResponseEntity.ok(response);
    }

    // reset password with token
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody PasswordResetRequest passwordResetRequest) {
        boolean success = userService.resetPassword(passwordResetRequest);
        if (success) {
            return ResponseEntity.ok("Password updated successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid token or expired.");
        }
    }

    //updating user email or password when they edit
    @PutMapping("/updateAccountCredentials")
    public ResponseEntity<?> updateAccountCredentials(@RequestParam String userId, @RequestBody Map<String, String> payload) {
        try {
            String newEmail = payload.get("email");
            String newPassword = payload.get("password");

            if ((newEmail == null || newEmail.isBlank()) && (newPassword == null || newPassword.isBlank())) {
                return ResponseEntity.badRequest().body("At least one of email or password must be provided");
            }

            if (newEmail != null && !newEmail.endsWith("@purdue.edu")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email must end with @purdue.edu"));
            }

            Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());
            Map<String, String> updates = new HashMap<>();
            Map<String, AttributeValue> attributeValues = new HashMap<>();

            if (newEmail != null && !newEmail.isBlank()) {
                updates.put("email", ":email");
                attributeValues.put(":email", AttributeValue.builder().s(newEmail).build());
            }

            if (newPassword != null && !newPassword.isBlank()) {
                updates.put("password", ":password");
                String encodedPassword = passwordEncoder.encode(newPassword);
                attributeValues.put(":password", AttributeValue.builder().s(encodedPassword).build());
            }

            String updateExpression = "SET " + String.join(", ", updates.entrySet().stream()
                .map(entry -> entry.getKey() + " = " + entry.getValue())
                .toList());

            UpdateItemRequest updateItemRequest = UpdateItemRequest.builder()
                .tableName(TABLE_NAME)
                .key(key)
                .updateExpression(updateExpression)
                .expressionAttributeValues(attributeValues)
                .build();

            dynamoDbClient.updateItem(updateItemRequest);
            return ResponseEntity.ok("Account credentials updated successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE endpoint to remove a user's authentication account from the database.
     * This should only be called after the profile has been successfully deleted.
     * 
     * @param userId The ID of the user whose account should be deleted
     * @return HTTP 200 if deletion is successful, HTTP 404 if account not found, or HTTP 500 if an error occurs
    */
    @DeleteMapping("/deleteAccount")
    public ResponseEntity<?> deleteAccount(@RequestParam String userId) {
        try {
            Map<String, AttributeValue> key = new HashMap<>();
            key.put("userId", AttributeValue.builder().s(userId).build());

            // check if the account exists
            GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(TABLE_NAME) 
                .key(key)
                .build();
            GetItemResponse getItemResponse = dynamoDbClient.getItem(getItemRequest);

            if (!getItemResponse.hasItem()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Account not found for userId: " + userId));
            }
            try {
                // delete swipe logs related to the user
                swipeService.deleteUserSwipes(userId);
                
                // delete chat history
                userService.deleteUserChats(userId);
                
                // delete matches
                userService.deleteUserMatches(userId);
            } catch (Exception e) {
                System.err.println("Error cleaning up user data: " + e.getMessage());
            }

            // delete the account
            DeleteItemRequest deleteItemRequest = DeleteItemRequest.builder()
                .tableName(TABLE_NAME)
                .key(key)
                .build();
            
            dynamoDbClient.deleteItem(deleteItemRequest);

            return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
