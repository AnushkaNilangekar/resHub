import React, { useState, useEffect, useContext } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator, Button, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import axios from 'axios';
import config from '../config';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import AsyncStorage from '@react-native-async-storage/async-storage';

const SwipeScreen = () => {
  const [profiles, setProfiles] = useState([]);
  const [isSwipedAll, setIsSwipedAll] = useState(false);
  const [selectedGender, setSelectedGender] = useState("All");
  const [userInfo, setUserInfo] = useState(null);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
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

  const fetchProfileCards = async () => {
    if (userInfo && userInfo.userId) {
      const queryParams = new URLSearchParams({
        userId: userInfo.userId,
        genderFilter: selectedGender,
        filterOutSwipedOn: true
      });

    await fetch(`${config.API_BASE_URL}/api/getProfiles?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userInfo.token}`
        }
    })
      .then(response => {                
          if (!response.ok) {
              throw new Error(`API response error: ${response.statusText}`);
          }

          return response.text(); // Use text() first to see the raw response
      })
      .then(rawData => {
          // Try parsing it as JSON
          try {
              const data = JSON.parse(rawData);
              if (Array.isArray(data)) {
                  setProfiles(data);
              } else {
                  console.error('Received data is not an array:', data);
              }
          } catch (parseError) {
              console.error('Error parsing JSON:', parseError);
          }
      })
      .catch(error => {
          console.error('Error fetching profiles:', error);
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setProfiles([]);
    await fetchProfileCards();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProfileCards();
  }, [userInfo, selectedGender]);

  // Handle a swipe on a card.
  const handleSwiped = (cardIndex, direction) => {
    const swipedProfile = profiles[cardIndex];
    if (!swipedProfile) return;
    console.log(`Swiped ${direction} on card ${swipedProfile.email}: ${swipedProfile.fullName}`);
    const swipedOnUserId = swipedProfile.userId;
    // Choose the correct endpoint based on swipe direction.
    const endpoint = direction === 'left'
        ? `${config.API_BASE_URL}/api/swipes/swipeLeft`
        : `${config.API_BASE_URL}/api/swipes/swipeRight`;

    axios.post(endpoint, null, {
        params: {
            userId: userInfo.userId,        // Access userId from userInfo
            swipedOnUserId,
        },
        headers: {
            'Authorization': `Bearer ${userInfo.token}`,   // Access token from userInfo
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

  const header = (() => {
    return (
      <View>
        <View style={styles.buttonContainer}>
          <Button title="Logout" onPress={() => logout()} />
          <Button title="Go to Profile set up" onPress={() => navigation.navigate("ProfileSetupScreen")} />
          <Button title="Refresh" onPress={() => onRefresh()} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Profiles for You</Text>
        </View>
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
      </View>
    );
  });

  const loadingItem = ((itemLoading) => {
    return (
      <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text>Loading {itemLoading}...</Text>
      </View>
    );
  });

  if (!userInfo || !userInfo.userId) {
    {loadingItem("user information")}
  };

  if (refreshing) {
    return (
      <View style={styles.container}>
        {header()}
        {loadingItem("profile cards")}
      </View>
    );
  }

  if (profiles.length === 0 && !refreshing) {
    return (
      <View style={styles.container}>
        {header()}
    
        {/* Display a message when no profiles match the filters */}
        <View style={styles.noProfilesContainer}>
          <Text style={styles.noProfilesText}>We couldn't find any profiles that matched your filters.</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {header()}
  
      {/* Profile swiper or loading */}
      {isSwipedAll ? (
        <View style={styles.endCard}>
          <Text style={styles.endCardText}>No more cards</Text>
        </View>
      ) : (
        <View style={{ flex: 1, width: "100%"}}>
          <Swiper
            cards={profiles}
            renderCard={(card) => {
              if (!card) return null;
              return (
                <View style={[styles.card, { backgroundColor: card.backgroundColor || "#F5E6F7" }]}>
                  <Image source={{ uri: card.profilePicUrl }} style={styles.profileImage} />
                  <Text style={styles.cardTitle}>{card.fullName || "No Name"}</Text>
                  <Text style={styles.cardSubtitle}>Age: {card.age || "N/A"}</Text>
                  <Text style={styles.cardSubtitle}>Gender: {card.gender || "N/A"}</Text>
                  <Text style={styles.cardSubtitle}>Major: {card.major || "N/A"}</Text>
                  <Text style={styles.cardSubtitle}>Minor: {card.minor || "N/A"}</Text>
                  <Text style={styles.cardSubtitle}>Residence: {card.residence || "N/A"}</Text>
                  <Text style={styles.cardSubtitle}>Graduation Year: {card.graduationYear || "N/A"}</Text>
                  <Text style={styles.cardSubtitle}>Hobbies: {card.hobbies?.join(", ") || "None listed"}</Text>
                  <Text style={styles.cardSubtitle}>Bio: {card.bio || "No Bio available"}</Text>
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
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  titleContainer: {
    marginTop: 15,
    width: "100%", 
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    zIndex: 5,
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  card: {
    flex: 0.65,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    padding: 10,
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
  noProfilesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProfilesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 10,
    rowGap: 10,
    columnGap: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#ddd",
  },
});

export default SwipeScreen;