import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from 'react-native-vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import config from "../config";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const navigation = useNavigation();

    const handlePasswordResetRequest = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return; 
        }

        try {
            const response = await fetch(`${config.API_BASE_URL}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const result = await response.text();
            if (response.ok) {
                setEmailSent(true);
            } else {
                Alert.alert('Error', result);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    return (
        <LinearGradient colors={['#4c6ef5', '#2a47c3']} style={styles.container}> {/* Blue Gradient */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.logoContainer}>
                    <Ionicons name="key" size={36} color="#fff" style={styles.iconContainer} /> {/* Key icon */}
                    <Text style={styles.appName}>Forgot Password</Text>
                </View>

                <View style={styles.formContainer}>
                    {!emailSent ? (
                        <>
                            <Text style={styles.label}>Enter your email:</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <Button title="Send Reset Email" onPress={handlePasswordResetRequest} />
                        </>
                    ) : (
                        <>
                            <Text style={styles.successText}>Check your email for the reset token.</Text>
                            <Button title="Take me to reset my password" onPress={() => navigation.navigate('ResetPassword')} />
                        </>
                    )}
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logoContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30, // Optional: adds some space between icon and form
    },
    iconContainer: {
        marginBottom: 10, // Optional: controls space between icon and text
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
    },
    label: {
        fontSize: 16,
        marginVertical: 10,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    successText: {
        fontSize: 16,
        color: 'green',
        textAlign: 'center',
        marginBottom: 20,
    },
});

export default ForgotPassword;