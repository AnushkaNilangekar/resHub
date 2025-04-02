package com._7.reshub.reshub.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;
import com._7.reshub.reshub.Configs.DynamoDbConfig;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class AccountService {

    private static final Logger logger = Logger.getLogger(AccountService.class.getName());

    @Autowired
    private DynamoDbClient dynamoDbClient;

    @Autowired
    private DynamoDbConfig dynamoDbConfig;

    @Autowired
    private UserService userService;

    /**
     * Completely deletes a user account and all associated data
     * 
     * @param userId The ID of the user to delete
     * @return Map with success status and message
     */
    public Map<String, Object> deleteAccount(String userId) {
        Map<String, Object> result = new HashMap<>();

        try {
            // Step 1: Get all the user's chats
            List<String> userChats = userService.retrieveUserChats(userId);
            
            // Step 2: Get all the user's matches
            List<String> userMatches = userService.doGetUserMatches(userId);
            
            // Step 3: Delete all chat relationships
            for (String chatId : userChats) {
                // Get the other user in this chat
                String otherUserId = userService.getOtherUserId(chatId, userId);
                
                // If we got a valid other user ID, unmatch them
                if (otherUserId != null) {
                    userService.unmatch(userId, otherUserId, chatId);
                } else {
                    // If we couldn't find the other user, just delete the chat directly
                    deleteChat(chatId);
                    deleteMessagesByChatId(chatId);
                }
            }
            
            // Step 4: Delete the user's profile
            deleteUserProfile(userId);
            
            // Step 5: Delete the user's account
            deleteUserAccount(userId);
            
            result.put("success", true);
            result.put("message", "Account and all associated data deleted successfully");
            
        } catch (Exception e) {
            logger.severe("Error deleting account: " + e.getMessage());
            e.printStackTrace();
            
            result.put("success", false);
            result.put("error", "Failed to delete account: " + e.getMessage());
        }
        
        return result;
    }
    
    /**
     * Deletes a user profile from the profiles table
     */
    private void deleteUserProfile(String userId) {
        Map<String, AttributeValue> key = new HashMap<>();
        key.put("userId", AttributeValue.builder().s(userId).build());
        
        DeleteItemRequest deleteRequest = DeleteItemRequest.builder()
            .tableName(dynamoDbConfig.getUserProfilesTableName())
            .key(key)
            .build();
            
        dynamoDbClient.deleteItem(deleteRequest);
        logger.info("Deleted user profile for userId: " + userId);
    }
    
    /**
     * Deletes a user account from the accounts table
     */
    private void deleteUserAccount(String userId) {
        Map<String, AttributeValue> key = new HashMap<>();
        key.put("userId", AttributeValue.builder().s(userId).build());
        
        DeleteItemRequest deleteRequest = DeleteItemRequest.builder()
            .tableName("accounts") // Using the constant table name
            .key(key)
            .build();
            
        dynamoDbClient.deleteItem(deleteRequest);
        logger.info("Deleted user account for userId: " + userId);
    }
    
    /**
     * Deletes a chat by chatId
     */
    private void deleteChat(String chatId) {
        Map<String, AttributeValue> key = new HashMap<>();
        key.put("chatId", AttributeValue.builder().s(chatId).build());
        
        DeleteItemRequest deleteRequest = DeleteItemRequest.builder()
            .tableName(dynamoDbConfig.getChatsTableName())
            .key(key)
            .build();
            
        dynamoDbClient.deleteItem(deleteRequest);
        logger.info("Deleted chat with ID: " + chatId);
    }
    
    /**
     * Deletes all messages for a given chatId
     */
    private void deleteMessagesByChatId(String chatId) {
        // First query to get all messages for this chat
        QueryRequest queryRequest = QueryRequest.builder()
            .tableName(dynamoDbConfig.getMessagesTableName())
            .keyConditionExpression("chatId = :chatId")
            .expressionAttributeValues(Map.of(
                ":chatId", AttributeValue.builder().s(chatId).build()
            ))
            .build();
        
        QueryResponse queryResponse = dynamoDbClient.query(queryRequest);
        
        // Delete each message
        for (Map<String, AttributeValue> message : queryResponse.items()) {
            Map<String, AttributeValue> key = new HashMap<>();
            key.put("chatId", message.get("chatId"));
            key.put("createdAt", message.get("createdAt"));
            
            DeleteItemRequest deleteRequest = DeleteItemRequest.builder()
                .tableName(dynamoDbConfig.getMessagesTableName())
                .key(key)
                .build();
                
            dynamoDbClient.deleteItem(deleteRequest);
        }
        
        logger.info("Deleted all messages for chat: " + chatId);
    }
}