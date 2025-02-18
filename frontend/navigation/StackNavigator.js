import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import DetailsScreen from "../screens/DetailsScreen";
import SwipeScreen from "../screens/SwipeScreen";
import UploadProfilePic from '../UploadProfilePic';
import SignUpScreen from "../screens/SignUpScreen";
import ProfileSetupScreen from "../screens/ProfileSetupScreen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Details" component={DetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SwipeScreen" component={SwipeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="UploadProfilePic" component={UploadProfilePic} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Profile" component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
