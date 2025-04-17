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
import { colors } from '../styles/colors.js';

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
  const [profileCache, setProfileCache] = useState({
    All: [],
    Male: [],
    Female: [],
    "Non-Binary": []
  });
  const [lastFetchTime, setLastFetchTime] = useState({
    All: null,
    Male: null,
    Female: null,
    "Non-Binary": null
  });

  // Cache expiration time in milliseconds (10 minutes)
  const CACHE_EXPIRATION = 10 * 60 * 1000;

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

  const isCacheExpired = (genderType) => {
    if (!lastFetchTime[genderType]) {
      return true;
    }

    const currentTime = new Date().getTime();
    return currentTime - lastFetchTime[genderType] > CACHE_EXPIRATION;
  };

  const fetchProfileCards = async (forceRefresh = false) => {
    if (!userInfo || !userInfo.userId) {
      return;
    }
    
    // Use cached profiles if available and not forcing refresh
    if (!forceRefresh && 
        profileCache[selectedGender] && 
        profileCache[selectedGender].length > 0 && 
        !isCacheExpired(selectedGender)) {

      setProfiles(profileCache[selectedGender]);
      setIsSwipedAll(false);
      return;
    }
  
    setRefreshing(true);

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
      const data = JSON.parse(rawData);
  
      if (Array.isArray(data)) {
        setProfiles(data);
        
        // Update cache with the new profiles
        setProfileCache(prev => ({
          ...prev,
          [selectedGender]: data
        }));
        
        // Update the last fetch time
        setLastFetchTime(prev => ({
          ...prev,
          [selectedGender]: new Date().getTime()
        }));
        
        setIsSwipedAll(data.length === 0);
      } else {
        console.error('Received data is not an array:', data);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const checkIfMoreProfiles = () => {
    if (profiles.length > 0) {
      setIsSwipedAll(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileCards(true);
    checkIfMoreProfiles();
    setRefreshing(false);
  };
  
  // Effect for when gender filter changes or user info loads
  useEffect(() => {
    if (userInfo && userInfo.userId) {
      fetchProfileCards(false);
    }
  }, [userInfo, selectedGender]);

  const handleSwiped = (cardIndex, direction) => {
    const swipedProfile = profiles[cardIndex];
    if (!swipedProfile) return;
    
    console.log(`Swiped ${direction} on card ${swipedProfile.email}: ${swipedProfile.fullName}`);
    const swipedOnUserId = swipedProfile.userId;
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

    // reset animations
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
        colors={[colors.gradientStart, colors.accent2, '#2d98da', colors.primaryDark]}
        style={styles.gradientContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.4, 0.7, 1]}
      >

        <View style={styles.contentContainer}>
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
                        <LinearGradient
                          colors={[colors.primary, colors.primaryLight]}
                          style={[styles.cardHeader, styles.cardHeaderGradient]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        >
                          <Image source={{ uri: card.profilePicUrl }} style={styles.profileImage} />
                          <View style={styles.headerInfo}>
                            <Text style={[styles.cardTitle, {color: '#fff'}]} numberOfLines={1} ellipsizeMode="tail">{card.fullName || "No Name"}</Text>
                            <View style={styles.basicInfo}>
                              <View style={styles.infoItem}>
                                <Ionicons name="calendar-outline" size={16} color="#fff" />
                                <Text style={[styles.infoText, {color: '#fff'}]}>{card.age || "N/A"}</Text>
                              </View>
                              <View style={styles.infoItem}>
                                <Ionicons name="person-outline" size={16} color="#fff" />
                                <Text style={[styles.infoText, {color: '#fff'}]}>{card.gender || "N/A"}</Text>
                              </View>
                              <View style={styles.infoItem}>
                                <Ionicons name="calendar-number-outline" size={16} color="#fff" />
                                <Text style={[styles.infoText, {color: '#fff'}]}>{card.graduationYear || "N/A"}</Text>
                              </View>
                            </View>
                          </View>
                        </LinearGradient>

                        <ScrollView 
                          style={styles.scrollableContent} 
                          contentContainerStyle={[
                            styles.scrollContentContainer,
                            // Conditionally adjust based on hobby count
                            card.hobbies && card.hobbies.length > 4 ? 
                              { justifyContent: 'flex-start' } : 
                              { justifyContent: 'space-between' }
                          ]}
                        >
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
                            
                            {/* Highlighted Bio Section */}
                            <View style={styles.bioSection}>
                              <Text style={styles.sectionTitle}>Bio:</Text>
                              <Text style={styles.bioText}>{card.bio || "No bio available"}</Text>
                            </View>

                            {/* Hobbies as Tags */}
                            <View style={[
                              styles.bioSection,
                              // Dynamic margin adjustment based on hobbies
                              { marginBottom: card.hobbies && card.hobbies.length > 4 ? 8 : 4 }
                            ]}>
                              <Text style={styles.sectionTitle}>Hobbies:</Text>
                              <View style={styles.tagContainer}>
                                {card.hobbies?.map((hobby, index) => {
                                  // Alternate between different accent colors
                                  const tagStyles = [
                                    styles.tagPrimary,
                                    styles.tagAccent1,
                                    styles.tagAccent2,
                                    styles.tagAccent3,
                                    styles.tagAccent4
                                  ];
                                  const tagStyle = tagStyles[index % tagStyles.length];
                                  
                                  return (
                                    <View key={index} style={[styles.tag, tagStyle]}>
                                      <Text style={styles.tagText}>{hobby}</Text>
                                    </View>
                                  );
                                }) || <Text style={styles.hobbiesText}>None listed</Text>}
                              </View>
                            </View>
                          </View>

                          <View style={styles.cardFooter}>
                            <Text style={styles.preferencesTitle}>Living Preferences</Text>
                            <View style={styles.preferencesGrid}>
                              <View style={styles.preferenceItem}>
                                <View style={styles.preferenceHeader}>
                                  <Ionicons name="flame-outline" size={18} color={colors.accent1} />
                                  <Text style={styles.preferenceLabel}>Smoking:</Text>
                                </View>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.smokingStatus || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <View style={styles.preferenceHeader}>
                                  <Ionicons name="sparkles-outline" size={18} color={colors.accent2} />
                                  <Text style={styles.preferenceLabel}>Cleanliness:</Text>
                                </View>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.cleanlinessLevel || "N/A"}</Text>
                                {/* Add progress bar for visual indication */}
                                <View style={styles.progressBarContainer}>
                                  <View 
                                    style={[
                                      styles.progressBar, 
                                      styles.progressAccent2,
                                      {width: getCleanlinessPercentage(card.cleanlinessLevel)}
                                    ]} 
                                  />
                                </View>
                              </View>
                              <View style={styles.preferenceItem}>
                                <View style={styles.preferenceHeader}>
                                  <Ionicons name="volume-high-outline" size={18} color={colors.accent3} />
                                  <Text style={styles.preferenceLabel}>Noise:</Text>
                                </View>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.noiseLevel || "N/A"}</Text>
                                {/* Add progress bar for visual indication */}
                                <View style={styles.progressBarContainer}>
                                  <View 
                                    style={[
                                      styles.progressBar, 
                                      styles.progressAccent3,
                                      {width: getNoisePercentage(card.noiseLevel)}
                                    ]} 
                                  />
                                </View>
                              </View>
                              <View style={styles.preferenceItem}>
                                <View style={styles.preferenceHeader}>
                                  <Ionicons name="people-outline" size={18} color={colors.accent4} />
                                  <Text style={styles.preferenceLabel}>Sharing:</Text>
                                </View>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.sharingCommonItems || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <View style={styles.preferenceHeader}>
                                  <Ionicons name="restaurant-outline" size={18} color={colors.primaryLight} />
                                  <Text style={styles.preferenceLabel}>Diet:</Text>
                                </View>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.dietaryPreference || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <View style={styles.preferenceHeader}>
                                  <Ionicons name="moon-outline" size={18} color={colors.primary} />
                                  <Text style={styles.preferenceLabel}>Sleep:</Text>
                                </View>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.sleepSchedule || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <View style={styles.preferenceHeader}>
                                  <Ionicons name="paw-outline" size={18} color={colors.accent1} />
                                  <Text style={styles.preferenceLabel}>Pets:</Text>
                                </View>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.hasPets || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <View style={styles.preferenceHeader}>
                                  <Ionicons name="person-add-outline" size={18} color={colors.accent2} />
                                  <Text style={styles.preferenceLabel}>Guests:</Text>
                                </View>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.guestFrequency || "N/A"}</Text>
                              </View>
                            </View>
                          </View>
                        </ScrollView>
                        
                        {/* Fixed swipe hints at bottom */}
                        <View style={styles.swipeHints}>
                          <View style={styles.swipeHintLeft}>
                            <Ionicons name="close-circle" size={24} color={colors.button.negative} />
                            <Text style={styles.swipeHintTextLeft}>Swipe left to pass</Text>
                          </View>
                          <View style={styles.swipeHintRight}>
                            <Text style={styles.swipeHintTextRight}>Swipe right to match</Text>
                            <Ionicons name="checkmark-circle" size={24} color={colors.button.positive} />
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
                  stackSeparation={0}
                  animateOverlayLabelsOpacity
                  overlayLabels={{
                    left: {
                      title: 'PASS',
                      style: {
                        label: {
                          backgroundColor: colors.button.negative,
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
                          backgroundColor: colors.button.positive,
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

const getCleanlinessPercentage = (level) => {
  switch (level) {
    case 'Very Clean':
      return '100%';
    case 'Clean':
      return '75%';
    case 'Average':
      return '50%';
    case 'Relaxed':
      return '25%';
    case 'Messy':
      return '10%';
    default:
      return '0%';
  }
};

const getNoisePercentage = (level) => {
  switch (level) {
    case 'Very Quiet':
      return '10%';
    case 'Quiet':
      return '25%';
    case 'Moderate':
      return '50%';
    case 'Loud':
      return '75%';
    case 'Very Loud':
      return '100%';
    default:
      return '0%';
  }
};

const handleViewProfile = (profileId) => {
  console.log(`Viewing full profile for ID: ${profileId}`);
};
  
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background, 
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
    marginTop: 10,
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
    paddingLeft: 15
  },
  filterButton: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    marginHorizontal: 3,
    borderRadius: 14,
    backgroundColor: colors.button.default,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  selectedFilter: {
    backgroundColor: colors.button.selected,
    borderColor: colors.text.light,
  },
  filterText: {
    color: colors.text.light,
    fontWeight: "600",
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
    width: '100%',
  },
  refreshIcon: {
    fontSize: 17
  },
  refreshButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    paddingHorizontal: 6,
    borderRadius: 18,
    marginRight: 28,
    marginLeft: 4,
    backgroundColor: colors.button.default,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignSelf: 'center',
  },
  refreshButtonEmpty: {
    backgroundColor: colors.button.default,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.text.light,
  },
  actionButtonText: {
    color: colors.text.light,
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.light,
    marginTop: 8,
  },
  noProfilesContainer: {
    marginTop: RFPercentage(-70),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: height * 0.4,
  },
  noProfilesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.light,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  refreshButtonText: {
    color: colors.text.light,
    fontSize: 14,
    fontWeight: "600",
  },
  swiperContainer: {
    width: '100%',
    height: height * 0.78,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -5,
    marginTop: -25,
  },
  swipeFeedback: {
    position: "absolute",
    top: RFPercentage(15),
    zIndex: 100,
    width: 23,
    height: '85%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.transparent,
    elevation: 4,
  },
  rightSwipeFeedback: {
    right: 0,
    borderColor: colors.button.positive,
    borderWidth: 5,
  },
  leftSwipeFeedback: {
    left: 0,
    borderColor: colors.button.negative,
    borderWidth: 5,
  },
  swipeIcon: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    height: height * 0.75,
    width: width * 0.88,
    marginTop: Platform.OS == 'android' ? RFPercentage(-17) : RFPercentage(-12),
    marginLeft: 8,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.card,
    backgroundColor: 'rgba(108, 92, 231, 0.05)',
  },
  scrollableContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'space-between',
  },
  profileImage: {
    width: width * 0.14,
    height: width * 0.14,
    borderRadius: (width * 0.14) / 2,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  headerInfo: {
    marginLeft: 10,
    justifyContent: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: RFPercentage(2.1),
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 2,
  },
  
  basicInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 2,
  },
  infoText: {
    fontSize: RFPercentage(1.6),
    color: colors.text.secondary,
    marginLeft: 4,
  },
  cardBody: {
    padding: 10,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    fontSize: RFPercentage(1.7),
    color: colors.text.secondary,
    marginLeft: 4,
    flex: 1, 
  },
  bioSection: {
    marginTop: 8,
    marginBottom: 4,
    paddingBottom: 0,
    flex: 0,
  },
  sectionTitle: {
    fontSize: RFPercentage(1.7),
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 1,
  },
  hobbiesContainer: {
    marginBottom: 0,
  },
  hobbiesText: {
    fontSize: RFPercentage(1.7),
    color: colors.text.secondary,
    lineHeight: 20,
  },
  bioContainer: {
    marginBottom: 4,
  },
  bioText: {
    fontSize: RFPercentage(1.7),
    color: colors.text.secondary,
    lineHeight: 20,
  },
  cardFooter: {
    padding: 8,
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: 'rgba(69, 170, 242, 0.05)',
    borderTopWidth: 1,
    borderTopColor: colors.border.card,
    marginTop: 'auto',
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  preferencesTitle: {
    fontSize: RFPercentage(1.8),
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 6,
  },
  preferencesContainer: {
    marginBottom: 0,
    paddingBottom: 80,
  },  
  preferenceItem: {
    width: '48%',
    flexDirection: 'column',
    marginBottom: 8,
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: colors.border.card,
  },
  preferenceLabel: {
    fontSize: RFPercentage(1.5),
    color: colors.text.muted,
    marginTop: 4,
  },
  preferenceValue: {
    fontSize: RFPercentage(1.5),
    color: colors.text.primary,
    fontWeight: '500',
    marginLeft: 18,
    marginTop: 1,
    marginBottom: 1,
  },
  swipeHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: colors.border.card,
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
    fontSize: 10,
    color: colors.text.muted,
    marginLeft: 4,
  },
  swipeHintTextRight: {
    fontSize: 10,
    color: colors.text.muted,
    marginRight: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
    marginBottom: 4,
  },
  tag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: RFPercentage(1.5),
    fontWeight: '500',
    color: colors.text.light,
  },
  tagPrimary: {
    backgroundColor: colors.primary,
  },
  tagAccent1: {
    backgroundColor: colors.accent1,
  },
  tagAccent2: {
    backgroundColor: colors.accent2,
  },
  tagAccent3: {
    backgroundColor: colors.accent3,
  },
  tagAccent4: {
    backgroundColor: colors.accent4,
  },
  highlightSection: {
    marginTop: 10,
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  highlightPrimary: {
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderLeftColor: colors.primary,
  },
  highlightAccent1: {
    backgroundColor: 'rgba(255, 159, 243, 0.1)',
    borderLeftColor: colors.accent1,
  },
  highlightAccent2: {
    backgroundColor: 'rgba(72, 219, 251, 0.1)',
    borderLeftColor: colors.accent2,
  },
  cardHeaderGradient: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  progressBarContainer: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 2,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressPrimary: {
    backgroundColor: colors.primary,
  },
  progressAccent1: {
    backgroundColor: colors.accent1,
  },
  progressAccent2: {
    backgroundColor: colors.accent2,
  },
  progressAccent3: {
    backgroundColor: colors.accent3,
  },
  progressAccent4: {
    backgroundColor: colors.accent4,
  },
  cardAction: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActionPrimary: {
    backgroundColor: colors.primary,
  },
  cardActionAccent2: {
    backgroundColor: colors.accent2,
  },
  cardActionAccent3: {
    backgroundColor: colors.accent3,
  },
  cardActionText: {
    color: colors.text.light,
    fontWeight: '600',
    fontSize: RFPercentage(1.8),
    marginLeft: 5,
  }
});

export default SwipeScreen;
