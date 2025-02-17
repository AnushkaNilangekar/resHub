package com._7.reshub.reshub.Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;
import java.util.HashMap;
import java.util.Map;
import com._7.reshub.reshub.Utils.JwtUtil;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private DynamoDbClient dynamoDbClient;

    @Autowired
    private JwtUtil jwtUtil;  // Utility class for JWT generation

    private static final String TABLE_NAME = "userAccounts"; // Ensure this matches signup

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        try {
            // Retrieve the user by email
            Map<String, AttributeValue> key = new HashMap<>();
            key.put("email", AttributeValue.builder().s(email).build());

            GetItemRequest getItemRequest = GetItemRequest.builder()
                    .tableName(TABLE_NAME)
                    .key(key)
                    .build();

            GetItemResponse getItemResponse = dynamoDbClient.getItem(getItemRequest);

            if (!getItemResponse.hasItem()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found."));
            }

            // Extract stored password hash
            String storedPasswordHash = getItemResponse.item().get("password").s();

            // Verify password
            if (passwordEncoder.matches(password, storedPasswordHash)) {
                String token = jwtUtil.generateToken(email);  // Generate JWT
                return ResponseEntity.ok(Map.of("message", "Login successful!", "token", token));
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email or password."));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }
}
