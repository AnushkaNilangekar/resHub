import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import DetailsScreen from "../screens/DetailsScreen";
import UploadProfilePic from '../UploadProfilePic';
import SignUpScreen from "../screens/SignUpScreen";
import ProfileSetupScreen from "../screens/ProfileSetupScreen";
import MatchesTabNavigator from "../screens/MatchesScreen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
      <Stack.Screen name="UploadProfilePic" component={UploadProfilePic} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Profile" component={ProfileSetupScreen} />
      <Stack.Screen name="MatchesAndConversations" component={MatchesTabNavigator}
        options={{
          headerTitle: "Matches",
        }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
