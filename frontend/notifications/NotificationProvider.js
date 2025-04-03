// NotificationProvider.js
/*import React, { useState, useEffect, createContext, useContext } from 'react';
import NotificationService from './NotificationService';
import NotificationBanner from './NotificationBanner';
import { View } from 'react-native';
import { useAuth } from '../context/AuthContext'; // Assuming you have auth context

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [currentNotification, setCurrentNotification] = useState(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    // Connect to WebSocket for real-time notifications
    NotificationService.connect(user.id);
    
    // Subscribe to notifications
    const unsubscribe = NotificationService.onNotification(notification => {
      setCurrentNotification(notification);
    });
    
    return () => {
      unsubscribe();
      NotificationService.disconnect();
    };
  }, [user]);
  
  const dismissNotification = () => {
    setCurrentNotification(null);
  };
  
  return (
    <NotificationContext.Provider value={{}}>
      <View style={{ flex: 1 }}>
        {children}
        {currentNotification && (
          <NotificationBanner
            notification={currentNotification}
            onDismiss={dismissNotification}
          />
        )}
      </View>
    </NotificationContext.Provider>
  );
};*/