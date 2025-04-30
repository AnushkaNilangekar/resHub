package com._7.reshub.reshub.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import com._7.reshub.reshub.Models.BotpressMessage;
import com._7.reshub.reshub.Models.Profile;
import com._7.reshub.reshub.Models.BotpressMessage.Payload;
import com._7.reshub.reshub.Services.ProfileService;
import com._7.reshub.reshub.Services.UserService;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/botpress")
public class BotpressController {

    private final RestTemplate restTemplate = new RestTemplate();
    
    @Value("${botpress.bot.id}")
    private String botId;

    @Value("${botpress.bot.user.id}")
    private String botUserId;
    
    private static final String BOTPRESS_BASE_URL = "https://chat.botpress.cloud/";

    private Instant lastCheckedTime = Instant.MIN;

    @Autowired
    private ProfileService profileService;

    @Autowired
    private UserService userService;

    /**
    * Create a new chat (user + conversation) or use existing credentials
     */
    @PostMapping("/createChat")
    public ResponseEntity<Map<String, Object>> createChat(@RequestParam String userId) {
        // Read user profile data
        Profile profile = profileService.doGetProfile(userId);
        String userName = profile.getFullName();
        String existingConversationId = profile.getBotConversationId();

        if (existingConversationId == null || existingConversationId.isBlank() || existingConversationId.isEmpty())
        {

            // Create user
            String userKey;
            Map<String, Object> userInfo = new HashMap<>();
            
            Map<String, Object> userRequest = new HashMap<>();
            userRequest.put("id", userId);
            userRequest.put("name", userName);
            
            try
            {
                Map<String, Object> userResponse = createUser(userRequest);
                userKey = (String) userResponse.get("key");
            
                @SuppressWarnings("unchecked")
                Map<String, Object> user = (Map<String, Object>) userResponse.get("user");
                userInfo = user;

                // Create chat in chats table
                String conversationId = userService.createBotChat(userId, botUserId, userKey);

                // Store conversation id with user profile
                profileService.doAddBotConversationId(userId, conversationId);

                // Create conversation
                Map<String, Object> conversationInfo;
                Map<String, Object> conversationRequest = new HashMap<>();

                conversationRequest.put("id", conversationId);

                // Call botpress api to create conversation
                Map<String, Object> conversationResponse = createConversation(userKey, conversationRequest);
                
                @SuppressWarnings("unchecked")
                Map<String, Object> conversation = (Map<String, Object>) conversationResponse.get("conversation");
                conversationInfo = conversation;
                
                // Prepare response
                Map<String, Object> response = new HashMap<>();
                response.put("userKey", userKey);
                response.put("user", userInfo);
                response.put("conversation", conversationInfo);
                response.put("conversationId", conversationId);
                
                return ResponseEntity.ok(response);
            } catch (Exception e)
            {
                e.printStackTrace();
                return ResponseEntity.status(500).body(Map.of("error", "Internal server error: " + e.getMessage()));
            }
        }
        else
        {
            return ResponseEntity.status(500).body(Map.of("error", "user already has a support bot chat."));
        }
    }
    
    /**
     * Send a message and get all responses (with automatic pagination)
     */
    @PostMapping("/sendMessage")
    public ResponseEntity<Map<String, Object>> chat(@RequestParam String userId, String message) {
        Profile profile = profileService.doGetProfile(userId);
        String conversationId = profile.getBotConversationId();
        String userKey = userService.getUserKey(conversationId);

        // Validate required fields
        if (userKey == null || userKey.isEmpty()) {
            throw new IllegalArgumentException("User key not found - user may not have support bot chat initialized.");
        }
        
        if (conversationId == null || conversationId.isEmpty()) {
            throw new IllegalArgumentException("Conversation ID not found - user may not have support bot chat initialized.");
        }

        // Send message
        Map<String, Object> messageRequest = new HashMap<>();
        messageRequest.put("conversationId", conversationId);
        
        Map<String, Object> payload = new HashMap<>();
        payload.put("type", "text");
        payload.put("text", message);
        
        messageRequest.put("payload", payload);

        Map<String, Object> sentMessage = sendMessage(userKey, messageRequest);
        userService.createMessage(conversationId, Instant.now().toString(), userId, profile.getFullName(), message);
        
        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("userKey", userKey);
        response.put("conversationId", conversationId);
        response.put("sentMessage", sentMessage);
        
        return ResponseEntity.ok(response);
    }

