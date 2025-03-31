import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator, Button, TouchableOpacity, Animated, Dimensions } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import axios from 'axios';
import config from '../config';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../styles/colors';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

const { height, width } = Dimensions.get('window');

const SwipeScreen = () => {
  const [profiles, setProfiles] = useState([]);
  const [isSwipedAll, setIsSwipedAll] = useState(false);
  const [selectedGender, setSelectedGender] = useState("All");
  const [userInfo, setUserInfo] = useState(null);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useContext(AuthContext);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [swipeFeedback, setSwipeFeedback] = useState(null);

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
        triggerSwipeFeedback(direction);  
    };

    const triggerSwipeFeedback = (direction) => {
      setSwipeFeedback(direction);

      // Reset animations
      fadeAnim.setValue(0);
      translateY.setValue(0);

      Animated.parallel([
          Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 10,
              useNativeDriver: true,
          }),
          Animated.timing(translateY, {
              toValue: -10,
              duration: 10,
              useNativeDriver: true,
          }),
      ]).start(() => {
          setTimeout(() => setSwipeFeedback(null), 300);
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

      {swipeFeedback && (
        <Animated.View style={[
            styles.swipeFeedback,
            { opacity: fadeAnim, transform: [{ translateY: -50 }, { scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 1],
            }) }] },
            swipeFeedback === 'right' ? styles.rightSwipeFeedback : styles.leftSwipeFeedback
        ]}>
            <Text style={styles.swipeIcon}>{swipeFeedback === 'right' ? '✅' : '❌'}</Text>
        </Animated.View>
      )}

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
                <View style={styles.card}>
                  <View style={styles.rowContainer}>
                    <Image source={{ uri: card.profilePicUrl }} style={styles.profileImage} />
                    <View stylele={styles.columnContainer}>
                      <Text style={styles.cardTitle}>{card.fullName || "No Name"}</Text>
                      <Text style={styles.cardSubtitle}>Age: {card.age || "N/A"}</Text>
                      <Text style={styles.cardSubtitle}>Gender: {card.gender || "N/A"}</Text>
                    </View>
                  </View>

                  <View stylele={styles.columnContainer}>
                    <Text style={styles.cardText}>Major: {card.major || "N/A"}</Text>
                    <Text style={styles.cardText}>Grad. Year: {card.graduationYear || "N/A"}</Text>
                    <Text style={styles.cardText}>Minor: {card.minor || "N/A"}</Text>
                    <Text style={styles.cardText}>Residence: {card.residence || "N/A"}</Text>
                    <Text style={styles.cardText}>Hobbies: {card.hobbies?.join(", ") || "None listed"}</Text>
                    <Text style={styles.cardText}>Bio: {card.bio || "No bio available"}</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.rowContainerBody}>
                      <View stylele={styles.columnContainer}>
                        <Text style={styles.footerText}>Smoking: {card.smokingStatus || "N/A"}</Text>
                        <Text style={styles.footerText}>Cleanliness: {card.cleanlinessLevel || "N/A"}</Text>
                        <Text style={styles.footerText}>Noise: {card.noiseLevel || "N/A"}</Text>
                        <Text style={styles.footerText}>Sharing: {card.sharingCommonItems || "N/A"}</Text>
                        <Text style={styles.footerText}>Diet: {card.dietaryPreference || "N/A"}</Text>
                      </View>
                      <View style={styles.columnContainer}>
                        <Text style={styles.footerText}>Sleep: {card.sleepSchedule || "N/A"}</Text>
                        <Text style={styles.footerText}>Pets: {card.hasPets || "N/A"}</Text>
                        <Text style={styles.footerText}>Guests: {card.guestFrequency || "N/A"}</Text>
                        <Text style={styles.footerText}>Allergies: {card.allergies || "N/A"}</Text>
                        <Text style={styles.footerText}></Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            }}
            onSwipedLeft={(cardIndex) => handleSwiped(cardIndex, 'left')}
            onSwipedRight={(cardIndex) => handleSwiped(cardIndex, 'right')}
            onSwipedAll={() => setIsSwipedAll(true)}
            disableTopSwipe
            disableBottomSwipe
            cardIndex={0}
            backgroundColor={colors.white}
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
    backgroundColor: colors.white,
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,  
  },
  rowContainerBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  columnContainer: {
    flexDirection: 'column',
  },
  titleContainer: {
    width: "100%", 
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: -50,
    zIndex: 5,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: colors.pastelPink,
  },
  selectedFilter: {
    backgroundColor: colors.blue,
  },
  filterText: {
    color: colors.white,
    fontWeight: "bold",
  },
  swipeFeedback: {
    position: 'absolute',
    top: '36%',
    zIndex: 100,
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  rightSwipeFeedback: {
    right: 20, 
    borderColor: 'rgba(0, 255, 0, 0.5)',
    borderWidth: 3,
  },
  leftSwipeFeedback: {
    left: 20, 
    borderColor: 'rgba(255, 0, 0, 0.5)',
    borderWidth: 3,
  },
  swipeIcon: {
    fontSize: 30, 
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  card: {
    backgroundColor: colors.pastelPink,
    borderRadius: 25,
    borderWidth: 5,
    borderColor: colors.lightPastelPink,
    justifyContent: 'flex-start',
    flexDirection: 'column',
    width: '100%',
    height: height * 0.60,
    alignSelf: 'center',
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    // For Apple
    shadowColor: '#000',
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    // For Android
    elevation: 5,
  },
  cardFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: colors.white,
    borderRadius: 15,
    borderTopWidth: 5,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.lightPastelPink,
  },
  cardTitle: {
    fontSize: RFPercentage(3.3),
    fontWeight: 'bold',
    flexWrap: 'wrap',
    color: colors.cardTextColor,
    marginBottom: 5,
    width: '85%',
  },
  cardSubtitle: {
    fontSize: RFPercentage(2.3),
    fontWeight: 'bold',
    flexWrap: 'wrap',
    color: colors.cardTextColor,
    marginBottom: 2,
  },
  cardText: {
    fontSize: RFPercentage(2),
    flexWrap: 'wrap',
    color: colors.cardTextColor,
    marginBottom: 5,
    width: '85%',
  },
  footerText: {
    fontSize: RFPercentage(1.8),
    flexWrap: 'wrap',
    color: colors.cardTextColor,
    marginBottom: 5,
    width: '100%',
  },
  noProfilesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noProfilesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.cardTextColor,
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
    color: colors.cardTextColor,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 5,
    width: "100%",
    paddingHorizontal: 10,
    rowGap: 10,
    columnGap: 15,
  },
  profileImage: {
    width: width * 0.23,
    height: width * 0.23,
    borderRadius: (width * 0.23) / 2,
    borderWidth: 2,
    borderColor: colors.profilePicBorder,
    marginRight: 15,
  },
});

export default SwipeScreen;