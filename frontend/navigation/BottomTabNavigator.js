import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SwipeScreen from "../screens/SwipeScreen";
import AccountScreen from '../screens/AccountScreen';
import ChatScreen from '../screens/ChatScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chats') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <LinearGradient
              colors={['#7B4A9E', '#9D67C1']}
              style={styles.tabBarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        ),
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        tabBarItemStyle: styles.tabBarItem,
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen
        name="Home"
        component={SwipeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chats',
          tabBarBadge: null, // Set to a number for notification count
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 10,
    backgroundColor: 'transparent',
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  tabBarGradient: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabBarLabel: {
    fontWeight: '600',
    fontSize: 12,
  },
  tabBarItem: {
    paddingTop: 5,
  }
});

export default BottomTabNavigator;