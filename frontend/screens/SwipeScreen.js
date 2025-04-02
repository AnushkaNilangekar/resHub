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
  //state variables
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

  // handle swipe on a card
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
        colors={[COLORS.gradientStart, COLORS.accent2, '#2d98da', COLORS.primaryDark]}
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
                          colors={[COLORS.primary, COLORS.primaryLight]}
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
                            
                            {/* Highlighted Bio Section */}
                            <View style={styles.bioSection}>
                              <Text style={styles.sectionTitle}>Bio:</Text>
                              <Text style={styles.bioText}>{card.bio || "No bio available"}</Text>
                          </View>

                            {/* Hobbies as Tags */}
                            <View style={styles.bioSection}>
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
                                  <Ionicons name="flame-outline" size={18} color={COLORS.accent1} />
                                  <Text style={styles.preferenceLabel}>Smoking:</Text>
                                </View>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.smokingStatus || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <View style={styles.preferenceHeader}>
                                  <Ionicons name="sparkles-outline" size={18} color={COLORS.accent2} />
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
                                  <Ionicons name="volume-high-outline" size={18} color={COLORS.accent3} />
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
                                  <Ionicons name="people-outline" size={18} color={COLORS.accent4} />
                                  <Text style={styles.preferenceLabel}>Sharing:</Text>
                                </View>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.sharingCommonItems || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <View style={styles.preferenceHeader}>
                                  <Ionicons name="restaurant-outline" size={18} color={COLORS.primaryLight} />
                                  <Text style={styles.preferenceLabel}>Diet:</Text>
                                </View>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.dietaryPreference || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <View style={styles.preferenceHeader}>
                                  <Ionicons name="moon-outline" size={18} color={COLORS.primary} />
                                  <Text style={styles.preferenceLabel}>Sleep:</Text>
                                </View>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.sleepSchedule || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <View style={styles.preferenceHeader}>
                                  <Ionicons name="paw-outline" size={18} color={COLORS.accent1} />
                                  <Text style={styles.preferenceLabel}>Pets:</Text>
                                </View>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.hasPets || "N/A"}</Text>
                              </View>
                              <View style={styles.preferenceItem}>
                                <View style={styles.preferenceHeader}>
                                  <Ionicons name="person-add-outline" size={18} color={COLORS.accent2} />
                                  <Text style={styles.preferenceLabel}>Guests:</Text>
                                </View>
                                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{card.guestFrequency || "N/A"}</Text>
                              </View>
                            </View>

                            {/* Add Action Button */}
                            <TouchableOpacity 
                              style={[styles.cardAction, styles.cardActionAccent3]}
                              onPress={() => handleViewProfile(card.id)}
                            >
                              <Ionicons name="information-circle-outline" size={20} color="#fff" />
                              <Text style={styles.cardActionText}>View Full Profile</Text>
                            </TouchableOpacity>
                          </View>
                        </ScrollView>
                        
                        {/* Fixed swipe hints at bottom */}
                        <View style={styles.swipeHints}>
                          <View style={styles.swipeHintLeft}>
                            <Ionicons name="close-circle" size={24} color={COLORS.button.negative} />
                            <Text style={styles.swipeHintTextLeft}>Swipe left to pass</Text>
                          </View>
                          <View style={styles.swipeHintRight}>
                            <Text style={styles.swipeHintTextRight}>Swipe right to match</Text>
                            <Ionicons name="checkmark-circle" size={24} color={COLORS.button.positive} />
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
                          backgroundColor: COLORS.button.negative,
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
                          backgroundColor: COLORS.button.positive,
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
  
