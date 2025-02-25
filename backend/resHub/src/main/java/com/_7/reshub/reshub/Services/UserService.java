package com._7.reshub.reshub.Services;

import com._7.reshub.reshub.Configs.DynamoDbConfig;
import com._7.reshub.reshub.Models.PasswordResetRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;
import software.amazon.awssdk.services.dynamodb.model.UpdateItemRequest;

import java.time.Instant;
import java.util.*;
import java.util.logging.Logger;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    private static final Logger logger = Logger.getLogger(UserService.class.getName());
    private static final long TOKEN_EXPIRATION_TIME = 15 * 60; // 15 minutes in seconds

    @Autowired
    private DynamoDbConfig dynamoDbConfig;

    @Autowired
    private DynamoDbClient dynamoDbClient;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private DynamoDbService dynamoDbService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    /*
     * Handles retrieving the user ids of the given user's matches.
     */
    public List<String> doGetUserMatches(String userId) {
        Map<String, AttributeValue> key = Map.of("email", AttributeValue.builder().s(userId).build());

        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .build();

        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);

        if (response.hasItem()) {
            Map<String, AttributeValue> item = response.item();
            AttributeValue matchesAttribute = item.get("matches");

            if (matchesAttribute != null && matchesAttribute.l() != null) {
                List<String> matches = new ArrayList<>();
                for (AttributeValue match : matchesAttribute.l()) {
                    matches.add(match.s());
                }
                return matches;
            }
        }
        return Collections.emptyList();
    }

    /**
     * Generates and sends a password reset token via email.
     */
    public String generatePasswordResetToken(String email) {
        try {
            if (email == null || email.isEmpty()) {
                return "Invalid email address.";
            }
            // Check if user exists
            Map<String, AttributeValue> user = dynamoDbService.getUserByEmail(email);
            if (user == null) {
                return "If this email is associated with an account, you will receive a reset token.";
            }

            String resetToken = UUID.randomUUID().toString();
            long expirationTime = Instant.now().getEpochSecond() + TOKEN_EXPIRATION_TIME;

            // Save token with expiration
            dynamoDbService.savePasswordResetToken(email, resetToken, expirationTime);

            // Send reset email
            sendPasswordResetEmail(email, resetToken);

            return "If this email is associated with an account, you will receive a reset link.";
        } catch (Exception e) {
            logger.severe("Error generating password reset token: " + e.getMessage());
            return "An error occurred. Please try again later.";
        }
    }

    private void sendPasswordResetEmail(String email, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("ResHub: Password Reset Request");
            message.setText("Token to reset your password: " + resetToken);

            mailSender.send(message);
            logger.info("Password reset email sent to: " + email);
        } catch (Exception e) {
            logger.severe("Failed to send password reset email to " + email + ": " + e.getMessage());
        }        
    }

    /**
     * Resets the user's password using the provided token.
     */
    public boolean resetPassword(PasswordResetRequest request) {
        try {
            if (request == null || request.getToken() == null || request.getNewPassword() == null) {
                return false;
            }

            String token = request.getToken();
            String newPassword = request.getNewPassword();

            // Retrieve token details
            Map<String, AttributeValue> user = dynamoDbService.getUserByResetToken(token);
            if (user == null) {
                return false;
            }

            // Check if token has expired
            long storedExpiration = Long.parseLong(user.get("resetTokenExpiration").n());
            if (Instant.now().getEpochSecond() > storedExpiration) {
                logger.warning("Password reset token has expired.");
                return false;
            }

            // Update user password
            String email = user.get("email").s();
            String encodedPassword = passwordEncoder.encode(newPassword);
            dynamoDbService.updateUserPassword(email, encodedPassword);

            // Clear reset token after use
            dynamoDbService.clearPasswordResetToken(email);

            return true;
        } catch (Exception e) {
            logger.severe("Error resetting password: " + e.getMessage());
            return false;
        }
    }

    /*
     * Handles adding each user to the other's matches table
     */
    public void doCreateMatch(String userId, String matchUserId) {
        doAddToMatches(userId, matchUserId);
        doAddToMatches(matchUserId, userId);
    }

    /*
     * Handles adding the new match to the user1's document in the userProfiles table
     */
    public void doAddToMatches(String userId, String matchUserId) {
        List<String> matches = new ArrayList<>(doGetUserMatches(userId));
    
        if (!matches.contains(matchUserId)) {
            matches.add(matchUserId);
        }
    
        Map<String, AttributeValue> key = Map.of("email", AttributeValue.builder().s(userId).build());
        Map<String, AttributeValue> updateValues = Map.of(
                ":newMatches", AttributeValue.builder().l(matches.stream()
                        .map(match -> AttributeValue.builder().s(match).build())
                        .collect(Collectors.toList())).build()
        );
    
        UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .updateExpression("SET matches = :newMatches")
                .expressionAttributeValues(updateValues)
                .build();
    
        dynamoDbClient.updateItem(updateRequest);
    }    
}
