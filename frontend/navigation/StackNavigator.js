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


const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const { isAuthenticated } = useContext(AuthContext); // Get authentication status
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPassword} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="ProfileSetupScreen" component={ProfileSetupScreen} />
          <Stack.Screen name="SwipeScreen" component={SwipeScreen} />
          <Stack.Screen name="MessageScreen" component={MessageScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;
