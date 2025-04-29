package com._7.reshub.reshub.Services;

import com._7.reshub.reshub.Configs.DynamoDbConfig;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.DeleteItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.PutItemResponse;
import software.amazon.awssdk.services.dynamodb.model.QueryRequest;
import software.amazon.awssdk.services.dynamodb.model.QueryResponse;
import software.amazon.awssdk.services.dynamodb.model.ProvisionedThroughputExceededException;

import jakarta.annotation.PostConstruct;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.stream.Collectors;

@Service
public class SwipeService {

    @Autowired
    private DynamoDbConfig dynamoDbConfig;

    @Autowired
    private DynamoDbClient dynamoDbClient;

    // Queue just for swipe creation operations
    private Queue<Map<String, Object>> swipeCreateQueue;
    
    private long timeStart = 0;

    @PostConstruct
    public void initialize() {
        swipeCreateQueue = new ConcurrentLinkedQueue<>();
    }

    // Process the queue every 334ms (~3 operations per second)
    @Scheduled(fixedRate = 334)
    public void processQueue() {
        Map<String, Object> swipeOperation = swipeCreateQueue.poll();
        if (swipeOperation != null) {
            try {
                executeCreateSwipe(
                    (String) swipeOperation.get("userId"),
                    (String) swipeOperation.get("swipedOnUserId"),
                    (String) swipeOperation.get("direction"),
                    (Long) swipeOperation.get("timestamp"),
                    (Long) swipeOperation.get("expirationTimestamp")
                );
            } catch (ProvisionedThroughputExceededException e) {
                // If we hit throughput limits, put the operation back in the queue
                System.out.println("Throughput exceeded, requeueing swipe creation operation");
                swipeCreateQueue.offer(swipeOperation);
                
                // Simple backoff - sleep for 200ms before trying again
                try {
                    Thread.sleep(200);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            } catch (Exception e) {
                // Requeue on error
                System.err.println("Error processing swipe creation: " + e.getMessage());
                swipeCreateQueue.offer(swipeOperation);
            }
        }
    }

    /*
     * Handles adding the new document to the swipe log table.
     * Queues the operation instead of executing directly.
     */
    public void doCreateSwipe(String userId, String swipedOnUserId, String direction, long timestamp, long expirationTimestamp) {
        Map<String, Object> swipeOperation = new HashMap<>();
        swipeOperation.put("userId", userId);
        swipeOperation.put("swipedOnUserId", swipedOnUserId);
        swipeOperation.put("direction", direction);
        swipeOperation.put("timestamp", timestamp);
        swipeOperation.put("expirationTimestamp", expirationTimestamp);
        
        swipeCreateQueue.offer(swipeOperation);
    }

    /*
     * Actual implementation of the swipe creation that works directly with DynamoDB
     */
    private void executeCreateSwipe(String userId, String swipedOnUserId, String direction, long timestamp, long expirationTimestamp) {
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
     * Returns a list of userIds of users who swiped right on the given swipedOnUserId.
     */
    public List<String> doGetAllUsersWhoSwipedRightOn(String swipedOnUserId) {
        QueryRequest queryRequest = QueryRequest.builder()
            .tableName(dynamoDbConfig.getSwipeLogTableName())
            .indexName("swipedOnUserId-index")  // GSI on swipedOnUserId
            .keyConditionExpression("swipedOnUserId = :swipedOnUserId")
            .filterExpression("direction = :direction")
            .expressionAttributeValues(Map.of(
                ":swipedOnUserId", AttributeValue.builder().s(swipedOnUserId).build(),
                ":direction", AttributeValue.builder().s("r").build()
            ))
            .build();

        QueryResponse response = dynamoDbClient.query(queryRequest);

        List<String> usersWhoSwipedRight = new ArrayList<>();
        if (response.hasItems()) {
            usersWhoSwipedRight = response.items().stream()
                .map(item -> item.get("userId").s())
                .collect(Collectors.toList());
        }

        return usersWhoSwipedRight;
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

    /**
     * Delete all swipe logs associated with a user.
     * Deletes both swipes made by the user and swipes made on the user.
     * 
     * @param userId The ID of the user whose swipe logs should be deleted
     */
    public void deleteUserSwipes(String userId) {
        try {
            // Query swipes where userId is the swiping user
            QueryRequest querySwipesBy = QueryRequest.builder()
                .tableName("swipe_logs")
                .keyConditionExpression("userId = :userId")
                .expressionAttributeValues(Map.of(":userId", AttributeValue.builder().s(userId).build()))
                .build();
            
            QueryResponse swipesByResponse = dynamoDbClient.query(querySwipesBy);
            
            // Delete each swipe made by the user
            for (Map<String, AttributeValue> item : swipesByResponse.items()) {
                Map<String, AttributeValue> key = new HashMap<>();
                key.put("userId", item.get("userId"));
                key.put("swipedOnUserId", item.get("swipedOnUserId"));
                
                DeleteItemRequest deleteRequest = DeleteItemRequest.builder()
                    .tableName("swipe_logs")
                    .key(key)
                    .build();
                
                dynamoDbClient.deleteItem(deleteRequest);
            }
            
            // Query swipes where userId is the user being swiped on
            // Note: You may need a GSI for this query to be efficient
            // This example assumes there's a GSI on swipedOnUserId
            QueryRequest querySwipesOn = QueryRequest.builder()
                .tableName("swipe_logs")
                .indexName("swipedOnUserId-index")
                .keyConditionExpression("swipedOnUserId = :userId")
                .expressionAttributeValues(Map.of(":userId", AttributeValue.builder().s(userId).build()))
                .build();
            
            QueryResponse swipesOnResponse = dynamoDbClient.query(querySwipesOn);
            
            // Delete each swipe made on the user
            for (Map<String, AttributeValue> item : swipesOnResponse.items()) {
                Map<String, AttributeValue> key = new HashMap<>();
                key.put("userId", item.get("userId"));
                key.put("swipedOnUserId", item.get("swipedOnUserId"));
                
                DeleteItemRequest deleteRequest = DeleteItemRequest.builder()
                    .tableName("swipe_logs")
                    .key(key)
                    .build();
                
                dynamoDbClient.deleteItem(deleteRequest);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete user swipe logs: " + e.getMessage(), e);
        }
    }

    /*
     * Creates a hyper-precise timestamp down to the millisecond to prevent swipe logs having
     * the same composite key (userid, timestamp)
     */
    public long doCreateMillisecondTimeStamp() {
        return System.currentTimeMillis() * 1000 + (System.nanoTime() % 1000);
    }
}
