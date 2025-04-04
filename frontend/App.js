import 'react-native-url-polyfill/auto';
import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from "./navigation/StackNavigator";
import { AuthProvider } from './context/AuthContext';
import { AppState, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from "./config";
import * as SplashScreen from 'expo-splash-screen';
import * as Stomp from '@stomp/stompjs';
import NotificationBanner from './notifications/NotificationBanner';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  // Deep linking configuration
  const linking = {
    prefixes: [config.API_BASE_URL],
    config: {
      screens: {
        ResetPassword: 'reset-password',
      },
    },
  };
  const [notification, setNotification] = useState(null); // State for notification
  const client = useRef(null); // Ref for WebSocket client

  useEffect(() => {
    // Prepare the app
    async function prepareApp() {
      try {
        // Perform any initialization tasks here if needed
        // For example: load fonts, initialize libraries, etc.

        // Short delay to ensure the native splash screen shows properly in Expo Go
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepareApp();
  }, []);

  useEffect(() => {
    // Hide the native splash screen once we're ready to show our custom one
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);


  useEffect(() => {
    //Update lastTimeActive when they return to app after it being suspended in background/inactive
    const updateLastTimeActive = async () => {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("token");
    
      try {
        await axios.post(`${config.API_BASE_URL}/api/users/updateLastTimeActive?userId=${userId}`, null, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
      } catch (error) {
        console.error('Failed to update activity status:', error);
      }
    };

    //Update lastTimeActive when app loads
    updateLastTimeActive();

    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active')
      {
        updateLastTimeActive();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const connectWebSocket = async () => {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
            client.current = new Stomp.Client({
                brokerURL: `${config.API_BASE_URL.replace('http', 'ws')}/ws`,
                onConnect: () => {
                    client.current.subscribe(`/topic/notifications/${userId}`, (message) => {
                        const notificationData = JSON.parse(message.body);
                        setNotification(notificationData);
                    });
                },
                onStompError: (frame) => {
                    console.error('Broker reported error: ' + frame.headers['message']);
                    console.error('Additional details: ' + frame.body);
                },
            });

            client.current.activate();
        }
    };

    connectWebSocket();

    return () => {
        if (client.current && client.current.active) {
            client.current.deactivate();
        }
    };
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <AuthProvider> {/* Wrap with AuthProvider */}
      <NavigationContainer linking={linking}>
        <StackNavigator />
        {notification && (
            <NotificationBanner
                message={notification.message}
                visible={!!notification}
                onClose={() => setNotification(null)}
            />
        )}
      </NavigationContainer>
    </AuthProvider>
  );
}