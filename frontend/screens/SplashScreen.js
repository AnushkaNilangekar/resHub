import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const SplashScreen = ({ navigation }) => {
  // Animation values with useRef to maintain values across renders
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start animations sequentially
    Animated.sequence([
      // First animate the logo
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      
      // Then animate the text
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Navigate to LoginScreen after animation completes
    const timer = setTimeout(() => {
      navigation.replace('LoginScreen');
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [navigation]);
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />
      <LinearGradient
        colors={['#6A3093', '#A044FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <Animated.View 
            style={[
              styles.logoContainer, 
              { 
                opacity: logoOpacity,
                transform: [{ scale: logoScale }] 
              }
            ]}
          >
            <View style={styles.iconContainer}>
              <FontAwesome5 name="home" size={40} color="#fff" />
            </View>
            <Animated.Text style={[styles.appName, { opacity: logoOpacity }]}>
              ResHub
            </Animated.Text>
          </Animated.View>
          
          <Animated.Text style={[styles.tagline, { opacity: textOpacity }]}>
            Find your ideal roommate
          </Animated.Text>
          
          <Animated.View style={[styles.versionContainer, { opacity: textOpacity }]}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  appName: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: "#fff",
    letterSpacing: 1,
    marginTop: 10,
    fontWeight: "500",
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 30,
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  }
});

export default SplashScreen;