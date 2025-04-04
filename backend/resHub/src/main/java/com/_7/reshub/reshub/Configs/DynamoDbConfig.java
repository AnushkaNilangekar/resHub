package com._7.reshub.reshub.Configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import software.amazon.awssdk.auth.credentials.ProfileCredentialsProvider;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

@Component
public class DynamoDbConfig {

    // dynamodb.swipe.log.table.name in application.properties
    @Value("${dynamodb.swipe.log.table.name}")
    private String swipeLogTableName;

    // dynamodb.user.table.name in application.properties
    @Value("${dynamodb.user.table.name}")
    private String usersTableName;

    // dynamodb.userA.table.name in application.properties
    @Value("${dynamodb.userA.table.name}")
    private String usersAccountsTableName;
    
    // dynamodb.user.table.name in application.properties
    @Value("${dynamodb.user.profiles.table.name}")
    private String userProfilesTableName;

    // dynamodb.chats.table.name in application.properties
    @Value("${dynamodb.chats.table.name}")
    private String chatsTableName; 

    // dynamodb.messages.table.name in application.properties
    @Value("${dynamodb.messages.table.name}")
    private String messagesTableName;

    // dynamodb.notifications.table.name in application.properties
    @Value("${dynamodb.notifications.table.name}")
    private String notificationsTableName; // New property for notifications table

    public String getSwipeLogTableName() {
        return swipeLogTableName;
    }

    public String getUsersTableName() {
        return usersTableName;
    }

    public String getUserAccountsTableName() {
        return usersAccountsTableName;
    }

    public String getUserProfilesTableName() {
        return userProfilesTableName;
    }

    public String getChatsTableName() {
        return chatsTableName;  // New getter for chats table
    }

    public String getMessagesTableName() {
        return messagesTableName;  // New getter for chats table
    }

    public String getNotificationsTableName() {
        return notificationsTableName;  // New getter for notifications table
    }


    /*
     * Creates the DynamoDB client using the credentials stored in your system.
     */
    @Bean
    public DynamoDbClient dynamoDbClient() {
        return DynamoDbClient.builder()
                .httpClientBuilder(UrlConnectionHttpClient.builder())
                .credentialsProvider(ProfileCredentialsProvider.create())
                .build();
    }
}
