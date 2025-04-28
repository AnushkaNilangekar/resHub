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
import SettingsScreen from  "../screens/SettingsScreen";
import SplashScreen from  "../screens/SplashScreen";
import CreateGroupScreen from "../screens/CreateGroupScreen";
import NameGroupScreen from "../screens/NameGroupScreen";
import GroupParticipantsScreen from "../screens/GroupParticipantsScreen";
import ProfileScreen from "../screens/ProfileScreen";
// // import MatchesScreen from "../screens/MatchesScreen";
// import ChatScreen from "../screens/ChatScreen";


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
          <Stack.Screen name="GroupParticipantsScreen" component={GroupParticipantsScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          {/* <Stack.Screen name="ChatScreen" component={ChatScreen} /> */}
          {/* <Stack.Screen name="MatchesScreen" component={MatchesScreen} /> */}
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
          <Stack.Screen
            name="CreateGroupScreen"
            component={CreateGroupScreen}
            // options={{ headerShown: true }}
          />
          <Stack.Screen
            name="NameGroupScreen"
            component={NameGroupScreen}
            // options={{ headerShown: true }}
          />
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