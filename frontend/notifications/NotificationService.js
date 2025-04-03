// NotificationService.js
/*import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import config from "../config";
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.callbacks = [];
    this.userId = null;
    this.token = null;
  }

  async init() {
    try {
      // Get authentication details like in ChatsScreen
      this.token = await AsyncStorage.getItem("token");
      this.userId = await AsyncStorage.getItem("userId");
      
      if (this.userId) {
        this.connect(this.userId);
      } else {
        console.error('No userId found for notifications');
      }
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  connect(userId) {
    const socket = new SockJS(`${config.API_BASE_URL}/ws`);
    this.stompClient = Stomp.over(socket);
    
    // If token is available, add it to the headers
    const headers = this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    
    this.stompClient.connect(headers, () => {
      console.log('WebSocket Connected');
      this.connected = true;
      
      this.stompClient.subscribe(`/user/${userId}/notifications`, notification => {
        const notificationData = JSON.parse(notification.body);
        this.callbacks.forEach(callback => callback(notificationData));
      });
    }, error => {
      console.error('WebSocket Connection Error:', error);
      // Implement reconnection logic with exponential backoff
      setTimeout(() => this.connect(userId), 5000);
    });
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.disconnect();
      this.connected = false;
    }
  }

  onNotification(callback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }
}

export default new NotificationService();*/