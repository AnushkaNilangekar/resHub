import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import axios from 'axios';
import config from '../config';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dummy profiles (for demo purposes)
const dummyProfiles = [
    { id: "1", name: "Alice Johnson", bio: "Loves hiking and cooking.", backgroundColor: "#a3d2ca" },
    { id: "2", name: "Bob Smith", bio: "Passionate about music and art.", backgroundColor: "#f7d794" },
    { id: "3", name: "Cathy Lee", bio: "Enjoys traveling and photography.", backgroundColor: "#f8a5c2" },
    { id: "4", name: "David Brown", bio: "Avid reader and tech enthusiast.", backgroundColor: "#f3a683" }
];

const SwipeScreen = () => {
    const [profiles] = useState(dummyProfiles);
    const [isSwipedAll, setIsSwipedAll] = useState(false);
    const navigation = useNavigation();

    const [userInfo, setUserInfo] = useState(null);

    // Fetch user info (userEmail and token) from AsyncStorage immediately on mount.
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem("userEmail");
                const token = await AsyncStorage.getItem("token");
                if (storedUserId && token) {
                    setUserInfo({ userId: storedUserId, token });
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };

        fetchUserInfo();
    }, []);

    if (!userInfo) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }
    const { userId, token } = userInfo;

    // Handle a swipe on a card.
    const handleSwiped = (cardIndex, direction) => {
        const swipedProfile = profiles[cardIndex];
        if (!swipedProfile) return;
        console.log(`Swiped ${direction} on card ${swipedProfile.id}: ${swipedProfile.name}`);

        const swipedOnUserId = swipedProfile.id;
        // Choose the correct endpoint based on swipe direction.
        const endpoint = direction === 'left'
            ? `${config.API_BASE_URL}/api/swipes/swipeLeft`
            : `${config.API_BASE_URL}/api/swipes/swipeRight`;

        axios.post(endpoint, null, {
            params: {
                userId,
                swipedOnUserId,
            },
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        .catch(error => {
            if (error.response && error.response.status === 404) {
                console.error('Swipe endpoint not found. Check your API URL and ngrok tunnel.');
            } else {
                console.error('Error recording swipe:', error.response?.data || error.message);
            }
        });
    };

    if (profiles.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.backButtonContainer}>
                <Button title="Back to Home" onPress={() => navigation.goBack()} />
            </View>
            {isSwipedAll ? (
                <View style={styles.endCard}>
                    <Text style={styles.endCardText}>No more cards</Text>
                </View>
            ) : (
                <Swiper
                    cards={profiles}
                    renderCard={(card) => {
                        if (!card) return null;
                        return (
                            <View style={[styles.card, { backgroundColor: card.backgroundColor }]}>
                                <Text style={styles.cardTitle}>{card.name || "No Name"}</Text>
                                <Text style={styles.cardSubtitle}>{card.bio || "No Bio available"}</Text>
                            </View>
                        );
                    }}
                    onSwipedLeft={(cardIndex) => handleSwiped(cardIndex, 'left')}
                    onSwipedRight={(cardIndex) => handleSwiped(cardIndex, 'right')}
                    onSwipedAll={() => setIsSwipedAll(true)}
                    cardIndex={0}
                    backgroundColor={'#f0f0f0'}
                    stackSize={3}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        flex: 0.65,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        justifyContent: 'center',
        padding: 20,
        marginHorizontal: 20,
    },
    cardTitle: {
        fontSize: 22,
        marginBottom: 10,
        fontWeight: 'bold',
        color: '#333',
    },
    cardSubtitle: {
        fontSize: 16,
        color: '#555',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    endCard: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    endCardText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    backButtonContainer: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 999,
    },
});

export default SwipeScreen;