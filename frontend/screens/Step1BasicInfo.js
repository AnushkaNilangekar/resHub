import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Step1BasicInfo({ fullName, setFullName, handleNext }) {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#6C85FF', '#404756']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                locations={[0, 1]}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingView}
                >
                    <View style={styles.logoContainer}>
                        <Ionicons name="person-circle" size={50} color="#fff" />
                        <Text style={styles.title}>Step 1: Basic Information</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name:</Text>
                        <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Enter full name"
                            placeholderTextColor="rgba(255, 255, 255, 0.7)"
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.nextButton}
                        onPress={handleNext}
                    >
                        <Text style={styles.nextButtonText}>Next</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: "center",
        padding: 20,
    },
    keyboardAvoidingView: {
        flex: 1,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 26,
        color: "#fff",
        fontWeight: 'bold',
        marginTop: 10,
    },
    label: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 8,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 12,
        marginBottom: 16,
        borderRadius: 10,
        color: '#fff',
        fontSize: 16,
    },
    nextButton: {
        backgroundColor: '#6C85FF',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
