import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from "./navigation/StackNavigator";
import { AuthProvider } from './context/AuthContext';
import config from "./config";

export default function App() {
  // Deep linking configuration
  const linking = {
    prefixes: [config.API_BASE_URL],
    config: {
      screens: {
        ResetPassword: 'reset-password',
      },
    },
  };

  return (
    <AuthProvider> {/* Wrap with AuthProvider */}
      <NavigationContainer linking={linking}>
        <StackNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}