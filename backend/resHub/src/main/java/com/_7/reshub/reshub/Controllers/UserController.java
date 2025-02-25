package com._7.reshub.reshub.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;

import com._7.reshub.reshub.Services.UserService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /*
     * GET endpoint to get a list of user ids of matches for a given user.
     * @params
     * userId: The id of the user whose matches are to be retrieved
     * @return List of match IDs
     */
    @GetMapping("/getMatches")
    public List<String> getUserMatches(@RequestParam String userId) {

        try {
            List<String> matches = userService.retrieveUserMatches(userId);
            return matches;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of("Error: " + e.getMessage());
        }
    }

     /*
     * GET endpoint to get a list of chatids for a given user.
     * @params
     * userId: The id of the user whose matches are to be retrieved
     * @return List of match IDs
     */ 
    @GetMapping("/getChats")
    public List<String> getUserChats(@RequestParam String userId) {

        try {
            List<String> chats = userService.retrieveUserChats(userId);  // Assuming you have this service method implemented
            return chats;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of("Error: " + e.getMessage());
        }
    }

    /*
     * GET endpoint to get the email of the other user in a chat.
     * @params
     * userId: The id of the user whose other chat participant's email is to be retrieved
     * chatId: The id of the chat to find the other user in
     * @return The email of the other user in the chat
     */
    @GetMapping("/getOtherUserEmail")
    public String getOtherUserEmail(@RequestParam String userId, @RequestParam String chatId) {

        try {
            String otherUserEmail = userService.getOtherUserEmail(userId, chatId);  // Assuming this method is implemented in your UserService
            return otherUserEmail;
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }


     /*
     * GET endpoint to get the emails of uses that a user has a chat with.
     * @params
     * userId: The id of the user whose other chat participant's email is to be retrieved
     * @return The emails of users which has a chat with the user
     */
    @GetMapping("/getOtherUserEmails")
    public List<String> getOtherUserEmails(@RequestParam String userId) {

        try {
            List<String> otherUserEmails = userService.getOtherUserEmails(userId);
            return otherUserEmails;
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
            return chatDetails;  // Return the chat details map
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", "Error: " + e.getMessage());
        }
    }

    @PostMapping("/createChat")
    public String createChat(@RequestParam String email1, @RequestParam String email2) {
        try {
            String chatId = userService.createChat(email1, email2);
            return chatId;
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
    
}
