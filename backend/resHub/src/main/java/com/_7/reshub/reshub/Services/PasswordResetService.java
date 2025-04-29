package com._7.reshub.reshub.Services;

import software.amazon.awssdk.services.dynamodb.model.*;
import org.springframework.stereotype.Service;

import com._7.reshub.reshub.Configs.DynamoDbConfig;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

import java.util.Map;

@Service
public class PasswordResetService {

    private final DynamoDbClient dynamoDbClient;
    private String userTable;

    public PasswordResetService(DynamoDbClient dynamoDbClient, DynamoDbConfig dynamoDbConfig) {
        this.dynamoDbClient = dynamoDbClient;
        this.userTable = dynamoDbConfig.getUserAccountsTableName();

    }

    public Map<String, AttributeValue> getUserByEmail(String email) {
        // Query DynamoDB to find the user by email
        QueryRequest queryRequest = QueryRequest.builder()
                .tableName(userTable)
                .indexName("email-index") // Specify the GSI name
                .keyConditionExpression("email = :email")
                .expressionAttributeValues(Map.of(
                        ":email", AttributeValue.builder().s(email).build()
                ))
                .build();

        QueryResponse response = dynamoDbClient.query(queryRequest);
        if (response.items().isEmpty()) {
            return null;
        }
        return response.items().get(0);
    }

    public void savePasswordResetToken(String email, String token, long expirationTime) {
         // First, retrieve the userId using the email GSI
         Map<String, AttributeValue> user = getUserByEmail(email);
         if (user == null || !user.containsKey("userId")) {
             throw new RuntimeException("User not found for email: " + email);
         }
         String userId = user.get("userId").s();

         
        // Save the password reset token along with its expiration time for security purposes
        UpdateItemRequest updateItemRequest = UpdateItemRequest.builder()
                .tableName(userTable)
                .key(Map.of(
                    "userId", AttributeValue.builder().s(userId).build()
                ))
                .updateExpression("SET resetToken = :resetToken, resetTokenExpiration = :expirationTime")
                .expressionAttributeValues(Map.of(
                    ":resetToken", AttributeValue.builder().s(token).build(),
                    ":expirationTime", AttributeValue.builder().n(String.valueOf(expirationTime)).build()
                ))
                .build();
    
        dynamoDbClient.updateItem(updateItemRequest);
    }
    

    public Map<String, AttributeValue> getUserByResetToken(String token) {
        // Query DynamoDB to find the user by reset token
        ScanRequest scanRequest = ScanRequest.builder()
                .tableName(userTable)
                .filterExpression("resetToken = :token")
                .expressionAttributeValues(Map.of(":token", AttributeValue.builder().s(token).build()))
                .build();

        ScanResponse response = dynamoDbClient.scan(scanRequest);
        if (response.items().isEmpty()) {
            return null;
        }
        return response.items().get(0);
    }

    public void updateUserPassword(String email, String password) {
        // Retrieve userId using email
        Map<String, AttributeValue> user = getUserByEmail(email);
        if (user == null || !user.containsKey("userId")) {
            throw new RuntimeException("User not found for email: " + email);
        }
        String userId = user.get("userId").s();

        // Update the password in DynamoDB
        UpdateItemRequest updateItemRequest = UpdateItemRequest.builder()
                .tableName(userTable)
                .key(Map.of("userId", AttributeValue.builder().s(userId).build()))
                .updateExpression("set password = :password")
                .expressionAttributeValues(Map.of(":password", AttributeValue.builder().s(password).build()))
                .build();
        dynamoDbClient.updateItem(updateItemRequest);
    }

    public void clearPasswordResetToken(String email) {
        // Retrieve userId using email
        Map<String, AttributeValue> user = getUserByEmail(email);
        if (user == null || !user.containsKey("userId")) {
            throw new RuntimeException("User not found for email: " + email);
        }
        String userId = user.get("userId").s();

        // Clear the reset token after use
        UpdateItemRequest updateItemRequest = UpdateItemRequest.builder()
                .tableName(userTable)
                .key(Map.of("userId", AttributeValue.builder().s(userId).build()))
                .updateExpression("remove resetToken")
                .build();
        dynamoDbClient.updateItem(updateItemRequest);
    }
}
