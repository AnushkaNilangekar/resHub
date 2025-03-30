import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import config from '../config';
import { Feather, Ionicons } from '@expo/vector-icons';

const AccountScreen = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const navigateToEditProfile = (sectionTitle) => {
    navigation.navigate('EditProfile', { 
      profileData, 
      section: sectionTitle 
    });
  };

  const handleLogout = async () => {
    setProfileData(null); 
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const decodeToken = (token) => {
    try {
      if (!token) return null;
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      const decoded = Buffer.from(base64, 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      if (!token || !userId) {
        throw new Error("No authentication token or user ID found");
      }

      const response = await axios.get(`${config.API_BASE_URL}/api/getProfile`, {
        params: { userId: userId },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data) {
        setProfileData(response.data);
      } else {
        throw new Error("No profile data found");
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Unable to load profile. Please try again.');
      setProfileData({
        fullName: 'N/A',
        email: 'N/A',
        age: 'N/A',
        gender: 'N/A',
        residence: 'N/A',
        major: 'N/A',
        graduationYear: 'N/A',
        hobbies: [],
        bio: 'No bio available',
        profilePicUrl: 'https://reshub-profile-pictures.s3.amazonaws.com/default-avatar.jpg'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    };
    
    checkAuth();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfileData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const EditButton = ({ sectionTitle, onPress }) => (
    <TouchableOpacity 
      onPress={() => onPress(sectionTitle)} 
      style={styles.editIconButton}
    >
      <Feather name="edit-2" size={16} color="#666" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }} 
      contentContainerStyle={{ paddingBottom: 30 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >

       {/* Settings Icon */}
       <View style={styles.headerContainer}>
                <TouchableOpacity 
                    style={styles.settingsIcon}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Ionicons name="settings-outline" size={24} color="black" />
                </TouchableOpacity>
            </View>

      <View style={styles.container}>
       {/* Profile Picture Section with Edit Option */}
      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: profileData?.profilePicUrl || 'https://reshub-profile-pictures.s3.amazonaws.com/default-avatar.jpg' }}
          style={styles.profileImage}
          onError={() => setProfileData(prev => ({ ...prev, profilePicUrl: 'https://reshub-profile-pictures.s3.amazonaws.com/default-avatar.jpg' }))}
        />
      </View>
  
        {/* Name and Email Section */}
        <View style={styles.infoSection}>
          <Text style={styles.name}>{profileData?.fullName || 'N/A'}</Text>
          {profileData?.email && profileData.email !== 'N/A' && (
            <Text style={styles.email}>{profileData.email}</Text>
          )}
        </View>
  
        {/* Basic Info Section */}
        <View style={styles.infoCard}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <EditButton 
              sectionTitle="Basic Information"
              onPress={navigateToEditProfile} 
            />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Age:</Text>
            <Text style={styles.value}>{profileData?.age || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>{profileData?.gender || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Residence:</Text>
            <Text style={styles.value}>{profileData?.residence || 'N/A'}</Text>
          </View>
        </View>
  
        {/* Academic Info Section */}
        <View style={styles.infoCard}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Academic Information</Text>
            <EditButton 
              sectionTitle="Academic Information"
              onPress={navigateToEditProfile} 
            />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Major:</Text>
            <Text style={styles.value}>{profileData?.major || 'N/A'}</Text>
          </View>
          {profileData?.minor && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Minor:</Text>
              <Text style={styles.value}>{profileData?.minor}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Graduation Year:</Text>
            <Text style={styles.value}>{profileData?.graduationYear || 'N/A'}</Text>
          </View>
        </View>
  
        {/* Hobbies Section */}
        <View style={styles.infoCard}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Hobbies</Text>
            <EditButton 
              sectionTitle="Hobbies"
              onPress={navigateToEditProfile} 
            />
          </View>
          <View style={styles.hobbiesContainer}>
            {profileData?.hobbies?.length ? (
              profileData.hobbies.map((hobby, index) => (
                <View key={index} style={styles.hobbyTag}>
                  <Text style={styles.hobbyText}>{hobby}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.placeholderText}>No hobbies listed</Text>
            )}
          </View>
        </View>
  
        {/* Bio Section */}
        <View style={styles.infoCard}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Bio</Text>
            <EditButton 
              sectionTitle="Bio"
              onPress={navigateToEditProfile} 
            />
          </View>
          <Text style={styles.bioText}>{profileData?.bio || 'No bio available'}</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );   
};


const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
    padding: 16,
  },

  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  profileImage: {
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editProfilePicButton: {
    position: 'absolute',
    bottom: 0,
    right: 120,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 10, 
  },

  infoSection: {
    alignItems: 'center',
    marginBottom: 10, 
  },
  name: {
    fontSize: 24,  
    fontWeight: 'bold',  
    color: '#333', 
    textAlign: 'center',  
    marginBottom: 4, 
  },
  

  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10, 
  },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12, 
    marginBottom: 12, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 17, 
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    label: {
      fontSize: 16,
      color: '#666',
    },
    value: {
      fontSize: 16,
      color: '#333',
      fontWeight: '500',
    },
    hobbiesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    hobbyTag: {
      backgroundColor: '#e8f0fe',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
    },
    hobbyText: {
      color: '#1a73e8',
      fontSize: 14,
    },
    bioText: {
      fontSize: 16,
      color: '#333',
      lineHeight: 24,
    },
    errorText: {
      color: 'red',
      fontSize: 16,
      textAlign: 'center',
    },
    placeholderText: {
      color: '#999',
      fontSize: 14,
    },
    sectionTitleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    editIconButton: {
      padding: 8,
    },
    logoutButton: {
      backgroundColor: '#f8f8f8',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
      marginHorizontal: 20,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    logoutButtonText: {
      color: '#333',
      fontWeight: '600',
      fontSize: 16,
    },
  });

export default AccountScreen;