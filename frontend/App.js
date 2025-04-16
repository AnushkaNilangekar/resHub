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
  const [notifVolume, setNotifVolume] = useState(1);
  const [matchSoundEnabled, setMatchSoundEnabled] = useState(true);
  const [messageSoundEnabled, setMessageSoundEnabled] = useState(true);
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

  const intervalRef = useRef(null);

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
    const fetchNotification = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
          const userId = await AsyncStorage.getItem('userId');
          if (!userId) return;

          try {
            const profileRes = await axios.get(`${config.API_BASE_URL}/api/getProfile`, {
              params: { userId },
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const volume = profileRes.data.notifVolume ?? 1;
            const matchEnabled = profileRes.data.matchSoundEnabled ?? true;
            const messageEnabled = profileRes.data.messageSoundEnabled ?? true;

            setNotifVolume(volume);
            setMatchSoundEnabled(matchEnabled);
            setMessageSoundEnabled(messageEnabled);
          } catch (err) {
            console.error('Failed to fetch match volume:', err);
          }

          const response =  await axios.post(
            `${config.API_BASE_URL}/api/users/notification`,
            { userId },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          if (response.data) {
              setNotification(response.data); // Show most recent unread notification
          } else {
              setNotification(null); // Clear it if there's nothing
          }
      } catch (error) {
          console.error('Error fetching notification:', error);
      }
  };

  // Initial call
  fetchNotification();
  const POLL_INTERVAL = 5000;

  // Start polling
  intervalRef.current = setInterval(fetchNotification, POLL_INTERVAL);

    return () => {
      subscription.remove();
      clearInterval(intervalRef.current);
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
                notifVolume={notifVolume}
                matchSoundEnabled={matchSoundEnabled}
                messageSoundEnabled={messageSoundEnabled}
            />
        )}
      </NavigationContainer>
    </AuthProvider>
  );
}