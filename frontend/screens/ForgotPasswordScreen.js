import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.formContainer}>
                {!emailSent ? (
                    <>
                        <Text style={styles.heading}>Forgot Password</Text>
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center',    
        padding: 20,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
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