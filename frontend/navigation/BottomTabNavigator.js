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
          
          // Reduce icon size
          const iconSize = size * 0.8;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chats') {
            iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }
          
          return <Ionicons name={iconName} size={iconSize} color={color} />;
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
          tabBarBadge: null, 
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
    // Reduced height
    height: Platform.OS === 'ios' ? 70 : 55,
    paddingBottom: Platform.OS === 'ios' ? 20 : 5,
    paddingTop: 5,
    backgroundColor: 'transparent',
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 15, 
    borderTopRightRadius: 15,
    overflow: 'hidden',
    elevation: 8, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 4, 
  },
  tabBarGradient: {
    flex: 1,
    borderTopLeftRadius: 15, 
    borderTopRightRadius: 15, 
  },
  tabBarLabel: {
    fontWeight: '500', 
    fontSize: 10, 
    marginBottom: Platform.OS === 'ios' ? 0 : -2, ion
  },
  tabBarItem: {
    paddingTop: 3,
    height: Platform.OS === 'ios' ? 45 : 40, 
  }
});

export default BottomTabNavigator;