import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Alert, RefreshControl, Button } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import config from '../config';

const AccountScreen = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
    fetchProfileData();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileData();
  };

  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      let email = await AsyncStorage.getItem("userEmail");

      if (!email && token) {
        const decodedToken = decodeToken(token);
        if (decodedToken && decodedToken.sub) {
          email = decodedToken.sub; 
          await AsyncStorage.setItem("userEmail", email);
        }
      }
    
    if (!email) {
      console.log("No email found");
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
      return;
    }

    const response = await axios.get(`${config.API_BASE_URL}/api/getProfile`, {
      params: { userId: email },
      headers: { 'Authorization': `Bearer ${token}` }
    });

      
    if (response.data) {
      setProfileData(response.data);
    } else {
      setProfileData({
        fullName: 'N/A',
        email: email, 
        age: 'N/A',
        gender: 'N/A',
        residence: 'N/A',
        major: 'N/A',
        graduationYear: 'N/A',
        hobbies: [],
        bio: 'No bio available',
        profilePicUrl: 'https://reshub-profile-pictures.s3.amazonaws.com/default-avatar.jpg'
      });
    }
    } catch (error) {
      console.error('Error fetching profile:', error.response || error);
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
      <View style={styles.container}>
        {/* Profile Picture Section */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: profileData?.profilePicUrl || 'https://reshub-profile-pictures.s3.amazonaws.com/default-avatar.jpg' }}
            style={styles.profileImage}
            onError={() => setProfileData(prev => ({ ...prev, profilePicUrl: 'https://reshub-profile-pictures.s3.amazonaws.com/default-avatar.jpg' }))}
          />
        </View>
  
        {/* Name and Email Section */}
        <View style={[
          styles.infoSection, 
          !(profileData?.email && profileData.email !== 'N/A') && { marginBottom: 0 }
        ]}>
          <Text style={styles.name}>{profileData?.fullName || 'N/A'}</Text>
          {profileData?.email && profileData.email !== 'N/A' && (
            <Text style={styles.email}>{profileData.email}</Text>
          )}
        </View>
  
        {/* Basic Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
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
          <Text style={styles.sectionTitle}>Academic Information</Text>
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
          <Text style={styles.sectionTitle}>Hobbies</Text>
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
          <Text style={styles.sectionTitle}>Bio</Text>
          <Text style={styles.bioText}>{profileData?.bio || 'No bio available'}</Text>
        </View>
      </View>
      <Button title="Logout" onPress={() => logout()} />
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
  });

export default AccountScreen;
