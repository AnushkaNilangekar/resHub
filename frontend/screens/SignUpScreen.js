import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  StyleSheet, 
  Keyboard,
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  StatusBar, 
  SafeAreaView, 
  Animated, 
  ActivityIndicator
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from "../config";

const SignUpScreen = ({ navigation }) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        // Client-side validation checks...
        
        try {
            // First check if AsyncStorage is available
            if (!AsyncStorage) {
                throw new Error("AsyncStorage is not initialized");
            }
            
            // Then proceed with API call
            const response = await fetch(`${config.API_BASE_URL}/api/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    password
                })
            });
    
            if (!response.ok) {
                const errorMessage = await response.text();
                Alert.alert("Sign Up Failed", errorMessage);
                return;
            }
    
            // Store user email only after successful signup
            await AsyncStorage.setItem("userEmail", email);
            Alert.alert("Success", "Your account has been created successfully");
            
            // Navigate to login page
            navigation.navigate("LoginScreen");
        } catch (error) {
            console.error("Signup error:", error);
            Alert.alert("Error", error.message || "Something went wrong. Please try again.");
        }
    };

    return (
        // Wrap the container with TouchableWithoutFeedback to dismiss the keyboard when tapping outside
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                        <Text style={styles.appName}>Sign Up</Text>
                </View>

                    <View style={styles.contentContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            placeholderTextColor="rgba(255, 255, 255, 0.7)"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            placeholderTextColor="rgba(255, 255, 255, 0.7)"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="rgba(255, 255, 255, 0.7)"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            placeholderTextColor="rgba(255, 255, 255, 0.7)"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="rgba(255, 255, 255, 0.7)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={styles.signupButton}
                            onPress={handleSignUp}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>SIGN UP</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Already have an account? </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("LoginScreen")}
                                style={styles.signupLink}
                            >
                                <Text style={styles.signupText}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

export default SignUpScreen;

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
        justifyContent: "center",
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
    },
    contentContainer: {
        paddingTop: 30,
        paddingBottom: 50,
        marginTop: 20,
    },
    input: {
        height: 55,
        marginBottom: 16,
        paddingHorizontal: 15,
        fontSize: 16,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        color: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.25)",
    },
    signupButton: {
        backgroundColor: "#7B4A9E",
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: "center",
        marginBottom: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    signupContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    signupText: {
        color: "#fff",
        fontSize: 14,
    },
    signupLink: {
        marginLeft: 5,
    },
});