    /*
     * Gets all new messages from the bot
     */
    @GetMapping("/getNewMessages")
    private ResponseEntity<List<BotpressMessage>> getNewBotMessages(@RequestParam String userId) {
        Profile profile = profileService.doGetProfile(userId);
        String conversationId = profile.getBotConversationId();
        String userKey = userService.getUserKey(conversationId);

        if (userKey == null || userKey.isEmpty()) {
            throw new IllegalArgumentException("User key not found - user may not have support bot chat initialized.");
        }
        
        if (conversationId == null || conversationId.isEmpty()) {
            throw new IllegalArgumentException("Conversation ID not found - user may not have support bot chat initialized.");
        }

        List<BotpressMessage> allMessages = doGetAllMessages(userKey, conversationId, false);

        // Filter messages newer than our last check
        List<BotpressMessage> newMessages = allMessages.stream()
            .filter(msg -> msg.getCreatedAtInstant().isAfter(lastCheckedTime))
            .filter(msg -> !msg.getUserId().equals(userId))
            .collect(Collectors.toList());
        
        lastCheckedTime = Instant.now();

        for (int i = newMessages.size() - 1; i >= 0; i--) {
            userService.createMessage(conversationId, Instant.now().toString(), userId, "Support Bot", newMessages.get(i).getPayload().getText());
        }
        
        return ResponseEntity.ok(newMessages);
    }

    @GetMapping("/getAllMessages")
    public ResponseEntity<Map<String, Object>> getAllMessages(@RequestParam String userId) {
        Profile profile = profileService.doGetProfile(userId);
        String conversationId = profile.getBotConversationId();
        String userKey = userService.getUserKey(conversationId);

        if (userKey == null || userKey.isEmpty()) {
            throw new IllegalArgumentException("User key not found - user may not have support bot chat initialized.");
        }
        
        if (conversationId == null || conversationId.isEmpty()) {
            throw new IllegalArgumentException("Conversation ID not found - user may not have support bot chat initialized.");
        }
        
        // Get all messages with automatic pagination
        List<BotpressMessage> allMessages = doGetAllMessages(
            userKey,
            conversationId,
            true
        );
        
        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("userKey", userKey);
        response.put("conversationId", conversationId);
        response.put("messages", allMessages);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Internal method to create a new Botpress user
     */
    private Map<String, Object> createUser(Map<String, Object> userRequest) {
        String url = BOTPRESS_BASE_URL + botId + "/users";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(userRequest, headers);
        
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
            url,
            HttpMethod.POST,
            entity,
            new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        
        return response.getBody();
    }
    
    /**
     * Internal method to create a new conversation
     */
    private Map<String, Object> createConversation(String userKey, Map<String, Object> conversationRequest) {
        String url = BOTPRESS_BASE_URL + botId + "/conversations";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-user-key", userKey);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(conversationRequest, headers);
        
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
            url,
            HttpMethod.POST,
            entity,
            new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        
        return response.getBody();
    }
    
    /**
     * Internal method to send a message to the bot
     */
    private Map<String, Object> sendMessage(String userKey, Map<String, Object> messageRequest) {
        String url = BOTPRESS_BASE_URL + botId + "/messages";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-user-key", userKey);
        
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(messageRequest, headers);
        
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
            url,
            HttpMethod.POST,
            entity,
            new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        
        return response.getBody();
    }

    /**
     * Internal method to get messages from a conversation with automatic pagination
     */
    private List<BotpressMessage> doGetAllMessages(String userKey, String conversationId, boolean getAllPages) {
        List<BotpressMessage> allMessages = new ArrayList<>();
        String nextToken = null;
        
        do {
            Map<String, Object> pageResult = getMessagesPage(userKey, conversationId, nextToken);
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> messages = (List<Map<String, Object>>) pageResult.get("messages");
            
            if (messages != null) {
                messages.stream()
                    .map(this::convertToBotpressMessage)
                    .forEach(allMessages::add);
            }
            
            // Reset nextToken
            nextToken = null;
            
            // Check if there are more pages
            if (pageResult != null && pageResult.containsKey("meta")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> meta = (Map<String, Object>) pageResult.get("meta");
                if (meta != null && meta.containsKey("nextToken")) {
                    nextToken = (String) meta.get("nextToken");
                }
            }
            
        } while (getAllPages && nextToken != null && !nextToken.isEmpty());
        
        return allMessages;
    }
    
    /**
     * Internal method to get a single page of messages
     */
    private Map<String, Object> getMessagesPage(String userKey, String conversationId, String nextToken) {
        String url = BOTPRESS_BASE_URL + botId + "/conversations/" + conversationId + "/messages";
        
        // Add pagination token if provided
        if (nextToken != null && !nextToken.isEmpty()) {
            url += "?nextToken=" + nextToken;
        }
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-user-key", userKey);
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
            url,
            HttpMethod.GET,
            entity,
            new ParameterizedTypeReference<Map<String, Object>>() {}
        );
        
        return response.getBody();
    }

    private BotpressMessage convertToBotpressMessage(Map<String, Object> messageMap) {
        // Handle payload first
        Payload payload = null;
        if (messageMap.containsKey("payload")) {
            @SuppressWarnings("unchecked")
            Map<String, Object> payloadMap = (Map<String, Object>) messageMap.get("payload");
            payload = new Payload(
                (String) payloadMap.get("type"),
                (String) payloadMap.get("text")
            );
        }
    
        return new BotpressMessage(
            (String) messageMap.get("id"),
            (String) messageMap.get("createdAt"),
            (String) messageMap.get("conversationId"),
            (String) messageMap.get("userId"),
            payload
        );
    }
}