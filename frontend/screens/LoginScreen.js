import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import config from "../config";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useNavigation } from '@react-navigation/native';



const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { isAuthenticated, login } = useContext(AuthContext);  // Use context to get authentication state and login function
  const navigation = useNavigation();

  useEffect(() => {
    // If the user is already authenticated, navigate to the home screen
    if (isAuthenticated) {
      navigation.replace('Main');
    }
  }, [isAuthenticated, navigation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
        await AsyncStorage.multiRemove(["token", "userEmail", "profileData"]);
        const requestData = { email, password };
  
        const response = await axios.post(`${config.API_BASE_URL}/api/login`, requestData);
  
        if (response.status === 200) {
            await AsyncStorage.setItem("token", response.data.token);
            await AsyncStorage.setItem("email", email); 
            await AsyncStorage.setItem("userEmail", email);
            await login(response.data.token);
            Alert.alert("Success", "Login successful!", [{ text: "OK" }]);
          } else {
            setError("Login failed");
            Alert.alert("Error", "Login failed. Please try again.", [{ text: "OK" }]);
          }
      } catch (error) {
        setError("Login Failed. Please try again.")     
        Alert.alert("Error", "Login failed. Please try again.", [{ text: "OK" }]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      {error ? <Text style={styles.error}>{String(error) || 'Unknown error'}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Login" onPress={handleSubmit} />

      <View style={{ marginTop: 10 }}>
        <Button 
          title="Don't have an account? Sign Up"
          onPress={() => navigation.navigate("SignUpScreen")}  // Change "SignUp" to the correct name of your sign-up screen
        />
      </View>
      
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
    },
    input: {
      height: 40,
      borderColor: "#ccc",
      borderWidth: 1,
      marginBottom: 20,
      width: "80%",
      paddingLeft: 10,
    },
    error: {
      color: "red",
      marginBottom: 10,
    },
  });
