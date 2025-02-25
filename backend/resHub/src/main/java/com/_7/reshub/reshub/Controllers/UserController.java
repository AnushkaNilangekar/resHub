package com._7.reshub.reshub.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com._7.reshub.reshub.Services.UserService;
import java.util.List;

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
            List<String> matches = userService.doGetUserMatches(userId);
            return matches;
        } catch (Exception e) {
            e.printStackTrace();
            return List.of("Error: " + e.getMessage());
        }
    }

    public String createMatch(@RequestParam String userId, @RequestParam String matchUserId)
    {
        try
        {
            userService.doCreateMatch(userId, matchUserId);
            return "Match between " + userId + " and " + matchUserId;
        } catch (Exception e)
        {
            e.printStackTrace();
            return "Error: " + e.getMessage();
        }
    }
}
