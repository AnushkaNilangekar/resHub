package com._7.reshub.reshub.Services;

import com._7.reshub.reshub.Configs.DynamoDbConfig;
import com._7.reshub.reshub.Models.Profile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProfileService {

    @Autowired
    private DynamoDbConfig dynamoDbConfig;

    @Autowired
    private DynamoDbClient dynamoDbClient;

    /*
     * Handles retrieving information for the given user id and returns a Profile object
     */
    public Profile doGetProfile(String userId) {
        Map<String, AttributeValue> key = Map.of("email", AttributeValue.builder().s(userId).build());

        GetItemRequest getItemRequest = GetItemRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .key(key)
                .build();

        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);

        if (response.hasItem()) {
            Map<String, AttributeValue> item = response.item();

            Profile profile = new Profile(
                    item.getOrDefault("fullName", AttributeValue.builder().s("").build()).s(),
                    item.getOrDefault("gender", AttributeValue.builder().s("").build()).s(),
                    item.getOrDefault("major", AttributeValue.builder().s("").build()).s(),
                    item.getOrDefault("minor", AttributeValue.builder().s("").build()).s(),
                    Integer.parseInt(item.getOrDefault("age", AttributeValue.builder().n("0").build()).n()),
                    item.getOrDefault("residence", AttributeValue.builder().s("").build()).s(),
                    item.getOrDefault("hobbies", AttributeValue.builder().l(Collections.emptyList()).build()).l()
                            .stream().map(AttributeValue::s).collect(Collectors.toList()),
                    item.getOrDefault("graduationYear", AttributeValue.builder().s("").build()).s(),
                    item.getOrDefault("bio", AttributeValue.builder().s("").build()).s(),
                    item.getOrDefault("profilePicUrl", AttributeValue.builder().s("").build()).s()
            );

            return profile;
        }

        return null;
    }

    public List<Map<String, Object>> doGetProfiles(String userId, String genderFilter) {
        ScanRequest scanRequest = ScanRequest.builder()
                .tableName(dynamoDbConfig.getUserProfilesTableName())
                .build();
        ScanResponse scanResponse = dynamoDbClient.scan(scanRequest);
        return scanResponse.items().stream()
                .filter(item -> !item.get("email").s().equals(userId)) // Exclude logged-in user
                .filter(item -> "All".equalsIgnoreCase(genderFilter) || 
                        (item.containsKey("gender") && item.get("gender").s().equalsIgnoreCase(genderFilter)))
                .map(this::convertDynamoItemToMap) // Convert AttributeValue Map to a normal Map
                .collect(Collectors.toList());
    }

    /**
     * Converts DynamoDB's AttributeValue Map to a standard Java Map
     */
    private Map<String, Object> convertDynamoItemToMap(Map<String, AttributeValue> item) {
        Map<String, Object> converted = new HashMap<>();
        item.forEach((key, value) -> {
            if (value.s() != null) converted.put(key, value.s());
            else if (value.n() != null) converted.put(key, Integer.parseInt(value.n()));
            else if (value.l() != null) converted.put(key, value.l().stream().map(AttributeValue::s).collect(Collectors.toList()));
            else converted.put(key, null); // Handle other cases as needed
        });
        return converted;
    }


}
