import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // <-- Make sure you import axios
import config from '../config'; // <-- And your config for API_BASE_URL

// Create a context for authentication
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const profileData = await AsyncStorage.getItem("profileData");
      if (profileData === "created") {
        setProfileComplete(true);
      }
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        await fetchAndSaveProfile(); // <-- Add this line!
      } else {
        setIsAuthenticated(false);
      }
    };
    checkToken();
  }, []);

  // NEW function to fetch profile and save residence
  const fetchAndSaveProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');

      if (!token || !userId) return;

      const response = await axios.get(`${config.API_BASE_URL}/api/getProfile`, {
        params: { userId: userId },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const profile = response.data;
      if (profile && profile.residence) {
        await AsyncStorage.setItem('residence', profile.residence);
      }
      if (profile && profile.fullName) {
        await AsyncStorage.setItem('fullName', profile.fullName);
      }
    } catch (error) {
      console.error('Error fetching profile for residence and/or full name:', error);
    }
  };

  // Function to handle login (store the token and set authenticated state)
  const login = async (token) => {
    await AsyncStorage.setItem("token", token);
    setIsAuthenticated(true);
    await fetchAndSaveProfile(); // <-- Fetch after successful login too!
  };

  // Function to handle logout (remove the token and update state)
  const logout = async () => {
    await AsyncStorage.multiRemove([
      "token",
      "userEmail",
      "profileData",
      "userId",
      "residence", // <-- clear residence too
      "fullName",
    ]);
    setIsAuthenticated(false);
    setProfileComplete(false);
  };

  // Function to handle authentication when setting up the profile
  const profileSetup = async () => {
    await AsyncStorage.setItem("profileData", "created");
    setProfileComplete(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, profileComplete, login, logout, profileSetup }}>
      {children}
    </AuthContext.Provider>
  );
};
