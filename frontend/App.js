import 'react-native-url-polyfill/auto';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from "./navigation/StackNavigator";
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider> {/* Wrap with AuthProvider */}
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
