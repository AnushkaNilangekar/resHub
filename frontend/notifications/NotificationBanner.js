import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors.js';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';

const NotificationBanner = ({ message, visible, onClose,  notifVolume = 1, matchSoundEnabled = true, messageSoundEnabled = true  }) => {
    const slideAnim = useState(new Animated.Value(-100))[0];
    const fadeAnim = useState(new Animated.Value(0))[0];

    const soundRef = useRef(null);
    
    // Pre-load the asset
    useEffect(() => {
        const loadAssetAndSound = async () => {
            try {
                // Ensure the asset is loaded
                const soundAsset = Asset.fromModule(require('../assets/notifSound.mp3'));
                await soundAsset.downloadAsync();
                
                // Create the sound object
                const { sound } = await Audio.Sound.createAsync(
                    soundAsset,
                    { shouldPlay: false }
                );
                
                sound.setOnPlaybackStatusUpdate((status) => {
                });
                
                soundRef.current = sound;
            } catch (error) {
                console.log('Error loading sound asset:', error);
            }
        };
        
        loadAssetAndSound();
        
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);
    
    const playSound = async () => {
        try {
            if (soundRef.current) {
                try {
                    // Reset the sound
                    await soundRef.current.stopAsync();
                    await soundRef.current.setPositionAsync(0);
                    
                    const adjustedVolume = Math.pow(notifVolume, 2);
                    await soundRef.current.setVolumeAsync(adjustedVolume);
                    await soundRef.current.playAsync();
                } catch (error) {
                    console.log('Error playing loaded sound:', error);
                    // If playing the cached sound fails, try loading it again on demand
                    throw error;  // Re-throw to trigger the fallback
                }
            } else {
                throw new Error('Sound not loaded');  // Trigger fallback
            }
        } catch (error) {
            // Fallback: Try to load and play on demand
            try {
                //console.log('Using fallback sound loading');
                const { sound } = await Audio.Sound.createAsync(
                    require('../assets/notifSound.mp3')
                );
                const adjustedVolume = Math.pow(notifVolume, 2);
                await sound.setVolumeAsync(adjustedVolume);
                await sound.playAsync();
                
                sound.setOnPlaybackStatusUpdate((status) => {
                    if (status.didJustFinish) {
                        sound.unloadAsync();
                    }
                });
            } catch (fallbackError) {
                console.log('Error with fallback sound:', fallbackError);
            }
        }
    };

    useEffect(() => {
        if (visible) {
            if ((message.toLowerCase().includes('match') && matchSoundEnabled) || 
                (message.toLowerCase().includes('message') && messageSoundEnabled)) {
                playSound();
            }
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

const playNotificationSound = async (volume = 1.0) => {
    try {
        const { sound } = await Audio.Sound.createAsync(
            require('../assets/notifSound.mp3'), 
        );
        const adjustedVolume = Math.pow(volume, 2);
        await sound.setVolumeAsync(adjustedVolume);
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
                sound.unloadAsync();
            }
        });
    } catch (error) {
        console.log('Error playing sound:', error);
    }
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