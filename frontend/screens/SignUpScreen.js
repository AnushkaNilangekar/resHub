import React, { useState } from "react";
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
        // Client-side check for student email
        if (!email.endsWith("@purdue.edu")) {
            Alert.alert("Invalid Email", "Email must end with @purdue.edu");
            return;
        }

        // Basic required fields check
        if (!firstName || !lastName || !phoneNumber || !password) {
            Alert.alert("Missing Fields", "Please fill out all fields.");
            return;
        }

        try {
            // Send a POST request to the backend endpoint
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
                const errorMessage = await response.text(); // read error message from backend
                Alert.alert("Sign Up Failed", errorMessage);
                return;
            }

            // If success, read the response
            const successMessage = await response.text();
            Alert.alert("Success", successMessage);

            //TODO:
            //here, we can navigate to login so user can login now
            // navigation.navigate("loginscreen");
        } catch (error) {
            Alert.alert("Network Error", error.message);
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
