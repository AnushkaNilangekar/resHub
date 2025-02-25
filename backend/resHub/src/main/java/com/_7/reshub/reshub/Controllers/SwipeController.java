package com._7.reshub.reshub.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com._7.reshub.reshub.Services.SwipeService;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@RestController
@RequestMapping("/api/swipes")
public class SwipeController {

    @Autowired
    private UserController userController;

    @Autowired
    private SwipeService swipeService;

    /* Should be called when a user swipes left on another user's card
     * @params userId: the id of the user who swiped left on others
     * @params swipedOnUserId: the id of the user who is being swiped left on
     * @returns Success string if successful, error string otherwise
     */
    @PostMapping("/swipeLeft")
    public ResponseEntity<String> swipeLeft(@RequestParam String userId, @RequestParam String swipedOnUserId) {
        String response = createSwipe(userId, swipedOnUserId, "l");
        if (response.contains("Error")) {
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(response, HttpStatus.OK);
    }


    /* Should be called when a user swipes right on another user's card
     * @params userId: the id of the user who swiped left on others
     * @params swipedOnUserId: the id of the user who is being swiped right on
     * @returns Success string if successful, error string otherwise
     */
    @PostMapping("/swipeRight")
    public ResponseEntity<String> swipeRight(@RequestParam String userId, @RequestParam String swipedOnUserId) {
        String response = createSwipe(userId, swipedOnUserId, "r");

        if (response.contains("Error")) {
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (checkRightSwipe(swipedOnUserId, userId)) {
            response += "\n" + userController.createMatch(userId, swipedOnUserId);
        }

        if (response.contains("Error:"))
        {
            try {
                swipeService.doRollbackSwipe(userId, swipedOnUserId, "r");
            } catch (Exception rollbackException) {
                rollbackException.printStackTrace();
                return new ResponseEntity<>("Error occurred during rollback.", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            response += "\nRolling back right swipe";
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /* This endpoint should be used to filter out cards in the frontned, so
     * users they have already swiped on do not reappear.
     * 
     * Gets a list of user ids that the given user has swiped left or right on
     * (in the past 2 months because swipe logs expire after that time)
     * @params userId: the id of the user who swiped left or right on others
     * @returns list of userIds they swiped left or right on
     */
    @GetMapping("/getAllSwipedOn")
    public ResponseEntity<List<String>> getAllSwipedOn(@RequestParam String userId) {
        try {
            List<String> swipedUsers = swipeService.doGetAllSwipedOn(userId);

            List<String> uniqueSwipedUsers = new ArrayList<>(new HashSet<>(swipedUsers));

            return new ResponseEntity<>(uniqueSwipedUsers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /*
     * Helper method to create an entry in the swipe log table. 
     * @params userId: the id of the user swiping
     * @params swipedOnUserId: the id of the user they swiped on
     * @params direction: either "l" for left swipe or "r" for right swipe
     * @returns
     */
    private String createSwipe(String userId, String swipedOnUserId, String direction) {
        if (!direction.equals("l") && !direction.equals("r")) {
            return "Invalid swipe direction. Please use \"l\" for left or \"r\" for right.";
        }

        long timestamp = Instant.now().getEpochSecond();
        long expirationTimestamp = LocalDate.now().plusMonths(2).atStartOfDay(ZoneOffset.UTC).toInstant().getEpochSecond();

        try {
            swipeService.doCreateSwipe(userId, swipedOnUserId, direction, timestamp, expirationTimestamp);
            return (direction == "l" ? "Left" : "Right") + " swipe recorded successfully!";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }

    /*
     * Helper method to determine if user1 has swiped right on user2
     * (in the past 2 months because swipe logs expire after that time)
     * @params userId1: first user id
     * @params userId2: second user id
     * @returns true if first user swiped right on the second, false otherwise
     */
    public boolean checkRightSwipe( String userId1, String userId2) {
        try {
            boolean mutualSwipe = swipeService.doCheckRightSwipe(userId1, userId2);
            return mutualSwipe;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
