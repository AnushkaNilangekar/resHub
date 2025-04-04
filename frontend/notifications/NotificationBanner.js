import React, { useState, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors.js';

const NotificationBanner = ({ message, visible, onClose }) => {
    const slideAnim = useState(new Animated.Value(-100))[0];
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                setTimeout(() => {
                    Animated.parallel([
                        Animated.timing(slideAnim, {
                            toValue: -100,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(fadeAnim, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                    ]).start(onClose);
                }, 3000);
            });
        }
    }, [visible]);

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY: slideAnim }], opacity: fadeAnim },
            ]}
        >
            <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.gradientBorder}
            >
                <View style={styles.banner}>
                    <Text style={styles.text}>{message}</Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    gradientBorder: {
        padding: 4,
        borderRadius: 10,
    },
    banner: {
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        padding: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.7,
        shadowRadius: 10,
        elevation: 40,
    },
    text: {
        color: colors.text.light,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

export default NotificationBanner;