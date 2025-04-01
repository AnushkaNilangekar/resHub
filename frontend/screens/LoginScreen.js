import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import config from "../config";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  Animated,
  ActivityIndicator
} from "react-native";
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, login } = useContext(AuthContext);  // Use context to get authentication state and login function
  const navigation = useNavigation();
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [error, fadeAnim]);

  useEffect(() => {
    if (isAuthenticated) {
      checkFirstLogin();  
    }
  }, [isAuthenticated]); 

  const checkFirstLogin = async () => {
    const token = await AsyncStorage.getItem("token");
    const userId = await AsyncStorage.getItem("userId")
    console.log(token);
    console.log(userId);
    const response = await axios.get(`${config.API_BASE_URL}/api/profile/exists`, {
      params: { userId: userId},
      headers: { 'Authorization': `Bearer ${token}` },
    });

    console.log(response.data)

    if (response.data === "exists") {
      navigation.replace('Main');
    } else {
      navigation.replace('ProfileSetupScreen');
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
        await AsyncStorage.multiRemove(["token", "userEmail", "profileData"]);
        const requestData = { email, password };
  
        const response = await axios.post(`${config.API_BASE_URL}/api/login`, requestData);
  
        if (response.status === 200) {
          await AsyncStorage.setItem("token", response.data.token);
          await AsyncStorage.setItem("userId", response.data.userId);
          await AsyncStorage.setItem("userEmail", email);
          await login(response.data.token);
          Alert.alert("Success", "Login successful!", [{ text: "OK" }]);
          checkFirstLogin();
        } else {
          setError("Login failed");
          Alert.alert("Error", "Login failed. Please try again.", [{ text: "OK" }]);
        }
      } catch (error) {
        setError("Login Failed. Please try again.")     
        Alert.alert("Error", "Login failed. Please try again.", [{ text: "OK" }]);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPasswordScreen"); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#7B4A9E', '#6BBFBC', '#6C85FF', '#404756']}
        style={[styles.gradient, { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.4, 0.7, 1]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.logoContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="home" size={36} color="#fff" />
            </View>
            <Text style={styles.appName}>ResHub</Text>
            <Text style={styles.tagline}>Find your perfect roommate</Text>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            
            {error ? (
              <Animated.View 
                style={[
                  styles.errorContainer, 
                  { opacity: fadeAnim }
                ]}
              >
                <Ionicons name="alert-circle-outline" size={18} color="#FF6B6B" />
                <Text style={styles.error}>{error}</Text>
              </Animated.View>
            ) : null}

            <View style={styles.inputContainer}>
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color="rgba(255, 255, 255, 0.7)" 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color="rgba(255, 255, 255, 0.7)" 
                style={styles.inputIcon} 
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              onPress={handleForgotPassword} 
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.loginButtonText}>LOGIN</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" style={styles.buttonIcon} />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate("SignUpScreen")}
                style={styles.signupButton}
              >
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4c6ef5',
  },
  gradient: {
    flex: 1,
    justifyContent: "space-between",
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  appName: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 18,
    color: "#fff",
    marginTop: 5,
    letterSpacing: 0.5,
  },
  contentContainer: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 50,
    marginTop: 20,
    flex: 1,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 25,
    textAlign: "left",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#FF6B6B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  error: {
    color: "#FF6B6B",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  inputIcon: {
    marginLeft: 15,
  },
  input: {
    flex: 1,
    height: 55,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#fff",
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: "flex-end",
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: "#fff",
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: "#7B4A9E",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    alignItems: 'center',
  },
  signupText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  signupLink: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  signupButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  }
});