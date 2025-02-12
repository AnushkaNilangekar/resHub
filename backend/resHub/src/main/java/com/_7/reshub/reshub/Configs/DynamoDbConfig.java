package com._7.reshub.reshub.Configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class DynamoDbConfig {

    // dynamodb.swipe.log.table.name in application.properties
    @Value("${dynamodb.swipe.log.table.name}")
    private String swipeLogTableName;

    public String getSwipeLogTableName() {
        return swipeLogTableName;
    }
}
