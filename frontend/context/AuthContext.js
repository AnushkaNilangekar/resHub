import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a context for authentication
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      if (await AsyncStorage.getItem("profileData") === "created") {
        setProfileComplete(true);
      }
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };
    checkToken();
  }, []);

  // Function to handle login (store the token and set authenticated state)
  const login = async (token) => {
    await AsyncStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  // Function to handle logout (remove the token and update state)
  const logout = async () => {
  await AsyncStorage.multiRemove([
      "token",
      "userEmail",
      "profileData",
      "userId" 
    ]);
    setIsAuthenticated(false);
    setProfileComplete(false);
  };

  // Function to handle authentication when setting up the profile
  const profileSetup = async () => {
    await AsyncStorage.setItem("profileData", "created");
    setProfileComplete(true);
  }


  return (
    <AuthContext.Provider value={{ isAuthenticated, profileComplete, login, logout, profileSetup }}>
      {children}
    </AuthContext.Provider>
  );
};
