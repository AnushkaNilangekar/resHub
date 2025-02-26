import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import SwipeScreen from "../screens/SwipeScreen";
import SwipeScreen from '../screens/SwipeScreen';
import AccountScreen from '../screens/AccountScreen';
import MatchesChatTabNavigator from "./MatchesChatTabNavigator";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Matches') {
            iconName = 'chatbubble';
          } else if (route.name === 'Account') {
            iconName = 'person';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Home"
        component={SwipeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesChatTabNavigator}
        options={{ headerShown: true }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ headerShown: true }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator; // Ensure only ONE export default