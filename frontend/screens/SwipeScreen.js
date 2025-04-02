import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Image, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Animated, Dimensions, SafeAreaView, StatusBar, Platform, ScrollView } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import axios from 'axios';
import config from '../config';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFPercentage } from "react-native-responsive-fontsize";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { height, width } = Dimensions.get('window');

const SwipeScreen = () => {
  // State variables remain the same...
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

      try {
        const response = await fetch(`${config.API_BASE_URL}/api/getProfiles?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userInfo.token}`
            }
        });

        if (!response.ok) {
            throw new Error(`API response error: ${response.statusText}`);
        }

        const rawData = await response.text();

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
      } catch (error) {
          console.error('Error fetching profiles:', error);
      }
    }
  };

  const checkIfMoreProfiles = () => {
    if (profiles.length > 0) {
      setIsSwipedAll(false);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    setProfiles([]);
    await fetchProfileCards();
    checkIfMoreProfiles();
    setRefreshing(false);
  };

  useEffect(() => {
    onRefresh();
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
                userId: userInfo.userId,
                swipedOnUserId,
            },
            headers: {
                'Authorization': `Bearer ${userInfo.token}`,
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

  const LoadingItem = ({ itemLoading }) => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading {itemLoading}...</Text>
      </View>
    );
  };

  if (!userInfo || !userInfo.userId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#6C5CE7', '#45aaf2', '#2d98da', '#3867d6']}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.4, 0.7, 1]}
        >
          <LoadingItem itemLoading="user information" />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#6C5CE7', '#45aaf2', '#2d98da', '#3867d6']}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.4, 0.7, 1]}
        >
          <LoadingItem itemLoading="profile cards" />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#6C5CE7', '#45aaf2', '#2d98da', '#3867d6']}
        style={styles.gradientContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.4, 0.7, 1]}
      >

        <View style={styles.contentContainer}>
          {/* Container for filters and refresh button */}
          <View style={styles.filterRow}>
            {/* Filter buttons */}
            <View style={styles.filterContainer}>
              {["All", "Male", "Female", "Non-Binary"].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[styles.filterButton, selectedGender === gender && styles.selectedFilter]}
                  onPress={() => setSelectedGender(gender)}
                >
                  <Text style={styles.filterText}>{gender}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Refresh button */}
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={onRefresh}
            >
              <Ionicons name="refresh-outline" style={styles.refreshIcon} size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
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

            {/* Profile swiper or empty state */}
            {profiles.length === 0 && !refreshing ? (
              <View style={styles.noProfilesContainer}>
                <Ionicons name="search-outline" size={60} color="rgba(255,255,255,0.7)" />
                <Text style={styles.noProfilesText}>We couldn't find any profiles that matched your filters.</Text>
                <TouchableOpacity style={styles.refreshButtonEmpty} onPress={onRefresh}>
                  <Text style={styles.refreshButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : isSwipedAll ? (
              <View style={styles.noProfilesContainer}>
                <Ionicons name="checkmark-done-outline" size={60} color="rgba(255,255,255,0.7)" />
                <Text style={styles.noProfilesText}>No more profiles available</Text>
                <TouchableOpacity style={styles.refreshButtonEmpty} onPress={onRefresh}>
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.swiperContainer}>
                <Swiper
                  cards={profiles}
                  renderCard={(card) => {
                    if (!card) return null;
                    return (
                      <View style={styles.card}>
                        {/* Card Header - Fixed height */}
                        <View style={styles.cardHeader}>
                          <Image source={{ uri: card.profilePicUrl }} style={styles.profileImage} />
                          <View style={styles.headerInfo}>
                            <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">{card.fullName || "No Name"}</Text>
                            <View style={styles.basicInfo}>
                              <View style={styles.infoItem}>
                                <Ionicons name="calendar-outline" size={16} color="#444" />
                                <Text style={styles.infoText}>{card.age || "N/A"}</Text>
                              </View>
                              <View style={styles.infoItem}>
                                <Ionicons name="person-outline" size={16} color="#444" />
                                <Text style={styles.infoText}>{card.gender || "N/A"}</Text>
                              </View>
                              <View style={styles.infoItem}>
                                <Ionicons name="calendar-number-outline" size={16} color="#444" />
                                <Text style={styles.infoText}>{card.graduationYear || "N/A"}</Text>
                              </View>
                            </View>
                          </View>
                        </View>

                        {/* Scrollable content area that will adjust to content size */}
                        <ScrollView style={styles.scrollableContent} contentContainerStyle={styles.scrollContentContainer}>
                          <View style={styles.cardBody}>
                            <View style={styles.infoRow}>
                              <View style={styles.infoColumn}>
                                <Ionicons name="school-outline" size={16} color="#444" />
                                <Text style={styles.cardText} numberOfLines={1} ellipsizeMode="tail">Major: {card.major || "N/A"}</Text>
                              </View>
                            </View>
                            


                            <View style={styles.infoRow}>
                              <View style={styles.infoColumn}>
                                <Ionicons name="bookmark-outline" size={16} color="#444" />
                                <Text style={styles.cardText} numberOfLines={1} ellipsizeMode="tail">Minor: {card.minor || "N/A"}</Text>
                              </View>
                            </View>

                            <View style={styles.infoRow}>  
                              <View style={styles.infoColumn}>
                                <Ionicons name="home-outline" size={16} color="#444" />
                                <Text style={styles.cardText} numberOfLines={1} ellipsizeMode="tail">Residence: {card.residence || "N/A"}</Text>
                              </View>
                            </View>
                            
                            <View style={styles.bioSection}>
                              <View style={styles.hobbiesContainer}>
                                <Text style={styles.sectionTitle}>Hobbies:</Text>
                                <Text style={styles.hobbiesText}>{card.hobbies?.join(", ") || "None listed"}</Text>
                              </View>
                              
                              <View style={styles.bioContainer}>
                                <Text style={styles.sectionTitle}>Bio:</Text>
                                <Text style={styles.bioText}>{card.bio || "No bio available"}</Text>
                              </View>
                            </View>
                          </View>

                          <View style={styles.cardFooter}>
                            <Text style={styles.preferencesTitle}>Living Preferences</Text>
                            <View style={styles.preferencesGrid}>
                              <View style={styles.preferenceItem}>
                                <Ionicons name="flame-outline" size={18} color="#444" />
                                <Text style={styles.preferenceLabel}>Smoking:</Text>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.smokingStatus || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <Ionicons name="sparkles-outline" size={18} color="#444" />
                                <Text style={styles.preferenceLabel}>Cleanliness:</Text>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.cleanlinessLevel || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <Ionicons name="volume-high-outline" size={18} color="#444" />
                                <Text style={styles.preferenceLabel}>Noise:</Text>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.noiseLevel || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <Ionicons name="people-outline" size={18} color="#444" />
                                <Text style={styles.preferenceLabel}>Sharing:</Text>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.sharingCommonItems || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <Ionicons name="restaurant-outline" size={18} color="#444" />
                                <Text style={styles.preferenceLabel}>Diet:</Text>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.dietaryPreference || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <Ionicons name="moon-outline" size={18} color="#444" />
                                <Text style={styles.preferenceLabel}>Sleep:</Text>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.sleepSchedule || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <Ionicons name="paw-outline" size={18} color="#444" />
                                <Text style={styles.preferenceLabel}>Pets:</Text>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.hasPets || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <Ionicons name="person-add-outline" size={18} color="#444" />
                                <Text style={styles.preferenceLabel}>Guests:</Text>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.guestFrequency || "N/A"}</Text>
                              </View>
                            </View>
                          </View>
                        </ScrollView>
                        
                        {/* Fixed swipe hints at bottom */}
                        <View style={styles.swipeHints}>
                          <View style={styles.swipeHintLeft}>
                            <Ionicons name="close-circle" size={24} color="#ff6b6b" />
                            <Text style={styles.swipeHintTextLeft}>Swipe left to pass</Text>
                          </View>
                          <View style={styles.swipeHintRight}>
                            <Text style={styles.swipeHintTextRight}>Swipe right to match</Text>
                            <Ionicons name="checkmark-circle" size={24} color="#20bf6b" />
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
                  backgroundColor="transparent"
                  stackSize={3}
                  stackSeparation={15}
                  animateOverlayLabelsOpacity
                  overlayLabels={{
                    left: {
                      title: 'PASS',
                      style: {
                        label: {
                          backgroundColor: 'rgba(255, 107, 107, 0.8)',
                          color: '#fff',
                          fontSize: 24,
                          borderRadius: 10,
                          padding: 10,
                        },
                        wrapper: {
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          justifyContent: 'flex-start',
                          marginLeft: 30,
                          marginTop: 30
                        }
                      }
                    },
                    right: {
                      title: 'MATCH',
                      style: {
                        label: {
                          backgroundColor: 'rgba(32, 191, 107, 0.8)',
                          color: '#fff',
                          fontSize: 24,
                          borderRadius: 10,
                          padding: 10,
                        },
                        wrapper: {
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          justifyContent: 'flex-start',
                          marginRight: 30,
                          marginTop: 30
                        }
                      }
                    }
                  }}
                />
              </View>
            )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#6C5CE7', 
  },
  gradientContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingBottom: 0,
    alignItems: 'center',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap', 
    width: '100%',
  }, 
  filterContainer: {
    flexDirection: "row",
    flex: 1, 
    alignItems: "center",
    flexWrap: "wrap",
    paddingLeft: 15,
    gap: 8
  },  
  filterButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  selectedFilter: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderColor: "#fff",
  },
  filterText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    width: '100%',
  },
  refreshIcon: {
    fontSize: 19
  },
  refreshButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    marginRight: 32,
    marginLeft: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignSelf: 'center',
  },
  refreshButtonEmpty: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#fff",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: "#fff",
    marginTop: 10,
  },
  noProfilesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: height * 0.5,
  },
  noProfilesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#fff",
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  swiperContainer: {
    width: '100%',
    height: height * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -5,
    marginTop: -10, 
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  rightSwipeFeedback: {
    right: 20, 
    borderColor: 'rgba(32, 191, 107, 0.8)',
    borderWidth: 3,
  },
  leftSwipeFeedback: {
    left: 20, 
    borderColor: 'rgba(255, 107, 107, 0.8)',
    borderWidth: 3,
  },
  swipeIcon: {
    fontSize: 30, 
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    height: height * 0.75, 
    width: width * 0.9,
    marginTop: -80,
    marginLeft: 10,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
    elevation: 10,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'rgba(108, 92, 231, 0.05)',
  },
  scrollableContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  profileImage: {
    width: width * 0.16,
    height: width * 0.16,
    borderRadius: (width * 0.16) / 2,
    borderWidth: 3,
    borderColor: '#6C5CE7',
  },
  headerInfo: {
    marginLeft: 12,
    justifyContent: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: RFPercentage(2.3),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  basicInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 3,
  },
  infoText: {
    fontSize: RFPercentage(1.8),
    color: '#555',
    marginLeft: 5,
  },
  cardBody: {
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    fontSize: RFPercentage(1.6),
    color: '#444',
    marginLeft: 5,
    flex: 1, 
  },
  bioSection: {
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: RFPercentage(1.6),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  hobbiesContainer: {
    marginBottom: 8,
  },
  hobbiesText: {
    fontSize: RFPercentage(1.6),
    color: '#444',
    lineHeight: 20,
  },
  bioContainer: {
    marginBottom: 5,
  },
  bioText: {
    fontSize: RFPercentage(1.6),
    color: '#444',
    lineHeight: 20,
  },
  cardFooter: {
    padding: 10, 
    paddingBottom: 16,
    backgroundColor: 'rgba(69, 170, 242, 0.05)',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  preferencesTitle: {
    fontSize: RFPercentage(1.8),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10, 
  },
  preferencesContainer: {
    marginBottom: 0,
    paddingBottom: 10,
  },  
  preferenceItem: {
    width: '48%',
    flexDirection: 'column',
    marginBottom: 8,
    padding: 5, 
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  preferenceLabel: {
    fontSize: RFPercentage(1.5), 
    color: '#666',
    marginTop: 1, 
  },
  preferenceValue: {
    fontSize: RFPercentage(1.6),
    color: '#333',
    fontWeight: '500',
  },
  swipeHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  swipeHintLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeHintRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swipeHintTextLeft: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  swipeHintTextRight: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
});

export default SwipeScreen;