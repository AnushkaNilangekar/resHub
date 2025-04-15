package com._7.reshub.reshub.Services;

import com._7.reshub.reshub.Configs.DynamoDbConfig;
import com._7.reshub.reshub.Models.Profile;
import com._7.reshub.reshub.Models.Report;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import software.amazon.awssdk.services.dynamodb.model.AttributeValue;
import software.amazon.awssdk.services.dynamodb.model.GetItemRequest;
import software.amazon.awssdk.services.dynamodb.model.GetItemResponse;
import software.amazon.awssdk.services.dynamodb.model.PutItemRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanRequest;
import software.amazon.awssdk.services.dynamodb.model.ScanResponse;
import software.amazon.awssdk.services.dynamodb.model.UpdateItemRequest;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private DynamoDbConfig dynamoDbConfig;

    @Autowired
    private DynamoDbClient dynamoDbClient;
    
    @Autowired
    private ProfileService profileService;
    
    @Autowired
    private JavaMailSender emailSender;
    
    private final String resHubEmail = "ResHub2025@gmail.com";

    public Report createReport(Report report) {
        // Check if this user has already reported this message
        if (hasUserAlreadyReportedMessage(report.getReporterId(), report.getChatId(), report.getMessageTimestamp())) {
            throw new IllegalStateException("You have already reported this message");
        }
        
        // Set any missing fields
        if (report.getReportId() == null) {
            report.setReportId(java.util.UUID.randomUUID().toString());
        }
        
        if (report.getReportTimestamp() == null) {
            report.setReportTimestamp(Instant.now().toString());
        }
        
        report.setResolved(false);
        
        // Convert Report object to DynamoDB attribute map
        Map<String, AttributeValue> item = convertReportToDynamoItem(report);
        
        // Put the item in DynamoDB
        PutItemRequest putItemRequest = PutItemRequest.builder()
            .tableName(dynamoDbConfig.getReportsTableName())
            .item(item)
            .build();
            
        dynamoDbClient.putItem(putItemRequest);
        
        // Send emails
        sendUserConfirmationEmail(report);
        sendAdminNotificationEmail(report);
        
        return report;
    }
    
    public boolean hasUserAlreadyReportedMessage(String reporterId, String chatId, String messageTimestamp) {
        Map<String, String> expressionAttributeNames = new HashMap<>();
        expressionAttributeNames.put("#reporterId", "reporterId");
        expressionAttributeNames.put("#chatId", "chatId");
        expressionAttributeNames.put("#messageTimestamp", "messageTimestamp");
        
        Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
        expressionAttributeValues.put(":reporterId", AttributeValue.builder().s(reporterId).build());
        expressionAttributeValues.put(":chatId", AttributeValue.builder().s(chatId).build());
        expressionAttributeValues.put(":messageTimestamp", AttributeValue.builder().s(messageTimestamp).build());
        
        ScanRequest scanRequest = ScanRequest.builder()
            .tableName(dynamoDbConfig.getReportsTableName())
            .filterExpression("#reporterId = :reporterId AND #chatId = :chatId AND #messageTimestamp = :messageTimestamp")
            .expressionAttributeNames(expressionAttributeNames)
            .expressionAttributeValues(expressionAttributeValues)
            .build();
        
        ScanResponse scanResponse = dynamoDbClient.scan(scanRequest);
        return !scanResponse.items().isEmpty();
    }
    
    public List<Report> getAllReports() {
        ScanRequest scanRequest = ScanRequest.builder()
            .tableName(dynamoDbConfig.getReportsTableName())
            .build();
            
        ScanResponse scanResponse = dynamoDbClient.scan(scanRequest);
        
        return scanResponse.items().stream()
            .map(this::convertDynamoItemToReport)
            .collect(Collectors.toList());
    }
    
    public Report getReportById(String reportId) {
        Map<String, AttributeValue> key = Map.of("reportId", AttributeValue.builder().s(reportId).build());
        
        GetItemRequest getItemRequest = GetItemRequest.builder()
            .tableName(dynamoDbConfig.getReportsTableName())
            .key(key)
            .build();
            
        GetItemResponse response = dynamoDbClient.getItem(getItemRequest);
        
        if (response.hasItem()) {
            return convertDynamoItemToReport(response.item());
        }
        
        return null;
    }
    
    public List<Report> getReportsByReporter(String reporterId) {
        Map<String, String> expressionAttributeNames = new HashMap<>();
        expressionAttributeNames.put("#reporterId", "reporterId");
        
        Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
        expressionAttributeValues.put(":reporterId", AttributeValue.builder().s(reporterId).build());
        
        ScanRequest scanRequest = ScanRequest.builder()
            .tableName(dynamoDbConfig.getReportsTableName())
            .filterExpression("#reporterId = :reporterId")
            .expressionAttributeNames(expressionAttributeNames)
            .expressionAttributeValues(expressionAttributeValues)
            .build();
            
        ScanResponse scanResponse = dynamoDbClient.scan(scanRequest);
        
        return scanResponse.items().stream()
            .map(this::convertDynamoItemToReport)
            .collect(Collectors.toList());
    }
    
    public List<Report> getReportsByReportedUser(String reportedUserId) {
        Map<String, String> expressionAttributeNames = new HashMap<>();
        expressionAttributeNames.put("#reportedUserId", "reportedUserId");
        
        Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
        expressionAttributeValues.put(":reportedUserId", AttributeValue.builder().s(reportedUserId).build());
        
        ScanRequest scanRequest = ScanRequest.builder()
            .tableName(dynamoDbConfig.getReportsTableName())
            .filterExpression("#reportedUserId = :reportedUserId")
            .expressionAttributeNames(expressionAttributeNames)
            .expressionAttributeValues(expressionAttributeValues)
            .build();
            
        ScanResponse scanResponse = dynamoDbClient.scan(scanRequest);
        
        return scanResponse.items().stream()
            .map(this::convertDynamoItemToReport)
            .collect(Collectors.toList());
    }
    
    public Report resolveReport(String reportId, String resolutionNotes) {
        Report report = getReportById(reportId);
        if (report != null) {
            report.setResolved(true);
            report.setResolutionNotes(resolutionNotes);
            report.setResolutionTimestamp(Instant.now().toString());
            
            Map<String, AttributeValue> key = Map.of("reportId", AttributeValue.builder().s(reportId).build());
            
            Map<String, AttributeValue> expressionAttributeValues = new HashMap<>();
            expressionAttributeValues.put(":resolved", AttributeValue.builder().bool(true).build());
            expressionAttributeValues.put(":notes", AttributeValue.builder().s(resolutionNotes).build());
            expressionAttributeValues.put(":timestamp", AttributeValue.builder().s(report.getResolutionTimestamp()).build());
            
            UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                .tableName(dynamoDbConfig.getReportsTableName())
                .key(key)
                .updateExpression("SET resolved = :resolved, resolutionNotes = :notes, resolutionTimestamp = :timestamp")
                .expressionAttributeValues(expressionAttributeValues)
                .build();
                
            dynamoDbClient.updateItem(updateRequest);
        }
        return report;
    }
    
    private Map<String, AttributeValue> convertReportToDynamoItem(Report report) {
        Map<String, AttributeValue> item = new HashMap<>();
        
        item.put("reportId", AttributeValue.builder().s(report.getReportId()).build());
        item.put("reporterId", AttributeValue.builder().s(report.getReporterId()).build());
        item.put("reportedUserId", AttributeValue.builder().s(report.getReportedUserId()).build());
        item.put("chatId", AttributeValue.builder().s(report.getChatId()).build());
        item.put("reason", AttributeValue.builder().s(report.getReason()).build());
        item.put("reportTimestamp", AttributeValue.builder().s(report.getReportTimestamp()).build());
        item.put("resolved", AttributeValue.builder().bool(report.isResolved()).build());
        
        if (report.getAdditionalInfo() != null) {
            item.put("additionalInfo", AttributeValue.builder().s(report.getAdditionalInfo()).build());
        }
        
        if (report.getMessageContent() != null) {
            item.put("messageContent", AttributeValue.builder().s(report.getMessageContent()).build());
        }
        
        if (report.getMessageTimestamp() != null) {
            item.put("messageTimestamp", AttributeValue.builder().s(report.getMessageTimestamp()).build());
        }
        
        if (report.getResolutionNotes() != null) {
            item.put("resolutionNotes", AttributeValue.builder().s(report.getResolutionNotes()).build());
        }
        
        if (report.getResolutionTimestamp() != null) {
            item.put("resolutionTimestamp", AttributeValue.builder().s(report.getResolutionTimestamp()).build());
        }
        
        return item;
    }
    
    private Report convertDynamoItemToReport(Map<String, AttributeValue> item) {
        Report report = new Report();
        
        report.setReportId(item.getOrDefault("reportId", AttributeValue.builder().s("").build()).s());
        report.setReporterId(item.getOrDefault("reporterId", AttributeValue.builder().s("").build()).s());
        report.setReportedUserId(item.getOrDefault("reportedUserId", AttributeValue.builder().s("").build()).s());
        report.setChatId(item.getOrDefault("chatId", AttributeValue.builder().s("").build()).s());
        report.setReason(item.getOrDefault("reason", AttributeValue.builder().s("").build()).s());
        report.setReportTimestamp(item.getOrDefault("reportTimestamp", AttributeValue.builder().s("").build()).s());
        
        // Handle optional fields
        if (item.containsKey("additionalInfo")) {
            report.setAdditionalInfo(item.get("additionalInfo").s());
        }
        
        if (item.containsKey("messageContent")) {
            report.setMessageContent(item.get("messageContent").s());
        }
        
        if (item.containsKey("messageTimestamp")) {
            report.setMessageTimestamp(item.get("messageTimestamp").s());
        }
        
        if (item.containsKey("resolved")) {
            report.setResolved(item.get("resolved").bool());
        }
        
        if (item.containsKey("resolutionNotes")) {
            report.setResolutionNotes(item.get("resolutionNotes").s());
        }
        
        if (item.containsKey("resolutionTimestamp")) {
            report.setResolutionTimestamp(item.get("resolutionTimestamp").s());
        }
        
        return report;
    }
    
    private void sendUserConfirmationEmail(Report report) {
        try {
            Profile reporter = profileService.doGetProfile(report.getReporterId());
            if (reporter != null && reporter.getEmail() != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(resHubEmail);
                message.setTo(reporter.getEmail());
                message.setSubject("Your ResHub Report Confirmation");
                message.setText(
                    "Hello " + reporter.getFullName() + ",\n\n" +
                    "Thank you for submitting a report. Your input helps us maintain a safe and respectful community.\n\n" +
                    "Report Details:\n" +
                    "- Report ID: " + report.getReportId() + "\n" +
                    "- Report Type: " + formatReasonLabel(report.getReason()) + "\n" +
                    "- Submitted: " + report.getReportTimestamp() + "\n\n" +
                    "Our team will review your report and take appropriate action as needed. If we need additional information, " +
                    "we'll contact you via email.\n\n" +
                    "Thank you for helping make ResHub a better place for everyone.\n\n" +
                    "Best regards,\n" +
                    "The ResHub Team"
                );
                emailSender.send(message);
            }
        } catch (Exception e) {
            // Log the error but don't stop report creation if email fails
            System.err.println("Failed to send confirmation email: " + e.getMessage());
        }
    }
    
    private void sendAdminNotificationEmail(Report report) {
        try {
            Profile reporter = profileService.doGetProfile(report.getReporterId());
            Profile reportedUser = profileService.doGetProfile(report.getReportedUserId());
            
            String reporterName = (reporter != null) ? reporter.getFullName() : "Unknown";
            String reportedUserName = (reportedUser != null) ? reportedUser.getFullName() : "Unknown";
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(resHubEmail);
            message.setTo(resHubEmail);  // Sending to the ResHub support team
            message.setSubject("New Chat Report Submitted: " + report.getReportId());
            message.setText(
                "A new chat report has been submitted:\n\n" +
                "Report Details:\n" +
                "- Report ID: " + report.getReportId() + "\n" +
                "- Reporter: " + reporterName + " (ID: " + report.getReporterId() + ")\n" +
                "- Reported User: " + reportedUserName + " (ID: " + report.getReportedUserId() + ")\n" +
                "- Chat ID: " + report.getChatId() + "\n" +
                "- Reason: " + formatReasonLabel(report.getReason()) + "\n" +
                "- Time: " + report.getReportTimestamp() + "\n\n" +
                "Additional Information:\n" + 
                (report.getAdditionalInfo() != null && !report.getAdditionalInfo().isEmpty() 
                    ? report.getAdditionalInfo()
                    : "None provided") + "\n\n" +
                "Message Content:\n" +
                (report.getMessageContent() != null && !report.getMessageContent().isEmpty()
                    ? report.getMessageContent()
                    : "No specific message was reported") + "\n\n" +
                "Please review this report and take appropriate action.\n\n" +
                "This is an automated message."
            );
            emailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send admin notification email: " + e.getMessage());
        }
    }
    
    private String formatReasonLabel(String reasonCode) {
        switch (reasonCode) {
            case "inappropriate":
                return "Inappropriate Content";
            case "harassment":
                return "Harassment or Bullying";
            case "spam":
                return "Spam";
            case "scam":
                return "Scam or Fraud";
            case "impersonation":
                return "Impersonation";
            case "other":
                return "Other";
            default:
                return reasonCode;
        }
    }
}