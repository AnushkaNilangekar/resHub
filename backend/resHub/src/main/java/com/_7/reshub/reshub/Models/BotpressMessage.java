package com._7.reshub.reshub.Models;

import java.time.Instant;
import java.time.format.DateTimeParseException;

public class BotpressMessage {
    private final String id;
    private final String createdAt;
    private final String conversationId;
    private final String userId;
    private final Payload payload;

    public BotpressMessage(String id, String createdAt, String conversationId, 
                         String userId, Payload payload) {
        this.id = id;
        this.createdAt = createdAt;
        this.conversationId = conversationId;
        this.userId = userId;
        this.payload = payload;
    }

    public String getId() { return id; }
    public String getCreatedAt() { return createdAt; }
    public String getConversationId() { return conversationId; }
    public String getUserId() { return userId; }
    public Payload getPayload() { return payload; }

    public Instant getCreatedAtInstant() {
        try {
            return Instant.parse(createdAt);
        } catch (DateTimeParseException e) {
            return Instant.MIN;
        }
    }

    public static class Payload {
        private final String type;
        private final String text;

        public Payload(String type, String text) {
            this.type = type;
            this.text = text;
        }

        public String getType() { return type; }
        public String getText() { return text; }
    }
}
