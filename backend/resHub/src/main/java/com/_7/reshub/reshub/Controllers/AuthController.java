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

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private DynamoDbClient dynamoDbClient;

    @Autowired
    private JwtUtil jwtUtil;  // Utility class for JWT generation

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

            // Query the user by email using GSI
            QueryRequest queryRequest = QueryRequest.builder()
                .tableName(TABLE_NAME)
                .indexName("email-index")  // Ensure you have a GSI on 'email'
                .keyConditionExpression("email = :email")
                .expressionAttributeValues(Map.of(":email", AttributeValue.builder().s(email).build()))
                .build();

            QueryResponse queryResponse = dynamoDbClient.query(queryRequest);

            if (queryResponse.count() == 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found."));
            }

            // Extract user data
            Map<String, AttributeValue> item = queryResponse.items().get(0);
            System.out.println(item);
            String storedPasswordHash = item.get("password").s();
            String userId = item.get("userId").s(); // Retrieve userid

            // Verify password
            if (passwordEncoder.matches(password, storedPasswordHash)) {
                String token = jwtUtil.generateToken(userId);  // Use userid in JWT
                return ResponseEntity.ok(Map.of("message", "Login successful!", "token", token,"userId", userId));
            } else {
                System.out.println("yes");
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password."));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    // Generate and send password reset token
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> requestBody) {
        String email = requestBody.get("email");
        String response = userService.generatePasswordResetToken(email);
        return ResponseEntity.ok(response);
    }

    // Reset password with token
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody PasswordResetRequest passwordResetRequest) {
        boolean success = userService.resetPassword(passwordResetRequest);
        if (success) {
            return ResponseEntity.ok("Password updated successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid token or expired.");
        }
    }

}
