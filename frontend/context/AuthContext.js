import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a context for authentication
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
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
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
