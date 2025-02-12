package com._7.reshub.reshub.Services;

import com._7.reshub.reshub.Configs.DynamoDbConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;
import java.util.ArrayList;

@Service
public class DynamoDbService {

    @Autowired
    private DynamoDbConfig dynamoDbConfig;

    private DynamoDbClient dynamoDbClient;

    /*
     * Creates the DynamoDB client using the credentials stored in your system.
     */
    public DynamoDbClient getDynamoDbClient() {
        if (dynamoDbClient == null) {
            dynamoDbClient = DynamoDbClient.builder()
                    .httpClientBuilder(UrlConnectionHttpClient.builder())
                    .credentialsProvider(ProfileCredentialsProvider.create())
                    .build();
        }
        return dynamoDbClient;
    }

    /*
     * Handles adding the new document to the swipe log table.
     */
    public void recordSwipe(String userId, String swipedOnUserId, String direction, long timestamp) {
        DynamoDbClient dynamoDbClient = getDynamoDbClient();

        Map<String, AttributeValue> item = new HashMap<>();
        item.put("userId", AttributeValue.builder().s(userId).build());
        item.put("swipedOnUserId", AttributeValue.builder().s(swipedOnUserId).build());
        item.put("direction", AttributeValue.builder().s(direction).build());
        item.put("timestamp", AttributeValue.builder().n(Long.toString(timestamp)).build());

        PutItemRequest request = PutItemRequest.builder()
                .tableName(dynamoDbConfig.getSwipeLogTableName())
                .item(item)
                .build();

        dynamoDbClient.putItem(request);
    }

    /*
     * Handles retrieving the user ids of the given users matches
     */
    public List<String> getUserMatches(String userId) {
        DynamoDbClient dynamoDbClient = getDynamoDbClient();

        Map<String, AttributeValue> key = new HashMap<>();
        key.put("userId", AttributeValue.builder().s(userId).build());

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
}
