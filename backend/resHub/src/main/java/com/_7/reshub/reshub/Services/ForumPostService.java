package com._7.reshub.reshub.Services;

import com._7.reshub.reshub.Models.ForumPost;
import com._7.reshub.reshub.Configs.DynamoDbConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ForumPostService {
    @Autowired
    private DynamoDbClient dynamoDbClient;

    @Autowired
    private DynamoDbConfig dynamoDbConfig;

    public void createPost(ForumPost post) {
        Map<String, AttributeValue> item = new HashMap<>();
        //System.out.println(post.getFullName());
        //System.out.println(post.getResidenceHall());
        item.put("postId", AttributeValue.builder().s(post.getPostId()).build());
        item.put("userId", AttributeValue.builder().s(post.getUserId()).build());
        String residenceHall = post.getResidenceHall();
        if (residenceHall == null || residenceHall.trim().isEmpty()) {
            residenceHall = "Other Halls/Apartments";
        }
        item.put("residenceHall", AttributeValue.builder().s(residenceHall).build());
        item.put("content", AttributeValue.builder().s(post.getContent()).build());
        item.put("createdAt", AttributeValue.builder().s(post.getCreatedAt().toString()).build());
        if (post.getFullName() != null && !post.getFullName().trim().isEmpty()) {
            item.put("fullName", AttributeValue.builder().s(post.getFullName()).build());
        } else {
            item.put("fullName", AttributeValue.builder().s("Anonymous").build());
        }

        PutItemRequest request = PutItemRequest.builder()
            .tableName(dynamoDbConfig.getForumPostsTableName())
            .item(item)
            .build();

        dynamoDbClient.putItem(request);
    }

    public List<ForumPost> getPostsByResidenceHall(String residenceHall) {
        Map<String, String> expressionAttributeNames = new HashMap<>();
        expressionAttributeNames.put("#residenceHall", "residenceHall");

        Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
        expressionAttributeValues.put(":residenceHall", AttributeValue.builder().s(residenceHall).build());

        ScanRequest request = ScanRequest.builder()
            .tableName(dynamoDbConfig.getForumPostsTableName())
            .filterExpression("#residenceHall = :residenceHall")
            .expressionAttributeNames(expressionAttributeNames)
            .expressionAttributeValues(expressionAttributeValues)
            .build();

        ScanResponse response = dynamoDbClient.scan(request);

        return response.items().stream()
            .map(this::mapToForumPost)
            .sorted(Comparator.comparing(ForumPost::getCreatedAt).reversed())
            .collect(Collectors.toList());
    }

    private ForumPost mapToForumPost(Map<String, AttributeValue> item) {
        ForumPost post = new ForumPost();
        post.setPostId(item.get("postId").s());
        post.setUserId(item.get("userId").s());
        post.setResidenceHall(item.get("residenceHall").s());
        post.setContent(item.get("content").s());
        post.setCreatedAt(Instant.parse(item.get("createdAt").s()));
        if (item.containsKey("fullName")) {
            post.setFullName(item.get("fullName").s());
        }
        return post;
    }
}