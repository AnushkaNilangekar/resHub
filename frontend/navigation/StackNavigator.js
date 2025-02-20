import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import HomeScreen from "../screens/HomeScreen";
import SwipeScreen from "../screens/SwipeScreen";
import UploadProfilePic from '../UploadProfilePic';
import DetailsScreen from "../screens/DetailsScreen";
import SignUpScreen from "../screens/SignUpScreen";
import LoginScreen from "../screens/LoginScreen"; // Assuming you have a LoginScreen
import ProfileSetupScreen from "../screens/ProfileSetupScreen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const { isAuthenticated } = useContext(AuthContext); // Get authentication status
  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      ) : (
        <>
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Details" component={DetailsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SwipeScreen" component={SwipeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UploadProfilePic" component={UploadProfilePic} />
        <Stack.Screen name="Profile" component={ProfileSetupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;
