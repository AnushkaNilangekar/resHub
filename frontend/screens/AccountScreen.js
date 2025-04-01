import React, { useState, useEffect, useContext } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    ScrollView, 
    ActivityIndicator, 
    TouchableOpacity, 
    RefreshControl, 
    StatusBar,
    Platform,
    Alert
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import config from '../config';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AccountService from '../screens/AccountService';

const AccountScreen = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    setProfileData(null); 
    await logout();
    navigation.navigate({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };
  
  const handleDeleteAccount = () => {
    // First confirmation alert
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => confirmDeleteAccount()
        }
      ]
    );
  };

  const confirmDeleteAccount = () => {
    // Second confirmation alert
    Alert.alert(
      "Confirm Deletion",
      "All your profile data, matches, and messages will be permanently deleted. This cannot be undone. Are you absolutely sure?",
      [
        { text: "No, Keep My Account", style: "cancel" },
        { 
          text: "Yes, Delete My Account", 
          style: "destructive",
          onPress: () => performDeleteAccount()
        }
      ]
    );
  };

  const performDeleteAccount = async () => {
    setDeleting(true);
    try {
      const result = await AccountService.deleteAccount();
      
      if (result.success) {
        await logout();
        Alert.alert(
          "Account Deleted",
          "Your account has been successfully deleted.",
          [
            { 
              text: "OK", 
              onPress: () => {
                navigation.navigate({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }
          ]
        );
      } else {
        throw new Error(result.error || "Failed to delete account");
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert(
        "Error",
        "Failed to delete your account. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setDeleting(false);
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
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to change your profile picture.');
        }
      }
    })();

    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate({
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

  const handleChangeProfilePicture = async () => {
    try {
      // Launch image picker
       let result = await ImagePicker.launchImageLibraryAsync({
              mediaType: 'photo',
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
        });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        uploadImage(selectedImage);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadImage = async (imageData) => {
    setUploading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");
      
      if (!token || !userId) {
        throw new Error("No authentication token or user ID found");
      }

      // Create form data for image upload
      const formData = new FormData();
      const fileUri = Platform.OS === 'ios' ? imageData.uri.replace('file://', '') : imageData.uri;
      const fileExt = fileUri.split('.').pop();
      const fileName = `profile-pic-${userId}.${fileExt}`;
      
      formData.append('file', {
        uri: imageData.uri,
        name: fileName,
        type: `image/${fileExt}`
      });

      // Upload to S3
      const uploadResponse = await axios.post(
        `${config.API_BASE_URL}/api/s3/upload`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (uploadResponse.data && uploadResponse.data.url) {
        // Update profile with new image URL
        await updateProfilePicture(userId, uploadResponse.data.url);
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Upload Failed', 'Unable to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const updateProfilePicture = async (userId, profilePicUrl) => {
    try {
      const token = await AsyncStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      // Update profile picture URL in database
      const updateResponse = await axios.put(
        `${config.API_BASE_URL}/api/updateProfilePic`,
        { userId, profilePicUrl },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (updateResponse.status === 200) {
        // Update local state to show new profile picture
        setProfileData(prev => ({
          ...prev,
          profilePicUrl: profilePicUrl
        }));
        
        Alert.alert('Success', 'Profile picture updated successfully');
      } else {
        throw new Error("Failed to update profile picture");
      }
    } catch (error) {
      console.error('Error updating profile picture in database:', error);
      Alert.alert('Update Failed', 'Unable to update profile picture. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#7B4A9E', '#9D67C1', '#9775E3', '#6152AA']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.3, 0.6, 1]}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </LinearGradient>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#7B4A9E', '#9D67C1', '#9775E3', '#6152AA']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.3, 0.6, 1]}
        >
          <Ionicons name="alert-circle-outline" size={50} color="#FFFFFF" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchProfileData}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#7B4A9E', '#9D67C1', '#9775E3', '#6152AA']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.3, 0.6, 1]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FFFFFF"]} tintColor="#FFFFFF" />}
        >
          {/* Header with Settings */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => navigation.navigate('Settings')}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Profile Picture */}
          <View style={styles.profileImageContainer}>
            {uploading ? (
              <View style={[styles.profileImage, styles.uploadingContainer]}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : (
              <Image
                source={{ uri: profileData?.profilePicUrl || 'https://reshub-profile-pictures.s3.amazonaws.com/default-avatar.jpg' }}
                style={styles.profileImage}
                onError={() => setProfileData(prev => ({ ...prev, profilePicUrl: 'https://reshub-profile-pictures.s3.amazonaws.com/default-avatar.jpg' }))}
              />
            )}
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={handleChangeProfilePicture}
              disabled={uploading}
            >
              <Ionicons name="pencil" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Name and Email */}
          <View style={styles.nameContainer}>
            <Text style={styles.nameText}>{profileData?.fullName || 'N/A'}</Text>
            {profileData?.email && profileData.email !== 'N/A' && (
              <Text style={styles.emailText}>{profileData.email}</Text>
            )}
          </View>

          {/* Information Cards */}
          <View style={styles.cardsContainer}>
            {/* Basic Information */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="person" size={22} color="#7B4A9E" style={styles.cardIcon} />
                <Text style={styles.cardTitle}>Basic Information</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Age</Text>
                  <Text style={styles.infoValue}>{profileData?.age || 'N/A'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Gender</Text>
                  <Text style={styles.infoValue}>{profileData?.gender || 'N/A'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Residence</Text>
                  <Text style={styles.infoValue}>{profileData?.residence || 'N/A'}</Text>
                </View>
              </View>
            </View>

            {/* Academic Information */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="school" size={22} color="#7B4A9E" style={styles.cardIcon} />
                <Text style={styles.cardTitle}>Academic Information</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Major</Text>
                  <Text style={styles.infoValue}>{profileData?.major || 'N/A'}</Text>
                </View>
                {profileData?.minor && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Minor</Text>
                      <Text style={styles.infoValue}>{profileData.minor}</Text>
                    </View>
                  </>
                )}
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Graduation</Text>
                  <Text style={styles.infoValue}>{profileData?.graduationYear || 'N/A'}</Text>
                </View>
              </View>
            </View>

            {/* Hobbies */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="heart" size={22} color="#7B4A9E" style={styles.cardIcon} />
                <Text style={styles.cardTitle}>Hobbies</Text>
              </View>
              <View style={styles.cardContent}>
                {profileData?.hobbies?.length ? (
                  <View style={styles.hobbiesContainer}>
                    {profileData.hobbies.map((hobby, index) => (
                      <View key={index} style={styles.hobbyTag}>
                        <Text style={styles.hobbyText}>{hobby}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No hobbies listed</Text>
                )}
              </View>
            </View>

            {/* Bio */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="document-text" size={22} color="#7B4A9E" style={styles.cardIcon} />
                <Text style={styles.cardTitle}>Bio</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.bioText}>{profileData?.bio || 'No bio available'}</Text>
              </View>
            </View>
          </View>

             {/* Logout Button */}
             <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={22} color="#FFFFFF" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          {/* Danger Zone */}
          <View style={styles.dangerSection}>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={20} color="#FFFFFF" style={styles.deleteIcon} />
                  <Text style={styles.deleteButtonText}>Delete Account</Text>
                </>
              )}
            </TouchableOpacity>
            
            <Text style={styles.dangerDescription}>
              This action will permanently remove your account, profile, matches, and all associated data.
            </Text>
          </View>

        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7B4A9E',
  },
  gradient: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0, 
    top: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7B4A9E',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
    paddingTop: Platform.OS === 'ios' ? 50 : 70,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  headerTitle: {
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingsButton: {
    position: 'absolute',
    right: 20,
    bottom: -40,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 30,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  uploadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(123, 74, 158, 0.7)',
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 5,
    right: '35%',
    backgroundColor: '#7B4A9E',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  nameText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: 'rgba(123, 74, 158, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(123, 74, 158, 0.15)',
  },
  cardIcon: {
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7B4A9E',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B6B6B',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  hobbyTag: {
    backgroundColor: 'rgba(123, 74, 158, 0.15)',
    borderRadius: 30,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  hobbyText: {
    color: '#7B4A9E',
    fontWeight: '500',
    fontSize: 14,
  },
  bioText: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 15,
    color: '#888888',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 15,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#E53935',
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  dangerSection: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: 'rgba(229, 57, 53, 0.15)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E53935',
  },
  deleteButton: {
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  deleteIcon: {
    marginRight: 10,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    lineHeight: 20,
  }
});

export default AccountScreen;