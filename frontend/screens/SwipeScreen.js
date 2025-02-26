import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Button } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import axios from 'axios';
import config from '../config';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import GestureRecognizer from "react-native-swipe-gestures";
//import RNPickerSelect from "react-native-picker-select";

// Dummy profiles (for demo purposes)
const dummyProfiles = [
    { id: "1", name: "Alice Johnson", bio: "Loves hiking and cooking.", backgroundColor: "#a3d2ca" },
    { id: "2", name: "Bob Smith", bio: "Passionate about music and art.", backgroundColor: "#f7d794" },
    { id: "3", name: "Cathy Lee", bio: "Enjoys traveling and photography.", backgroundColor: "#f8a5c2" },
    { id: "4", name: "David Brown", bio: "Avid reader and tech enthusiast.", backgroundColor: "#f3a683" }
];

const SwipeScreen = () => {
  const [profiles, setProfiles] = useState([]);
  const [isSwipedAll, setIsSwipedAll] = useState(false);
  const [selectedGender, setSelectedGender] = useState("All");
  const [userInfo, setUserInfo] = useState(null);
  const navigation = useNavigation();

  // Fetch user info (email and token) from AsyncStorage on mount
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

  // Fetch profiles based on selected gender
  useEffect(() => {
    fetchProfiles();
  }, [selectedGender]);

  const fetchProfiles = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/getProfiles`, {
        params: { genderFilter: selectedGender },
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const text = await response.text();
      if (!text.trim()) {
        setProfiles([]); // Handle empty response
        return;
      }

      const data = JSON.parse(text); // Parse the profiles from API response
      setProfiles(data);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleSwiped = (cardIndex, direction) => {
    const swipedProfile = profiles[cardIndex];
    if (!swipedProfile) return;

    const { userId, token } = userInfo;
    const swipedOnUserId = swipedProfile.id;
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
      console.error('Error recording swipe:', error.response?.data || error.message);
    });
  };

  if (!userInfo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (profiles.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profiles for You</Text>

      {/* Gender Filter Buttons */}
      <View style={styles.filterContainer}>
        {["All", "Male", "Female", "Non-binary"].map((gender) => (
          <TouchableOpacity
            key={gender}
            style={[styles.filterButton, selectedGender === gender && styles.selectedFilter]}
            onPress={() => setSelectedGender(gender)}
          >
            <Text style={styles.filterText}>{gender}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Show swiping interface */}
      {isSwipedAll ? (
        <View style={styles.endCard}>
          <Text style={styles.endCardText}>No more cards</Text>
        </View>
      ) : (
        <Swiper
          cards={profiles}
          renderCard={(card) => (
            <View style={[styles.card, { backgroundColor: card.backgroundColor }]}>
              <Text style={styles.cardTitle}>{card.name || "No Name"}</Text>
              <Text style={styles.cardSubtitle}>{card.bio || "No Bio available"}</Text>
            </View>
          )}
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E90FF", // Blue
    textAlign: "center",
    marginBottom: 10,
    marginTop: 10
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#FFC0CB", // Pastel Pink
  },
  selectedFilter: {
    backgroundColor: "#1E90FF", // Blue
  },
  filterText: {
    color: "#fff",
    fontWeight: "bold",
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
});

export default SwipeScreen;