const COLORS = {
  // Primary colors
  primary: '#6C5CE7',       // Main purple
  primaryDark: '#5849BE',   // Darker purple for accents
  primaryLight: '#A29BFE',  // Lighter purple for subtle elements
  
  // Accent colors
  accent1: '#FF9FF3',      // Soft pink
  accent2: '#48DBFB',      // Cyan blue
  accent3: '#1DD1A1',      // Mint green
  accent4: '#FECA57',      // Warm yellow

  // Gradient options
  gradientStart: '#6C5CE7',
  gradientEnd: '#5849BE',
  
  // UI elements
  background: '#6C5CE7',
  card: '#FFFFFF',
  text: {
    primary: '#333333',
    secondary: '#555555',
    light: '#FFFFFF',
    muted: '#666666',
  },
  border: {
    light: 'rgba(255, 255, 255, 0.3)',
    card: '#f0f0f0',
  },
  button: {
    default: 'rgba(255, 255, 255, 0.2)',
    selected: 'rgba(255, 255, 255, 0.3)',
    positive: 'rgba(32, 191, 107, 0.8)',
    negative: 'rgba(255, 107, 107, 0.8)',
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background, 
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
    paddingLeft: 15,
    gap: 6
  },  
  filterButton: {
    paddingVertical: 5,
    paddingHorizontal: 9,
    marginHorizontal: 3,
    borderRadius: 14,
    backgroundColor: COLORS.button.default,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  selectedFilter: {
    backgroundColor: COLORS.button.selected,
    borderColor: COLORS.text.light,
  },
  filterText: {
    color: COLORS.text.light,
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
    backgroundColor: COLORS.button.default,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    alignSelf: 'center',
  },
  refreshButtonEmpty: {
    backgroundColor: COLORS.button.default,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.text.light,
  },
  actionButtonText: {
    color: COLORS.text.light,
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
    color: COLORS.text.light,
    marginTop: 8,
  },
  noProfilesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: height * 0.4,
  },
  noProfilesText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.light,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  refreshButtonText: {
    color: COLORS.text.light,
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
    position: 'absolute',
    top: '36%',
    zIndex: 100,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  rightSwipeFeedback: {
    right: 16,
    borderColor: COLORS.button.positive,
    borderWidth: 2,
  },
  leftSwipeFeedback: {
    left: 16,
    borderColor: COLORS.button.negative,
    borderWidth: 2,
  },
  swipeIcon: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    height: height * 0.73,
    width: width * 0.88,  
    marginTop: -100,
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
    borderBottomColor: COLORS.border.card,
    backgroundColor: 'rgba(108, 92, 231, 0.05)',
  },
  scrollableContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  profileImage: {
    width: width * 0.14,
    height: width * 0.14,
    borderRadius: (width * 0.14) / 2,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  headerInfo: {
    marginLeft: 10,
    justifyContent: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: RFPercentage(2.1),
    fontWeight: 'bold',
    color: COLORS.text.primary,
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
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  cardBody: {
    padding: 10,
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
    color: COLORS.text.secondary,
    marginLeft: 4,
    flex: 1, 
  },
  bioSection: {
    marginTop: 8,
    marginBottom: 8,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: RFPercentage(1.7),
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 1,
  },
  hobbiesContainer: {
    marginBottom: 0,
  },
  hobbiesText: {
    fontSize: RFPercentage(1.7),
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  bioContainer: {
    marginBottom: 4,
  },
  bioText: {
    fontSize: RFPercentage(1.7),
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  cardFooter: {
    padding: 8,
    paddingBottom: 8,
    backgroundColor: 'rgba(69, 170, 242, 0.05)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border.card,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  preferencesTitle: {
    fontSize: RFPercentage(1.8),
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  preferencesContainer: {
    marginBottom: 0,
    paddingBottom: 80,
  },  
  preferenceItem: {
    width: '48%',
    flexDirection: 'column',
    marginBottom: 15,
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: COLORS.border.card,
  },
  preferenceLabel: {
    fontSize: RFPercentage(1.5),
    color: COLORS.text.muted,
    marginTop: 4,
  },
  preferenceValue: {
    fontSize: RFPercentage(1.5),
    color: COLORS.text.primary,
    fontWeight: '500',
    marginLeft: 18,
  },
  swipeHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border.card,
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
    color: COLORS.text.muted,
    marginLeft: 4,
  },
  swipeHintTextRight: {
    fontSize: 10,
    color: COLORS.text.muted,
    marginRight: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
    marginBottom: 8,
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
    color: COLORS.text.light,
  },
  tagPrimary: {
    backgroundColor: COLORS.primary,
  },
  tagAccent1: {
    backgroundColor: COLORS.accent1,
  },
  tagAccent2: {
    backgroundColor: COLORS.accent2,
  },
  tagAccent3: {
    backgroundColor: COLORS.accent3,
  },
  tagAccent4: {
    backgroundColor: COLORS.accent4,
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
    borderLeftColor: COLORS.primary,
  },
  highlightAccent1: {
    backgroundColor: 'rgba(255, 159, 243, 0.1)',
    borderLeftColor: COLORS.accent1,
  },
  highlightAccent2: {
    backgroundColor: 'rgba(72, 219, 251, 0.1)',
    borderLeftColor: COLORS.accent2,
  },
  cardHeaderGradient: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  progressBarContainer: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressPrimary: {
    backgroundColor: COLORS.primary,
  },
  progressAccent1: {
    backgroundColor: COLORS.accent1,
  },
  progressAccent2: {
    backgroundColor: COLORS.accent2,
  },
  progressAccent3: {
    backgroundColor: COLORS.accent3,
  },
  progressAccent4: {
    backgroundColor: COLORS.accent4,
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
    backgroundColor: COLORS.primary,
  },
  cardActionAccent2: {
    backgroundColor: COLORS.accent2,
  },
  cardActionAccent3: {
    backgroundColor: COLORS.accent3,
  },
  cardActionText: {
    color: COLORS.text.light,
    fontWeight: '600',
    fontSize: RFPercentage(1.8),
    marginLeft: 5,
  }
});

export default SwipeScreen;
