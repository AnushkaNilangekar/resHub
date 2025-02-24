import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    Button,
    Alert,
    Keyboard,
    TouchableWithoutFeedback
} from "react-native";
import config from "../config";

const SignUpScreen = ({ navigation }) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");

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
            <View style={styles.container}>
                <Text style={styles.title}>Sign Up</Text>

                <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor="#333"  // Darker placeholder text
                    value={firstName}
                    onChangeText={setFirstName}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor="#333"
                    value={lastName}
                    onChangeText={setLastName}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email (must end in @purdue.edu)"
                    placeholderTextColor="#333"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="#333"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#333"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Button title="Sign Up" onPress={handleSignUp} />

                <View style={{ marginTop: 10 }}>
                    <Button title="Go Back" onPress={() => navigation.goBack()} />
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default SignUpScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 20
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        alignSelf: "center"
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 5,
        marginBottom: 15
    }
});
