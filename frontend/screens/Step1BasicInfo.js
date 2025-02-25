import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function Step1BasicInfo({ fullName, setFullName, handleNext }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Step 1: Basic Information</Text>
{/* 
            <Text style={styles.label}>Email:</Text>
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#888"
            /> */}

            <Text style={styles.label}>Full Name:</Text>
            <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter full name"
                placeholderTextColor="#888"
            />

            <View style={styles.buttonContainer}>
                <Button title="Next" onPress={handleNext} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    title: {
        fontSize: 22,
        marginBottom: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
});
