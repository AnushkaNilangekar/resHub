package com._7.reshub.reshub.Services;

import com._7.reshub.reshub.Configs.DynamoDbConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;


import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private DynamoDbConfig dynamoDbConfig;

    @Autowired
    private DynamoDbClient dynamoDbClient;

    /*
     * Handles retrieving the user ids of the given user's matches.
     */
    public List<String> retrieveUserMatches(String userId) {
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());

        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getUsersTableName())
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

    /*
     * Handles retrieving the user ids of the given user's chatss.
     */
    public List<String> retrieveUserChats(String email) {
        // Set up the key for querying the userProfiles table using email
        Map<String, AttributeValue> key = Map.of("email", AttributeValue.builder().s(email).build());
    
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

    public String getOtherUserEmail(String chatId, String loggedInUserEmail) {
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
                    String otherUserEmail = participants.stream()
                            .map(AttributeValue::s)
                            .filter(email -> !email.equals(loggedInUserEmail))  // Filter out logged-in user's email
                            .findFirst()
                            .orElse(null);  // Return null if not found
    
                    return otherUserEmail;  // Return the other user's email
                }
            }
        }
    
        return null;  // Return null if no other user is found
    }

    public List<String> getOtherUserEmails(String loggedInUserEmail) {
        List<String> otherUserEmails = new ArrayList<>();
        
        // Retrieve the chat IDs from the user's chats
        List<String> chatIds = retrieveUserChats(loggedInUserEmail); // Assuming you have a function that returns the user's chat IDs
    
        for (String chatId : chatIds) {
            // For each chat, retrieve the participants
            String otherUserEmail = getOtherUserEmail(chatId, loggedInUserEmail); // Get the other user's email from the chat
            
            if (otherUserEmail != null) {
                otherUserEmails.add(otherUserEmail); // Add the other user's email to the list
            }
        }
        
        return otherUserEmails; // Return the list of other user emails
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
        String otherUserEmail = getOtherUserEmail(userId, chatId);
        
        // Logic to retrieve the last message in the chat
        String lastMessage = getLastMessage(chatId);
        
        // Returning both email and last message in a Map
        Map<String, String> chatDetails = new HashMap<>();
        chatDetails.put("otherUserEmail", otherUserEmail);
        chatDetails.put("lastMessage", lastMessage);
        
        return chatDetails;
    }

     /*
     * Helper method to update the user's profile with the new chat ID.
     * @params
     * email: The email of the user
     * chatId: The ID of the chat to add
     */
    private void updateUserChats(String email, String chatId) {
        // Retrieve the user's profile from the 'userProfiles' table
        Map<String, AttributeValue> key = Map.of("email", AttributeValue.builder().s(email).build());
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
    public String createChat(String email1, String email2) {
        // Step 1: Generate a new chat ID (this can be a UUID or a timestamp-based ID)
        String chatId = UUID.randomUUID().toString();
        System.out.println("Generated Chat ID: " + chatId);  // Debugging line
    
        // Step 2: Create a new chat item in the 'chats' table with participants and initial data
        Map<String, AttributeValue> chatItem = new HashMap<>();
        chatItem.put("chatId", AttributeValue.builder().s(chatId).build());
        chatItem.put("participants", AttributeValue.builder().l(
                Arrays.asList(
                    AttributeValue.builder().s(email1).build(),
                    AttributeValue.builder().s(email2).build()
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
            updateUserChats(email1, chatId);
            updateUserChats(email2, chatId);
            System.out.println("User chats updated for: " + email1 + " and " + email2);  // Debugging line
        } catch (Exception e) {
            System.err.println("Error updating user chats: " + e.getMessage());  // Debugging error
            e.printStackTrace();
        }
    
        return chatId;
    }
    
    
}
