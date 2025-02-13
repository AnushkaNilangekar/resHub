package com._7.reshub.reshub.Services;

import com._7.reshub.reshub.Configs.DynamoDbConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private DynamoDbConfig dynamoDbConfig;

    @Autowired
    private DynamoDbClient dynamoDbClient;

    /*
     * Handles retrieving the user ids of the given user's matches.
     */
    public List<String> getUserMatches(String userId) {
        Map<String, AttributeValue> key = Map.of("userId", AttributeValue.builder().s(userId).build());

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
