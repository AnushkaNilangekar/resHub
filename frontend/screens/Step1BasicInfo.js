import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function Step1BasicInfo({ fullName, setFullName, handleNext }) {
    const [isFocused, setIsFocused] = useState(false);
    const screenHeight = Dimensions.get('window').height;
    
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <LinearGradient
                colors={['#4c6ef5', '#6C85FF', '#6BBFBC', '#2a47c3']}
                style={[styles.gradient, { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                locations={[0, 0.4, 0.7, 1]}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingView}
                >
                    <View style={styles.contentWrapper}>
                        <View style={styles.headerContainer}>
                            <View style={styles.stepIndicator}>
                                <Text style={styles.stepNumber}>1</Text>
                            </View>
                            <Text style={styles.title}>Basic Information</Text>
                            <Text style={styles.subtitle}>Let's start with your name</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>FULL NAME</Text>
                                <View style={[
                                    styles.inputWrapper,
                                    isFocused && styles.inputWrapperFocused
                                ]}>
                                    <Ionicons 
                                        name="person-outline" 
                                        size={20} 
                                        color="rgba(255, 255, 255, 0.8)" 
                                        style={styles.inputIcon} 
                                    />
                                    <TextInput
                                        style={styles.input}
                                        value={fullName}
                                        onChangeText={setFullName}
                                        placeholder="Enter your full name"
                                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                    />
                                </View>
                            </View>
                            
                            <View style={styles.progressIndicator}>
                                <View style={styles.progressDot}>
                                    <View style={styles.progressDotInner} />
                                </View>
                                <View style={styles.progressLine} />
                                <View style={styles.progressDot}>
                                    <View style={[styles.progressDotInner, styles.progressDotInactive]} />
                                </View>
                                <View style={styles.progressLine} />
                                <View style={styles.progressDot}>
                                    <View style={[styles.progressDotInner, styles.progressDotInactive]} />
                                </View>
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={styles.nextButton}
                                onPress={handleNext}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.nextButtonText}>CONTINUE</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4c6ef5',
    },
    gradient: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 50 : 70,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    contentWrapper: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        paddingBottom: 30,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    stepIndicator: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    stepNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    title: {
        fontSize: 28,
        color: "#fff",
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.15)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 8,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    inputContainer: {
        marginBottom: 30,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    inputWrapperFocused: {
        borderColor: '#fff',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        shadowOpacity: 0.2,
    },
    inputIcon: {
        marginLeft: 15,
    },
    input: {
        flex: 1,
        height: 55,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#fff',
    },
    progressIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    progressDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressDotInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    progressDotInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    progressLine: {
        height: 2,
        width: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    buttonContainer: {
        marginTop: 20,
    },
    nextButton: {
        backgroundColor: '#4c6ef5',
        borderRadius: 12,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
        letterSpacing: 1,
    },
    buttonIcon: {
        marginLeft: 5,
    }
});