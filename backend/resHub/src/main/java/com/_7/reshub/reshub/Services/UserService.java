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
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest;
//import software.amazon.awssdk.services.dynamodb.model.PutItemResponse;
//import software.amazon.awssdk.services.dynamodb.model.UpdateItemResponse;
//import software.amazon.awssdk.services.dynamodb.model.DeleteItemResponse;
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

        // Send Match Notification
        sendMatchNotification(userId, matchUserId);
        sendMatchNotification(matchUserId, userId);
    }

    private void sendMatchNotification(String userId, String matchedUserId) {
        
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());
            GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .build();

            GetItemResponse response = dynamoDbClient.getItem(getItemRequest);
            Map<String, AttributeValue> item = response.item();
            String fullName = item.get("fullName").s();
            // Construct notification payload
            Map<String, AttributeValue> messageItem = new HashMap<>();
            messageItem.put("userId", AttributeValue.builder().s(matchedUserId).build());
            messageItem.put("type", AttributeValue.builder().s("match").build());
            messageItem.put("message", AttributeValue.builder().s("New match with " + fullName).build());
            messageItem.put("createdAt", AttributeValue.builder().s(Instant.now().toString()).build());
            messageItem.put("isUnread", AttributeValue.builder().bool(true).build());

         // Insert the new notification into the 'notifications' table
         PutItemRequest putMessageRequest = PutItemRequest.builder()
         .tableName(dynamoDbConfig.getNotificationsTableName())
         .item(messageItem)
         .build();
         dynamoDbClient.putItem(putMessageRequest);
    }

    /*
     * Handles adding the new match to the user1's document in the userProfiles
     * table
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
                        .collect(Collectors.toList())).build());

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
                .tableName(dynamoDbConfig.getUserProfilesTableName()) // Use userProfiles table
                .key(key)
                .build();

        // Send the request to DynamoDB
        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);

        // Check if the item exists in the response
        if (response.hasItem()) {
            Map<String, AttributeValue> item = response.item();
            AttributeValue chatsAttribute = item.get("chats"); // Retrieve the chats attribute

            // If the chats attribute exists and is a list, extract the chat IDs
            if (chatsAttribute != null && chatsAttribute.l() != null) {
                List<String> chats = new ArrayList<>();
                for (AttributeValue chat : chatsAttribute.l()) {
                    chats.add(chat.s()); // Add each chat ID to the list
                }
                return getSortedChatIds(chats); // Return the list of chat IDs
            }
        }


        // Return an empty list if no chats are found
        return Collections.emptyList();
    }

    public List<String> getSortedChatIds(List<String> chatIds) {
        // Map to store chatId -> updatedAt
        Map<String, String> chatIdToUpdatedAt = new HashMap<>();
    
        for (String chatId : chatIds) {
            // Create the key for retrieving the chat item
            Map<String, AttributeValue> key = Map.of("chatId", AttributeValue.builder().s(chatId).build());
    
            // GetItem request to fetch updatedAt for each chatId
            GetItemRequest getItemRequest = GetItemRequest.builder()
                    .tableName(dynamoDbConfig.getChatsTableName())
                    .key(key)
                    .attributesToGet("updatedAt") // Fetch only updatedAt field
                    .build();
    
            GetItemResponse response = dynamoDbClient.getItem(getItemRequest);
    
            if (response.hasItem() && response.item().containsKey("updatedAt")) {
                String updatedAt = response.item().get("updatedAt").s(); // Assuming it's stored as a String (ISO format)
                chatIdToUpdatedAt.put(chatId, updatedAt);
            }
        }
    
        // Sort chatIds based on updatedAt in descending order
        List<String> sortedChatIds = chatIdToUpdatedAt.entrySet()
                .stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue())) // Sort by updatedAt descending
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    
        return sortedChatIds;
    }
    

    public String getOtherUserId(String chatId, String loggedInUserId) {
        // Create the key to retrieve the chat item
        Map<String, AttributeValue> key = Map.of("chatId", AttributeValue.builder().s(chatId).build());

        // Create the GetItemRequest for the chat table
        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getChatsTableName()) // Use chat table
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
                            .filter(userId -> !userId.equals(loggedInUserId)) // Filter out logged-in user's email
                            .findFirst()
                            .orElse(null); // Return null if not found

                    return otherUserId; // Return the other user's email
                }
            }
        }

        return null; // Return null if no other user is found
    }

    public List<String> getOtherUserIds(String loggedInUserId) {
        List<String> otherUserIds = new ArrayList<>();

        // Retrieve the chat IDs from the user's chats
        List<String> chatIds = retrieveUserChats(loggedInUserId); // Assuming you have a function that returns the
                                                                  // user's chat IDs

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
                .tableName(dynamoDbConfig.getChatsTableName()) // Use chat table
                .key(key)
                .build();

        // Send the request to DynamoDB
        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);

        // Check if the item exists in the response
        if (response.hasItem()) {
            Map<String, AttributeValue> item = response.item();
            AttributeValue lastMessageAttribute = item.get("lastMessage"); // Retrieve the lastmessage field

            // Check if lastmessage attribute is present
            if (lastMessageAttribute != null && lastMessageAttribute.s() != null) {
                return lastMessageAttribute.s(); // Return the last message
            }
        }

        // Return a default message if no last message is found
        return "No messages yet";
    }

    // Method to find unread messages
    public int getUnreadCount(String chatId, String userId) {
        QueryRequest queryRequest = QueryRequest.builder()
                .tableName(dynamoDbConfig.getMessagesTableName())
                .keyConditionExpression("chatId = :chatId")
                .expressionAttributeValues(Map.of(":chatId", AttributeValue.builder().s(chatId).build()))
                .build();

        QueryResponse queryResponse = dynamoDbClient.query(queryRequest);
        int count = 0;
        for (Map<String, AttributeValue> item : queryResponse.items()) {
            // Count messages that are unread and not sent by the current user
            if (!item.get("userId").s().equals(userId)
                    && item.containsKey("isUnread")
                    && item.get("isUnread").bool()) {
                count++;
            }
        }
        return count;
    }

    // method to mark a message as read
    public void markMessagesAsRead(String chatId, String userId) {
        // Query the messages table for messages in the chat that are unread and not
        // sent by userId
        QueryRequest queryRequest = QueryRequest.builder()
                .tableName(dynamoDbConfig.getMessagesTableName())
                .keyConditionExpression("chatId = :chatId")
                .expressionAttributeValues(Map.of(":chatId", AttributeValue.builder().s(chatId).build()))
                .build();

        QueryResponse queryResponse = dynamoDbClient.query(queryRequest);

        for (Map<String, AttributeValue> messageItem : queryResponse.items()) {
            // If the message is unread and not sent by the current user, mark it as read
            if (!messageItem.get("userId").s().equals(userId) &&
                    messageItem.containsKey("isUnread") && messageItem.get("isUnread").bool()) {
                // Update the message item to set isUnread to false
                Map<String, AttributeValue> key = Map.of("chatId", messageItem.get("chatId"), "createdAt",
                        messageItem.get("createdAt"));
                Map<String, AttributeValue> updateValues = Map.of(":isUnread",
                        AttributeValue.builder().bool(false).build());
                UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                        .tableName(dynamoDbConfig.getMessagesTableName())
                        .key(key)
                        .updateExpression("SET isUnread = :isUnread")
                        .expressionAttributeValues(updateValues)
                        .build();
                dynamoDbClient.updateItem(updateRequest);
            }
        }
    }

    // Method to get other user's email and last message
    public Map<String, String> getChatDetails(String userId, String chatId) throws Exception {
        // Logic to retrieve the other user's email
        String otherUserId = getOtherUserId(chatId, userId);

        // Retrieve last message details from the chat item
        Map<String, AttributeValue> key = Map.of("chatId", AttributeValue.builder().s(chatId).build());
        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getChatsTableName())
                .key(key)
                .build();
        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);
        String lastMessage = "";
        String lastMessageSender = "";
        if (response.hasItem()) {
            Map<String, AttributeValue> item = response.item();
            lastMessage = item.get("lastMessage") != null ? item.get("lastMessage").s() : "";
            lastMessageSender = item.get("lastMessageSender") != null ? item.get("lastMessageSender").s() : "";
        }

        // Declare and initialize unreadCount by calling the getUnreadCount method
        int unreadCount = getUnreadCount(chatId, userId);

        // Returning all details in a Map
        Map<String, String> chatDetails = new HashMap<>();
        chatDetails.put("otherUserId", otherUserId);
        chatDetails.put("lastMessage", lastMessage);
        chatDetails.put("unreadCount", String.valueOf(unreadCount)); // New field for unread count
        chatDetails.put("lastMessageSender", lastMessageSender); // New field
        return chatDetails;
    }

    /*
     * Helper method to update the user's profile with the new chat ID.
     * 
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

            List<AttributeValue> chats = (chatsAttribute != null) ? new ArrayList<>(chatsAttribute.l())
                    : new ArrayList<>();
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
     * 
     * @params
     * email1: The email of the first user
     * email2: The email of the second user
     * 
     * @return The ID of the created chat
     */
    public String createChat(String user1Id, String user2Id) {
        // Step 1: Generate a new chat ID (this can be a UUID or a timestamp-based ID)
        String chatId = UUID.randomUUID().toString();
        System.out.println("Generated Chat ID: " + chatId); // Debugging line

        // Step 2: Create a new chat item in the 'chats' table with participants and
        // initial data
        Map<String, AttributeValue> chatItem = new HashMap<>();
        chatItem.put("chatId", AttributeValue.builder().s(chatId).build());
        chatItem.put("participants", AttributeValue.builder().l(
                Arrays.asList(
                        AttributeValue.builder().s(user1Id).build(),
                        AttributeValue.builder().s(user2Id).build()))
                .build());
        chatItem.put("updatedAt", AttributeValue.builder().s(String.valueOf(System.currentTimeMillis())).build());

        System.out.println("Chat Item: " + chatItem); // Debugging line

        // Insert the new chat into the 'chats' table
        PutItemRequest putChatRequest = PutItemRequest.builder()
                .tableName(dynamoDbConfig.getChatsTableName())
                .item(chatItem)
                .build();
        try {
            dynamoDbClient.putItem(putChatRequest);
            System.out.println("Chat item inserted successfully.");
        } catch (Exception e) {
            System.err.println("Error inserting chat item: " + e.getMessage()); // Debugging error
            e.printStackTrace();
        }

        // Step 3: Update both users' profiles to add this chat ID to their 'chats' list
        try {
            updateUserChats(user1Id, chatId);
            updateUserChats(user2Id, chatId);
            System.out.println("User chats updated for: " + user1Id + " and " + user2Id); // Debugging line
        } catch (Exception e) {
            System.err.println("Error updating user chats: " + e.getMessage()); // Debugging error
            e.printStackTrace();
        }

        return chatId;
    }

    /*
     * Create a new message in a chat.
     */
    public void createMessage(String chatId, String createdAt, String userId, String name, String text) {
        // Build the message item
        Map<String, AttributeValue> messageItem = new HashMap<>();
        messageItem.put("chatId", AttributeValue.builder().s(chatId).build());
        messageItem.put("createdAt", AttributeValue.builder().s(createdAt).build());
        messageItem.put("userId", AttributeValue.builder().s(userId).build());
        messageItem.put("name", AttributeValue.builder().s(name).build());
        messageItem.put("text", AttributeValue.builder().s(text).build());
        messageItem.put("isUnread", AttributeValue.builder().bool(true).build());

        // Insert the new message into the 'messages' table
        PutItemRequest putMessageRequest = PutItemRequest.builder()
                .tableName(dynamoDbConfig.getMessagesTableName())
                .item(messageItem)
                .build();
        try {
            dynamoDbClient.putItem(putMessageRequest);
            System.out.println("Message item inserted successfully.");
        } catch (Exception e) {
            System.err.println("Error inserting message item: " + e.getMessage());
            e.printStackTrace();
        }

        // Update the corresponding chat item with the new last message and timestamp
        Map<String, AttributeValue> chatKey = Map.of("chatId", AttributeValue.builder().s(chatId).build());
        Map<String, AttributeValue> updateValues = Map.of(
                ":lastMessage", AttributeValue.builder().s(text).build(),
                ":updatedAt", AttributeValue.builder().s(createdAt).build(),
                ":lastMessageSender", AttributeValue.builder().s(userId).build());
        UpdateItemRequest updateChatRequest = UpdateItemRequest.builder()
                .tableName(dynamoDbConfig.getChatsTableName())
                .key(chatKey)
                .updateExpression(
                        "SET lastMessage = :lastMessage, updatedAt = :updatedAt, lastMessageSender = :lastMessageSender")
                .expressionAttributeValues(updateValues)
                .build();
        try {
            dynamoDbClient.updateItem(updateChatRequest);
            System.out.println("Chat last message updated successfully.");
        } catch (Exception e) {
            System.err.println("Error updating chat last message: " + e.getMessage());
            e.printStackTrace();
        }

        // Send Message Notification
        sendMessageNotification(chatId, createdAt, userId, name, text);

        /*
        // Get the other user's ID to notify them
        Map<String, AttributeValue> key = Map.of("chatId", AttributeValue.builder().s(chatId).build());
        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getChatsTableName())
                .key(key)
                .build();
        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);
        
        if (response.hasItem()) {
            Map<String, AttributeValue> item = response.item();
            AttributeValue participantsAttribute = item.get("participants");
            
            if (participantsAttribute != null && participantsAttribute.l() != null) {
                // Find the recipient ID
                String recipientId = participantsAttribute.l().stream()
                        .map(AttributeValue::s)
                        .filter(id -> !id.equals(userId))
                        .findFirst()
                        .orElse(null);
                        
                if (recipientId != null) {
                    // Send notification for new message
                    String previewText = text.substring(0, Math.min(text.length(), 30));
                    notificationService.notifyNewMessage(recipientId, userId, name, previewText);
                }
            }
        }*/
    }

    private void sendMessageNotification(String chatId, String createdAt, String userId, String name, String text) {
        // Get the other user ID in the chat
        String otherUserId = getOtherUserId(chatId, userId);
        if (otherUserId != null) {
            Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());
            GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .build();

            GetItemResponse response = dynamoDbClient.getItem(getItemRequest);
            Map<String, AttributeValue> item = response.item();
            String fullName = item.get("fullName").s();

            Map<String, AttributeValue> messageItem = new HashMap<>();
            messageItem.put("userId", AttributeValue.builder().s(otherUserId).build());
            messageItem.put("type", AttributeValue.builder().s("message").build());
            messageItem.put("message", AttributeValue.builder().s("New message from " + fullName).build());
            messageItem.put("createdAt", AttributeValue.builder().s(createdAt).build());
            messageItem.put("isUnread", AttributeValue.builder().bool(true).build());

            // Insert the new notification into the 'notifications' table
            PutItemRequest putMessageRequest = PutItemRequest.builder()
                .tableName(dynamoDbConfig.getNotificationsTableName())
                .item(messageItem)
                .build();
                dynamoDbClient.putItem(putMessageRequest);
        }
    }

    public Map<String, AttributeValue> getMostRecentUnreadNotification(String userId) {
        QueryRequest queryRequest = QueryRequest.builder()
            .tableName(dynamoDbConfig.getNotificationsTableName())
            .keyConditionExpression("userId = :userId")
            .filterExpression("isUnread = :isUnread")
            .expressionAttributeValues(Map.of(
                ":userId", AttributeValue.builder().s(userId).build(),
                ":isUnread", AttributeValue.builder().bool(true).build()
            ))
            .scanIndexForward(false) // Descending order: most recent first
            .limit(1) // Only get the most recent one
            .build();
    
        //logger.info("DynamoDB Query Request:");
        //logger.info("  Table Name: " + queryRequest.tableName());
        //logger.info("  Key Condition: "+ queryRequest.keyConditionExpression());
        //logger.info("  Expression Values: "+ queryRequest.expressionAttributeValues());
    
        QueryResponse queryResponse = dynamoDbClient.query(queryRequest);
        List<Map<String, AttributeValue>> items = queryResponse.items();
    
        if (!items.isEmpty()) {
            Map<String, AttributeValue> mostRecent = items.get(0);
            //if (mostRecent.containsKey("isUnread") && mostRecent.get("isUnread").bool()) {
                // Update isUnread to false
                Map<String, AttributeValue> key = Map.of(
                    "userId", mostRecent.get("userId"),
                    "createdAt", mostRecent.get("createdAt") // Assuming createdAt is your sort key
                );
    
                UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                    .tableName(dynamoDbConfig.getNotificationsTableName())
                    .key(key)
                    .updateExpression("SET isUnread = :false")
                    .expressionAttributeValues(Map.of(":false", AttributeValue.builder().bool(false).build()))
                    .build();
    
                dynamoDbClient.updateItem(updateRequest);
    
                return mostRecent;
            //}
        }
    
        return null; // No unread notifications
    }
    
    /* 
     * Helper method to get user name
     */ 
    /*private String getUserName(String userId) {
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());
        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .build();
        
        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);
        if (response.hasItem() && response.item().containsKey("name")) {
            return response.item().get("name").s();
        }
        
        return ""; // Default if name not found
    }*/

    /*
     * Retrieves a list of messages from the messages table for the given chatId,
     * sorted by the createdAt attribute in ascending order.
     */
    public List<Map<String, String>> getMessages(String chatId) {
        if (chatId == null || chatId.trim().isEmpty()) {
            logger.severe("getMessages called with null or empty chatId");
            return Collections.emptyList();
        }

        logger.info("Fetching messages for chatId: " + chatId);

        QueryRequest queryRequest = QueryRequest.builder()
                .tableName(dynamoDbConfig.getMessagesTableName())
                .keyConditionExpression("chatId = :chatId")
                .expressionAttributeValues(Map.of(":chatId", AttributeValue.builder().s(chatId).build()))
                .scanIndexForward(false)
                .build();

        QueryResponse queryResponse = dynamoDbClient.query(queryRequest);

        logger.info("getMessages: " + queryResponse.items().size()
                + " items returned for chatId " + chatId);
        return queryResponse.items().stream()
                .map(this::convertToSimpleMap) // Convert DynamoDB response to a simple Map<String, String>
                .toList();
    }

    private Map<String, String> convertToSimpleMap(Map<String, AttributeValue> item) {
        Map<String, String> result = new HashMap<>();
        for (Map.Entry<String, AttributeValue> entry : item.entrySet()) {
            // If .s() is null, use an empty string
            String value = (entry.getValue() != null && entry.getValue().s() != null)
                    ? entry.getValue().s()
                    : "";
            result.put(entry.getKey(), value);
        }
        return result;
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

            try {
                PutItemRequest updateUserRequest = PutItemRequest.builder()
                        .tableName(dynamoDbConfig.getUserProfilesTableName())
                        .item(updatedItem)
                        .build();

                dynamoDbClient.putItem(updateUserRequest);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void unmatch(String userId1, String userId2, String chatId) {
        removeFromMatches(userId1, userId2);
        removeFromMatches(userId2, userId1);

        removeChatFromUser(userId1, chatId);
        removeChatFromUser(userId2, chatId);

        deleteChat(chatId);

        deleteMessagesByChatId(chatId);

    }

    private void removeFromMatches(String userId, String matchUserId) {
        List<String> matches = new ArrayList<>(doGetUserMatches(userId));
    
        if (matches.contains(matchUserId)) {
            matches.remove(matchUserId);
        }
    
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());
        Map<String, AttributeValue> updateValues = Map.of(
                ":newMatches", AttributeValue.builder().l(matches.stream()
                        .map(match -> AttributeValue.builder().s(match).build())
                        .collect(Collectors.toList())).build());
    
        UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .updateExpression("SET matches = :newMatches")
                .expressionAttributeValues(updateValues)
                .build();
    
        dynamoDbClient.updateItem(updateRequest);
    }

    private void removeChatFromUser(String userId, String chatId) {
        // Get the current chats for the user
        List<String> chats = retrieveUserChats(userId);
    
        // Remove the chatId if it exists
        if (chats.contains(chatId)) {
            chats.remove(chatId);
        }
    
        // Update the user's chats list in the table
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());
        Map<String, AttributeValue> updateValues = Map.of(
                ":newChats", AttributeValue.builder().l(chats.stream()
                        .map(chat -> AttributeValue.builder().s(chat).build())
                        .collect(Collectors.toList())).build());
    
        UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .updateExpression("SET chats = :newChats")
                .expressionAttributeValues(updateValues)
                .build();
    
        try {
            dynamoDbClient.updateItem(updateRequest);
            System.out.println("Chat ID removed from user profile: " + userId);
        } catch (Exception e) {
            System.err.println("Error removing chat from user profile: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void deleteChat(String chatId) {
        Map<String, AttributeValue> key = Map.of("chatId", AttributeValue.builder().s(chatId).build());
    
        DeleteItemRequest deleteRequest = DeleteItemRequest.builder()
                .tableName(dynamoDbConfig.getChatsTableName())
                .key(key)
                .build();
    
        try {
            dynamoDbClient.deleteItem(deleteRequest);
            System.out.println("Chat item deleted from chats table: " + chatId);
        } catch (Exception e) {
            System.err.println("Error deleting chat item: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void deleteMessagesByChatId(String chatId) {
        QueryRequest queryRequest = QueryRequest.builder()
            .tableName(dynamoDbConfig.getMessagesTableName())
            .keyConditionExpression("chatId = :chatId")
            .expressionAttributeValues(Map.of(
                ":chatId", AttributeValue.builder().s(chatId).build()
            ))
            .build();
    
        QueryResponse queryResponse = dynamoDbClient.query(queryRequest);
    
        // Iterate through the results and delete each message
        for (Map<String, AttributeValue> message : queryResponse.items()) {
            Map<String, AttributeValue> key = new HashMap<>();
            key.put("chatId", message.get("chatId"));  // Partition key
            key.put("createdAt", message.get("createdAt"));  // Sort key (required)
    
            DeleteItemRequest deleteMessageRequest = DeleteItemRequest.builder()
                .tableName(dynamoDbConfig.getMessagesTableName())
                .key(key)
                .build();
    
            try {
                dynamoDbClient.deleteItem(deleteMessageRequest);
                System.out.println("Deleted message with chatId: " + chatId + " and createdAt: " + message.get("createdAt").s());
            } catch (Exception e) {
                System.err.println("Failed to delete message: " + e.getMessage());
            }
        }
    }
    
}
