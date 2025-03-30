import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from "./navigation/StackNavigator";
import { AuthProvider } from './context/AuthContext';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from "./config";
import * as SplashScreen from 'expo-splash-screen';

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

  if (!appIsReady) {
    return null;
  }

  return (
    <AuthProvider> {/* Wrap with AuthProvider */}
      <NavigationContainer linking={linking}>
        <StackNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}