package com._7.reshub.reshub.Services;

import com._7.reshub.reshub.Configs.DynamoDbConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;

import java.util.Map;

@Service
public class SwipeService {

    @Autowired
    private DynamoDbConfig dynamoDbConfig;

    @Autowired
    private DynamoDbClient dynamoDbClient;

    /*
     * Handles adding the new document to the swipe log table.
     */
    public void recordSwipe(String userId, String swipedOnUserId, String direction, long timestamp) {
        Map<String, AttributeValue> item = Map.of(
                "userId", AttributeValue.builder().s(userId).build(),
                "swipedOnUserId", AttributeValue.builder().s(swipedOnUserId).build(),
                "direction", AttributeValue.builder().s(direction).build(),
                "timestamp", AttributeValue.builder().n(Long.toString(timestamp)).build()
        );

        PutItemRequest request = PutItemRequest.builder()
                .tableName(dynamoDbConfig.getSwipeLogTableName())
                .item(item)
                .build();

        dynamoDbClient.putItem(request);
    }
}
