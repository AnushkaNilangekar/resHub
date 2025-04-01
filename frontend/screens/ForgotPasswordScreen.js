import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from 'react-native-vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import config from "../config";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const navigation = useNavigation();

    useEffect(() => {
      if (error) {
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(5000),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => setError(''));
      }
    }, [error, fadeAnim]);

    const handlePasswordResetRequest = async () => {
        if (!email) {
            setError('Please enter your email address.');
            return; 
        }

        setIsLoading(true);
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
                setError(result || 'An error occurred. Please try again.');
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
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
              <View style={styles.logoContainer}>
                <View style={styles.iconContainer}>
                  <Ionicons name="key" size={36} color="#fff" />
                </View>
                <Text style={styles.appName}>ResHub</Text>
                <Text style={styles.tagline}>Reset your password</Text>
              </View>
      
              <View style={styles.contentContainer}>
                <Text style={styles.welcomeText}>Forgot Password?</Text>
                
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
      
                {!emailSent ? (
                  <>
                    <Text style={styles.instructionText}>
                      Enter your email address and we'll send you a link to reset your password.
                    </Text>
                    
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
      
                    <TouchableOpacity 
                      style={styles.submitButton} 
                      onPress={handlePasswordResetRequest}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <View style={styles.buttonContent}>
                          <Text style={styles.submitButtonText}>SEND RESET LINK</Text>
                          <Ionicons name="paper-plane-outline" size={18} color="#fff" style={styles.buttonIcon} />
                        </View>
                      )}
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.successContainer}>
                    <View style={styles.successIconContainer}>
                      <Ionicons name="checkmark-circle" size={60} color="#fff" />
                    </View>
                    <Text style={styles.successText}>
                      Check your email for the reset link
                    </Text>
                    <Text style={styles.successSubText}>
                      We've sent instructions to reset your password
                    </Text>
                    
                    <TouchableOpacity 
                      style={styles.submitButton} 
                      onPress={() => navigation.navigate('ResetPassword')}
                    >
                      <View style={styles.buttonContent}>
                        <Text style={styles.submitButtonText}>CONTINUE</Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" style={styles.buttonIcon} />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
                
                <TouchableOpacity 
                  onPress={() => navigation.navigate("LoginScreen")} 
                  style={styles.backContainer}
                >
                  <Ionicons name="chevron-back" size={16} color="#fff" />
                  <Text style={styles.backText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </LinearGradient>
        </SafeAreaView>
      );
};

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
    marginBottom: 15,
    textAlign: "left",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  instructionText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 25,
    lineHeight: 22,
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
    marginBottom: 25,
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
  submitButton: {
    backgroundColor: "#4c6ef5",
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
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  backContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  backText: {
    color: "#fff",
    fontSize: 15,
    marginLeft: 5,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  successSubText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 22,
  }
});

export default ForgotPassword;