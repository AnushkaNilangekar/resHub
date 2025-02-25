package com._7.reshub.reshub.Services;

import com._7.reshub.reshub.Configs.DynamoDbConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;
import software.amazon.awssdk.services.dynamodb.model.UpdateItemRequest;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private DynamoDbConfig dynamoDbConfig;

    @Autowired
    private DynamoDbClient dynamoDbClient;

    /*
     * Handles retrieving the user ids of the given user's matches.
     */
    public List<String> doGetUserMatches(String userId) {
        Map<String, AttributeValue> key = Map.of("email", AttributeValue.builder().s(userId).build());

        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
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
     * Handles adding each user to the other's matches table
     */
    public void doCreateMatch(String userId, String matchUserId) {
        doAddToMatches(userId, matchUserId);
        doAddToMatches(matchUserId, userId);
    }

    /*
     * Handles adding the new match to the user1's document in the userProfiles table
     */
    public void doAddToMatches(String userId, String matchUserId) {
        List<String> matches = new ArrayList<>(doGetUserMatches(userId));
    
        if (!matches.contains(matchUserId)) {
            matches.add(matchUserId);
        }
    
        Map<String, AttributeValue> key = Map.of("email", AttributeValue.builder().s(userId).build());
        Map<String, AttributeValue> updateValues = Map.of(
                ":newMatches", AttributeValue.builder().l(matches.stream()
                        .map(match -> AttributeValue.builder().s(match).build())
                        .collect(Collectors.toList())).build()
        );
    
        UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .updateExpression("SET matches = :newMatches")
                .expressionAttributeValues(updateValues)
                .build();
    
        dynamoDbClient.updateItem(updateRequest);
    }    
}
