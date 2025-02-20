import React, { useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import BottomTabNavigator from "./BottomTabNavigator"; 
// import HomeScreen from "../screens/HomeScreen";
import UploadProfilePic from '../screens/UploadProfilePic';
import DetailsScreen from "../screens/DetailsScreen";
import SignUpScreen from "../screens/SignUpScreen";
import LoginScreen from "../screens/LoginScreen"; // Assuming you have a LoginScreen
import ProfileSetupScreen from "../screens/ProfileSetupScreen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const { isAuthenticated } = useContext(AuthContext); // Get authentication status
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        </>
      ) : (
        <>
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="DetailsScreen" component={DetailsScreen} />
        <Stack.Screen name="UploadProfilePic" component={UploadProfilePic} />
        <Stack.Screen name="ProfileSetupScreen" component={ProfileSetupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigator;
