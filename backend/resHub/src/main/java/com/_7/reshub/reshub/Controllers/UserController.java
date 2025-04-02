package com._7.reshub.reshub.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import com._7.reshub.reshub.Services.UserService;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /*
     * GET endpoint to get a list of user ids of matches for a given user.
     * 
     * @params
     * userId: The id of the user whose matches are to be retrieved
     * 
     * @return List of match IDs
     */
    @GetMapping("/getMatches")
    public List<String> getUserMatches(@RequestParam String userId) {
        try {
            List<String> matches = userService.doGetUserMatches(userId);
            return matches;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of("Error: " + e.getMessage());
        }
    }

    public String createMatch(@RequestParam String userId, @RequestParam String matchUserId) {
        try {
            userService.doCreateMatch(userId, matchUserId);
            return "Match between " + userId + " and " + matchUserId;
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    /*
     * GET endpoint to get a list of chatids for a given user.
     * 
     * @params
     * userId: The id of the user whose matches are to be retrieved
     * 
     * @return List of match IDs
     */
    @GetMapping("/getChats")
    public List<String> getUserChats(@RequestParam String userId) {

        try {
            List<String> chats = userService.retrieveUserChats(userId); // Assuming you have this service method
                                                                        // implemented
            return chats;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of("Error: " + e.getMessage());
        }
    }

    /*
     * GET endpoint to get the email of the other user in a chat.
     * 
     * @params
     * userId: The id of the user whose other chat participant's email is to be
     * retrieved
     * chatId: The id of the chat to find the other user in
     * 
     * @return The email of the other user in the chat
     */
    @GetMapping("/getOtherUserId")
    public String getOtherUserId(@RequestParam String userId, @RequestParam String chatId) {

        try {
            String otherUserId = userService.getOtherUserId(chatId, userId); // Assuming this method is implemented in
                                                                             // your UserService
            return otherUserId;
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    /*
     * GET endpoint to get the emails of uses that a user has a chat with.
     * 
     * @params
     * userId: The id of the user whose other chat participant's email is to be
     * retrieved
     * 
     * @return The emails of users which has a chat with the user
     */
    @GetMapping("/getOtherUserIds")
    public List<String> getOtherUserIds(@RequestParam String userId) {

        try {
            List<String> otherUserIds = userService.getOtherUserIds(userId);
            return otherUserIds;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of("Error: " + e.getMessage());
        }
    }

    @GetMapping("/getChatDetails")
    public Map<String, String> getChatDetails(@RequestParam String userId, @RequestParam String chatId) {
        try {
            // Get the chat details (other user email and last message)
            Map<String, String> chatDetails = userService.getChatDetails(userId, chatId);
            return chatDetails; // Return the chat details map
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "Error: " + e.getMessage());
        }
    }

    @PostMapping("/createChat")
    public String createChat(@RequestParam String userId1, @RequestParam String userId2) {
        try {
            String chatId = userService.createChat(userId1, userId2);
            return chatId;
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    @PostMapping("/updateLastTimeActive")
    public ResponseEntity<?> updateRecentlyActive(@RequestParam String userId) {
        try {
            userService.doUpdateLastTimeActive(userId);
            return ResponseEntity.ok("User " + userId + " last time active updated.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/createMessage")
    public String createMessage(@RequestParam String chatId, @RequestParam String createdAt,
            @RequestParam String userId, @RequestParam String name, @RequestParam String text) {
        try {
            userService.createMessage(chatId, createdAt, userId, name, text);
            return "message created";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    @PostMapping("/markMessagesAsRead")
    public ResponseEntity<?> markMessagesAsRead(@RequestBody Map<String, String> payload) {
        String chatId = payload.get("chatId");
        String userId = payload.get("userId");
        userService.markMessagesAsRead(chatId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/getMessages")
    public ResponseEntity<?> getMessages(@RequestParam String chatId) {
        try {
            List<Map<String, String>> messages = userService.getMessages(chatId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/unMatch")
    public ResponseEntity<?> unMatch(@RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            String matchUserId = request.get("matchUserId");
            String chatId = request.get("chatId");

            userService.unmatch(userId, matchUserId, chatId);
            return ResponseEntity.ok("Unmatched successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/checkUserExists")
    public ResponseEntity<?> checkUserExists(@RequestParam String userId) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", userService.userExists(userId));
        return ResponseEntity.ok(response);
    }
}
