package com._7.reshub.reshub.Services;

import com._7.reshub.reshub.Configs.DynamoDbConfig;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.QueryRequest;
import software.amazon.awssdk.services.dynamodb.model.QueryResponse;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SwipeService {

    @Autowired
    private DynamoDbConfig dynamoDbConfig;

    @Autowired
    private DynamoDbClient dynamoDbClient;

    long timeStart = 0;

    /*
     * Handles adding the new document to the swipe log table.
     */
    public void doCreateSwipe(String userId, String swipedOnUserId, String direction, long timestamp, long expirationTimestamp) {
        Map<String, AttributeValue> item = Map.of(
                "userId", AttributeValue.builder().s(userId).build(),
                "swipedOnUserId", AttributeValue.builder().s(swipedOnUserId).build(),
                "direction", AttributeValue.builder().s(direction).build(),
                "timestamp", AttributeValue.builder().n(Long.toString(timestamp)).build(),
                "expirationTimestamp", AttributeValue.builder().n(Long.toString(expirationTimestamp)).build()
        );

        PutItemRequest request = PutItemRequest.builder()
                .tableName(dynamoDbConfig.getSwipeLogTableName())
                .item(item)
                .build();

        dynamoDbClient.putItem(request);
    }

    /*
     * Handles retriving the list of userids of the given user'd left and right swipes.
     * (This only applies to the past two months since swipe logs get deleted
     * automatically after that time.)
     */
    public List<String> doGetAllSwipedOn(String userId) {
        QueryRequest queryRequest = QueryRequest.builder()
            .tableName(dynamoDbConfig.getSwipeLogTableName())
            .keyConditionExpression("userId = :userId AND #ts > :timeStart")
            .expressionAttributeNames(Map.of(
                    "#ts", "timestamp" // timestamp is a 'reserved keyword' so it has to be aliased
            ))
            .expressionAttributeValues(Map.of(
                    ":userId", AttributeValue.builder().s(userId).build(),
                    ":timeStart", AttributeValue.builder().n(Long.toString(timeStart)).build()
            ))
            .build();

    
                QueryResponse response = dynamoDbClient.query(queryRequest);
    
                if (response.hasItems()) {
                    return response.items().stream()
                            .map(item -> item.get("swipedOnUserId").s())
                            .collect(Collectors.toList());
                }

                return Collections.emptyList();
    }

    /*
     * Returns true if the first user swiped right on the second, false otherwise
     */
    public boolean doCheckRightSwipe(String userId, String swipedOnUserId) {
        QueryRequest queryRequest = QueryRequest.builder()
            .tableName(dynamoDbConfig.getSwipeLogTableName())
            .keyConditionExpression("userId = :userId AND #ts > :timeStart")
            .filterExpression("direction = :direction")
            .expressionAttributeNames(Map.of(
                    "#ts", "timestamp" // timestamp is a 'reserved keyword' so it has to be aliased
            ))
            .expressionAttributeValues(Map.of(
                    ":userId", AttributeValue.builder().s(userId).build(),
                    ":timeStart", AttributeValue.builder().n(Long.toString(timeStart)).build(),
                    ":direction", AttributeValue.builder().s("r").build()
            ))
            .build();

        QueryResponse response = dynamoDbClient.query(queryRequest);

        return response.hasItems() && response.items().stream()
            .anyMatch(item -> item.get("swipedOnUserId").s().equals(swipedOnUserId));
    }

    /*
     * Handles deleting a swipe (used for swipe rollback)
     */
    public void doRollbackSwipe(String userId, String swipedOnUserId, String direction) {
        QueryRequest queryRequest = QueryRequest.builder()
                .tableName(dynamoDbConfig.getSwipeLogTableName())
                .keyConditionExpression("userId = :userId")
                .filterExpression("swipedOnUserId = :swipedOnUserId AND direction = :direction")
                .expressionAttributeValues(Map.of(
                        ":userId", AttributeValue.builder().s(userId).build(),
                        ":swipedOnUserId", AttributeValue.builder().s(swipedOnUserId).build(),
                        ":direction", AttributeValue.builder().s(direction).build()
                ))
                .scanIndexForward(false) // Sorts in descending order by timestamp (most recent first)
                .limit(1)
                .build();
    
        QueryResponse response = dynamoDbClient.query(queryRequest);
    
        if (response.hasItems()) {
            Map<String, AttributeValue> mostRecentSwipe = response.items().get(0);
    
           String swipeId = mostRecentSwipe.get("userId").s();
    
           Map<String, AttributeValue> key = Map.of(
                    "userId", AttributeValue.builder().s(swipeId).build(),
                    "timestamp", mostRecentSwipe.get("timestamp")
            );
    
            DeleteItemRequest deleteRequest = DeleteItemRequest.builder()
                    .tableName(dynamoDbConfig.getSwipeLogTableName())
                    .key(key)
                    .build();
    
            dynamoDbClient.deleteItem(deleteRequest);
        } else {
            System.out.println("No matching swipe found for the given parameters.");
        }
    }    
}
