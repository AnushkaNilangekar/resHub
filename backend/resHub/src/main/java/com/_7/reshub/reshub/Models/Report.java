package com._7.reshub.reshub.Models;

import java.time.Instant;
import java.util.UUID;

public class Report {
    private String reportId;
    private String reporterId;
    private String reportedUserId;
    private String reportedUserName;
    private String chatId;
    private String reason;
    private String additionalInfo;
    private String messageTimestamp;
    private String reportTimestamp;
    private boolean resolved;
    private String resolutionNotes;
    private String resolutionTimestamp;

    public Report() {
        this.reportId = UUID.randomUUID().toString();
        this.reportTimestamp = Instant.now().toString();
        this.resolved = false;
    }

    // Constructor with all fields
    public Report(String reportId, String reporterId, String reportedUserId, String chatId, 
                  String reason, String additionalInfo, String messageTimestamp, String reportTimestamp, 
                  boolean resolved, String resolutionNotes, String resolutionTimestamp) {
        this.reportId = reportId;
        this.reporterId = reporterId;
        this.reportedUserId = reportedUserId;
        this.chatId = chatId;
        this.reason = reason;
        this.additionalInfo = additionalInfo;
        this.messageTimestamp = messageTimestamp;
        this.reportTimestamp = reportTimestamp;
        this.resolved = resolved;
        this.resolutionNotes = resolutionNotes;
        this.resolutionTimestamp = resolutionTimestamp;
    }

    // Getters and setters
    public String getReportId() {
        return reportId;
    }

    public void setReportId(String reportId) {
        this.reportId = reportId;
    }

    public String getReporterId() {
        return reporterId;
    }

    public void setReporterId(String reporterId) {
        this.reporterId = reporterId;
    }

    public String getReportedUserId() {
        return reportedUserId;
    }

    public void setReportedUserId(String reportedUserId) {
        this.reportedUserId = reportedUserId;
    }

    public String getReportedUserName() {
        return reportedUserName;
    }
    
    public void setReportedUserName(String reportedUserName) {
        this.reportedUserName = reportedUserName;
    }

    public String getChatId() {
        return chatId;
    }

    public void setChatId(String chatId) {
        this.chatId = chatId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(String additionalInfo) {
        this.additionalInfo = additionalInfo;
    }

    public String getMessageTimestamp() {
        return messageTimestamp;
    }

    public void setMessageTimestamp(String messageTimestamp) {
        this.messageTimestamp = messageTimestamp;
    }

    public String getReportTimestamp() {
        return reportTimestamp;
    }

    public void setReportTimestamp(String reportTimestamp) {
        this.reportTimestamp = reportTimestamp;
    }

    public boolean isResolved() {
        return resolved;
    }

    public void setResolved(boolean resolved) {
        this.resolved = resolved;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public String getResolutionTimestamp() {
        return resolutionTimestamp;
    }

    public void setResolutionTimestamp(String resolutionTimestamp) {
        this.resolutionTimestamp = resolutionTimestamp;
    }

    @Override
    public String toString() {
        return "Report{" +
                "reportId='" + reportId + '\'' +
                ", reporterId='" + reporterId + '\'' +
                ", reportedUserId='" + reportedUserId + '\'' +
                ", chatId='" + chatId + '\'' +
                ", reason='" + reason + '\'' +
                ", reportTimestamp='" + reportTimestamp + '\'' +
                ", resolved=" + resolved +
                '}';
    }
}