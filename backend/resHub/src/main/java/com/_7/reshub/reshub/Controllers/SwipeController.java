package com._7.reshub.reshub.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com._7.reshub.reshub.Services.DynamoDbService;
import java.time.Instant;

@RestController
@RequestMapping("/api/swipes")
public class SwipeController {

    @Autowired
    private DynamoDbService dynamoDbService;

    /*
     * Should be called when a user swipes on another uesrs card.
     * @params 
     * userId: the id of the user swiping
     * swipedOnUserId: the id of the user they swiped on
     * direction: either "l" for left swipe or "r" for right swipe
     */
    @PostMapping("/createSwipe")
    public String createSwipe(@RequestParam String userId, 
                              @RequestParam String swipedOnUserId, 
                              @RequestParam String direction) {

        if (!direction.equals("l") && !direction.equals("r")) {
            return "Invalid swipe direction. Please use 'l' for left or 'r' for right.";
        }

        long timestamp = Instant.now().getEpochSecond();

        try {
            dynamoDbService.recordSwipe(userId, swipedOnUserId, direction, timestamp);

            return "Swipe recorded successfully!";
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
}
