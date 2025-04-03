// NotificationService.java
/*package com._7.reshub.reshub.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendNotification(String userId, Map<String, Object> notification) {
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, notification);
    }
}*/

/*package com._7.reshub.reshub.Services;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    public void setMessagingTemplate(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }
    
    public void notifyNewMessage(String userId, String senderId, String senderName, String messagePreview) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "MESSAGE");
        notification.put("senderId", senderId);
        notification.put("senderName", senderName);
        notification.put("content", messagePreview);
        notification.put("timestamp", System.currentTimeMillis());
        
        messagingTemplate.convertAndSendToUser(
            userId, 
            "/notifications", 
            notification
        );
    }
    
    public void notifyNewMatch(String userId, String matchedUserId, String matchedUserName) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "MATCH");
        notification.put("senderId", matchedUserId);
        notification.put("senderName", matchedUserName);
        notification.put("content", "New match with " + matchedUserName);
        notification.put("timestamp", System.currentTimeMillis());
        
        messagingTemplate.convertAndSendToUser(
            userId, 
            "/notifications", 
            notification
        );
    }
}*/