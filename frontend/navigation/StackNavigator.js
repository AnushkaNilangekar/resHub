import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import BottomTabNavigator from "./BottomTabNavigator";
import SignUpScreen from "../screens/SignUpScreen";
import LoginScreen from "../screens/LoginScreen";
import ProfileSetupScreen from "../screens/ProfileSetupScreen";
import ForgotPassword from "../screens/ForgotPasswordScreen";
import ResetPassword from "../screens/ResetPassword";
import SwipeScreen from "../screens/SwipeScreen";
import MessageScreen from "../screens/MessageScreen";
import ReportScreen from "../screens/ReportScreen";
import SettingsScreen from  "../screens/SettingsScreen";
import SplashScreen from  "../screens/SplashScreen";
import ChatScreen from "../screens/ChatScreen";
import BlockedReportedScreen from "../screens/BlockedReportedScreen";


const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const { isAuthenticated, profileComplete } = useContext(AuthContext); // Get authentication status
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="SplashScreen" component={SplashScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPassword} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
        </>
      ) : profileComplete ? (
        <>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="SwipeScreen" component={SwipeScreen} />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{
              title: 'Profile Settings',
              headerBackTitle: 'Back'
            }}
          />
          <Stack.Screen
            name="MessageScreen"
            component={MessageScreen}
            options={{ headerShown: true }}  
            />
            <Stack.Screen name="ReportScreen" component={ReportScreen} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="BlockedReported" component={BlockedReportedScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="ProfileSetupScreen" component={ProfileSetupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;