package com._7.reshub.reshub.Controllers;

import com._7.reshub.reshub.Models.ForumPost;
import com._7.reshub.reshub.Services.ForumPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum")
public class ForumPostController {
    @Autowired
    private ForumPostService forumPostService;

    @PostMapping("/create")
    public ResponseEntity<?> createPost(@RequestBody ForumPost post) {
        forumPostService.createPost(post);
        return ResponseEntity.ok("Post created successfully!");
    }

    @GetMapping("/getPosts")
    public ResponseEntity<List<ForumPost>> getPosts(@RequestParam String residenceHall) {
        List<ForumPost> posts = forumPostService.getPostsByResidenceHall(residenceHall);
        return ResponseEntity.ok(posts);
    }
}