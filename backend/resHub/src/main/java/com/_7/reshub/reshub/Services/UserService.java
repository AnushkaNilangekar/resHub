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
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.QueryRequest;
import software.amazon.awssdk.services.dynamodb.model.QueryResponse;

import java.time.Instant;
import java.util.logging.Logger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.UUID;

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
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());

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
        createChat(userId, matchUserId);
        
    }

    /*
     * Handles adding the new match to the user1's document in the userProfiles table
     */
    public void doAddToMatches(String userId, String matchUserId) {
        List<String> matches = new ArrayList<>(doGetUserMatches(userId));
    
        if (!matches.contains(matchUserId)) {
            matches.add(matchUserId);
        }
    
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());
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

    /*
     * Handles retrieving the user ids of the given user's chatss.
     */
    public List<String> retrieveUserChats(String userId) {
        // Set up the key for querying the userProfiles table using email
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());
    
        // Create the GetItemRequest for the userProfiles table
        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())  // Use userProfiles table
                .key(key)
                .build();
    
        // Send the request to DynamoDB
        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);
    
        // Check if the item exists in the response
        if (response.hasItem()) {
            Map<String, AttributeValue> item = response.item();
            AttributeValue chatsAttribute = item.get("chats");  // Retrieve the chats attribute
    
            // If the chats attribute exists and is a list, extract the chat IDs
            if (chatsAttribute != null && chatsAttribute.l() != null) {
                List<String> chats = new ArrayList<>();
                for (AttributeValue chat : chatsAttribute.l()) {
                    chats.add(chat.s());  // Add each chat ID to the list
                }
                return chats;  // Return the list of chat IDs
            }
        }
    
        // Return an empty list if no chats are found
        return Collections.emptyList();
    }

    public String getOtherUserId(String chatId, String loggedInUserId) {
        // Create the key to retrieve the chat item
        Map<String, AttributeValue> key = Map.of("chatId", AttributeValue.builder().s(chatId).build());
    
        // Create the GetItemRequest for the chat table
        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getChatsTableName())  // Use chat table
                .key(key)
                .build();
    
        // Send the request to DynamoDB
        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);
    
        // Check if the item exists in the response
        if (response.hasItem()) {
            Map<String, AttributeValue> item = response.item();
            AttributeValue participantsAttribute = item.get("participants");
    
            if (participantsAttribute != null && participantsAttribute.l() != null) {
                List<AttributeValue> participants = participantsAttribute.l();
    
                // If there are two participants, filter out the logged-in user's email
                if (participants.size() == 2) {
                    String otherUserId = participants.stream()
                            .map(AttributeValue::s)
                            .filter(userId -> !userId.equals(loggedInUserId))  // Filter out logged-in user's email
                            .findFirst()
                            .orElse(null);  // Return null if not found
    
                    return otherUserId;  // Return the other user's email
                }
            }
        }
    
        return null;  // Return null if no other user is found
    }

    public List<String> getOtherUserIds(String loggedInUserId) {
        List<String> otherUserIds = new ArrayList<>();
        
        // Retrieve the chat IDs from the user's chats
        List<String> chatIds = retrieveUserChats(loggedInUserId); // Assuming you have a function that returns the user's chat IDs
    
        for (String chatId : chatIds) {
            // For each chat, retrieve the participants
            String otherUserId = getOtherUserId(chatId, loggedInUserId); // Get the other user's email from the chat
            
            if (otherUserId != null) {
                otherUserIds.add(otherUserId); // Add the other user's email to the list
            }
        }
        
        return otherUserIds; // Return the list of other user emails
    }

    // Method to retrieve the last message from the chat
    public String getLastMessage(String chatId) {
        // Create the key to retrieve the chat item
        Map<String, AttributeValue> key = Map.of("chatId", AttributeValue.builder().s(chatId).build());

        // Create the GetItemRequest for the chat table
        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getChatsTableName())  // Use chat table
                .key(key)
                .build();

        // Send the request to DynamoDB
        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);

        // Check if the item exists in the response
        if (response.hasItem()) {
            Map<String, AttributeValue> item = response.item();
            AttributeValue lastMessageAttribute = item.get("lastMessage");  // Retrieve the lastmessage field

            // Check if lastmessage attribute is present
            if (lastMessageAttribute != null && lastMessageAttribute.s() != null) {
                return lastMessageAttribute.s();  // Return the last message
            }
        }

        // Return a default message if no last message is found
        return "No messages yet";
    }

    // Method to get other user's email and last message
    public Map<String, String> getChatDetails(String userId, String chatId) throws Exception {
        // Logic to retrieve the other user's email
        String otherUserId = getOtherUserId(chatId, userId);
        
        // Logic to retrieve the last message in the chat
        String lastMessage = getLastMessage(chatId);
        
        // Returning both email and last message in a Map
        Map<String, String> chatDetails = new HashMap<>();
        chatDetails.put("otherUserId", otherUserId);
        chatDetails.put("lastMessage", lastMessage);
        
        return chatDetails;
    }

     /*
     * Helper method to update the user's profile with the new chat ID.
     * @params
     * email: The email of the user
     * chatId: The ID of the chat to add
     */
    private void updateUserChats(String userId, String chatId) {
        // Retrieve the user's profile from the 'userProfiles' table
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());
        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .build();
        
        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);
        
        if (response.hasItem()) {
            Map<String, AttributeValue> item = response.item();
            AttributeValue chatsAttribute = item.get("chats");

            List<AttributeValue> chats = (chatsAttribute != null) ? new ArrayList<>(chatsAttribute.l()) : new ArrayList<>();
            chats.add(AttributeValue.builder().s(chatId).build());

            // Update the user's profile with the new chat ID
            Map<String, AttributeValue> updatedItem = new HashMap<>(item);
            updatedItem.put("chats", AttributeValue.builder().l(chats).build());
            
            // Save the updated user profile back to the 'userProfiles' table
            PutItemRequest updateUserRequest = PutItemRequest.builder()
                    .tableName(dynamoDbConfig.getUserProfilesTableName())
                    .item(updatedItem)
                    .build();
            dynamoDbClient.putItem(updateUserRequest);
        }
    }

     /*
     * Create a new chat between two users.
     * @params
     * email1: The email of the first user
     * email2: The email of the second user
     * @return The ID of the created chat
     */
    public String createChat(String user1Id, String user2Id) {
        // Step 1: Generate a new chat ID (this can be a UUID or a timestamp-based ID)
        String chatId = UUID.randomUUID().toString();
        System.out.println("Generated Chat ID: " + chatId);  // Debugging line
    
        // Step 2: Create a new chat item in the 'chats' table with participants and initial data
        Map<String, AttributeValue> chatItem = new HashMap<>();
        chatItem.put("chatId", AttributeValue.builder().s(chatId).build());
        chatItem.put("participants", AttributeValue.builder().l(
                Arrays.asList(
                    AttributeValue.builder().s(user1Id).build(),
                    AttributeValue.builder().s(user2Id).build()
                )
            ).build());
        chatItem.put("updatedAt", AttributeValue.builder().s(String.valueOf(System.currentTimeMillis())).build());
    
        System.out.println("Chat Item: " + chatItem);  // Debugging line
    
        // Insert the new chat into the 'chats' table
        PutItemRequest putChatRequest = PutItemRequest.builder()
                .tableName(dynamoDbConfig.getChatsTableName())
                .item(chatItem)
                .build();
        try {
            dynamoDbClient.putItem(putChatRequest);
            System.out.println("Chat item inserted successfully.");
        } catch (Exception e) {
            System.err.println("Error inserting chat item: " + e.getMessage());  // Debugging error
            e.printStackTrace();
        }
    
        // Step 3: Update both users' profiles to add this chat ID to their 'chats' list
        try {
            updateUserChats(user1Id, chatId);
            updateUserChats(user2Id, chatId);
            System.out.println("User chats updated for: " + user1Id + " and " + user2Id);  // Debugging line
        } catch (Exception e) {
            System.err.println("Error updating user chats: " + e.getMessage());  // Debugging error
            e.printStackTrace();
        }
    
        return chatId;
    }

     /*
     * Create a new message in a chat.
     */
    public void createMessage(String chatId, String createdAt, String userId, String name, String text) {
         // Step 2: Create a new message item in the 'messages' table with participants and initial data
        Map<String, AttributeValue> messageItem = new HashMap<>();
        messageItem.put("chatId", AttributeValue.builder().s(chatId).build());
        messageItem.put("createdAt", AttributeValue.builder().s(createdAt).build());
        messageItem.put("userId", AttributeValue.builder().s(userId).build());
        messageItem.put("name", AttributeValue.builder().s(name).build());
        messageItem.put("text", AttributeValue.builder().s(text).build());

        // Insert the new chat into the 'chats' table
        PutItemRequest putMessageRequest = PutItemRequest.builder()
                .tableName(dynamoDbConfig.getMessagesTableName())
                .item(messageItem)
                .build();
        try {
            dynamoDbClient.putItem(putMessageRequest);
            System.out.println("Chat item inserted successfully.");
        } catch (Exception e) {
            System.err.println("Error inserting chat item: " + e.getMessage());  // Debugging error
            e.printStackTrace();
        }

    }



    /*
     * Retrieves a list of messages from the messages table for the given chatId,
     * sorted by the createdAt attribute in ascending order.
     */
    public List<Map<String, String>> getMessages(String chatId) {
        QueryRequest queryRequest = QueryRequest.builder()
                .tableName(dynamoDbConfig.getMessagesTableName())
                .keyConditionExpression("chatId = :chatId")
                .expressionAttributeValues(Map.of(":chatId", AttributeValue.builder().s(chatId).build()))
                .scanIndexForward(false)
                .build();

        QueryResponse queryResponse = dynamoDbClient.query(queryRequest);

        return queryResponse.items().stream()
                .map(this::convertToSimpleMap) // Convert DynamoDB response to a simple Map<String, String>
                .toList();
    }

    private Map<String, String> convertToSimpleMap(Map<String, AttributeValue> item) {
        return item.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> entry.getValue().s() // Extract string values directly
                ));
    }
    
    public void doUpdateLastTimeActive(String userId) {
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());
        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .build();
        
        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);

        if (response.hasItem()) {
            Map<String, AttributeValue> item = response.item();
            
            String timestamp = Instant.now().toString();
            
            Map<String, AttributeValue> updatedItem = new HashMap<>(item);
            updatedItem.put("lastTimeActive", AttributeValue.builder().s(timestamp).build());
            
            try
            {
                PutItemRequest updateUserRequest = PutItemRequest.builder()
                        .tableName(dynamoDbConfig.getUserProfilesTableName())
                        .item(updatedItem)
                        .build();
                
                dynamoDbClient.putItem(updateUserRequest);
            }
            catch (Exception e)
            {
                e.printStackTrace();
            }
        }
    }
}
