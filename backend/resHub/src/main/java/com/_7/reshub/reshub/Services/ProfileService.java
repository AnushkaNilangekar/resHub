package com._7.reshub.reshub.Services;

import com._7.reshub.reshub.Configs.DynamoDbConfig;
import com._7.reshub.reshub.Models.Profile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;

import java.util.Collections;
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
    public Profile retrieveProfile(String userId) {
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
                    item.getOrDefault("graduationYear", AttributeValue.builder().n("0").build()).n(),
                    item.getOrDefault("bio", AttributeValue.builder().s("").build()).s()
            );

            return profile;
        }

        return null;
    }
}
