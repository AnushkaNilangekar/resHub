import React, { useState, useEffect } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    Alert, 
    TouchableOpacity,
    Platform,
    StatusBar,
    ScrollView
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import config from "../config";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const UploadProfilePic = ({ onPictureUploaded, handleSubmit, handleBack }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to your photo library to upload a profile picture.");
      }
    };

    requestPermission();
  }, []);

  const handleSkip = () => {
    const defaultAvatarUrl = "https://reshub-profile-pics.s3.amazonaws.com/default-avatar.jpg";
    onPictureUploaded(defaultAvatarUrl);
    setSkipped(true);
    handleSubmit();
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaType: 'photo',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        setSelectedImage(uri);
        setUploadSuccess(false);
        setSkipped(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert("Upload Required", "Please select an image first.");
      return;
    }

    setUploading(true);

    const uriParts = selectedImage.split(".");
    const fileType = uriParts[uriParts.length - 1].toLowerCase();

    const formData = new FormData();
    const fileObject = {
      uri: selectedImage,
      name: `profile-pic.${fileType}`,
      type: `image/${fileType}`,
    };
    formData.append("file", fileObject);

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.post(`${config.API_BASE_URL}/api/s3/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        setUploadSuccess(true);
        onPictureUploaded(data.url);
      } else {
        Alert.alert("Upload Failed", "Server returned an error. Please try again.");
      }
    } catch (error) {
      Alert.alert("Upload Failed", "Something went wrong. Please check your connection and try again.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // Determine if the DONE button should be disabled
  // User must either have successfully uploaded a picture OR skipped
  const isDoneButtonDisabled = (selectedImage && !uploadSuccess) || (!selectedImage && !skipped);

  return (
    <>
      {/* First, fill the screen with solid color to avoid any white gaps */}
      <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#4d6ef5',
          zIndex: 0
      }} />
      
      {/* Then add the gradient that will extend beyond screen edges */}
      <LinearGradient
          colors={['#4d6ef5', '#70b2d0', '#6BBFBC', '#4d6ef5']}
          style={{
              position: 'absolute',
              top: -5,
              left: -5,
              right: -5,
              bottom: -5,
              zIndex: 1
          }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          locations={[0, 0.45, 0.65, 1]}
      />
      
      {/* Make sure status bar is properly handled */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Main content */}
      <View style={[styles.container, { zIndex: 2 }]}>
        <ScrollView contentContainerStyle={styles.contentWrapper}>
          <View style={styles.headerContainer}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>7</Text>
            </View>
            <Text style={styles.title}>Profile Picture</Text>
            <Text style={styles.subtitle}>Add a photo to complete your profile</Text>
          </View>

          <View style={styles.imageContainer}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={80} color="rgba(255, 255, 255, 0.7)" />
              </View>
            )}

            {uploadSuccess && (
              <View style={styles.successBadge}>
                <Ionicons name="checkmark-circle" size={30} color="#4ade80" />
              </View>
            )}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <Ionicons name="image-outline" size={22} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.uploadButtonText}>
                {selectedImage ? "Change Photo" : "Select Photo"}
              </Text>
            </TouchableOpacity>

            {selectedImage && !uploadSuccess && (
              <TouchableOpacity 
                style={[styles.uploadButton, styles.confirmButton]}
                onPress={uploadImage}
                activeOpacity={0.8}
                disabled={uploading}
              >
                <Ionicons name="cloud-upload-outline" size={22} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.uploadButtonText}>
                  {uploading ? "Uploading..." : "Upload Photo"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {uploadSuccess && (
            <Text style={styles.uploadStatusText}>
              Profile picture uploaded successfully!
            </Text>
          )}

          <View style={styles.progressIndicator}>
            <View style={styles.progressDot}>
              <View style={[styles.progressDotInner, styles.progressDotCompleted]} />
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressDot}>
              <View style={[styles.progressDotInner, styles.progressDotCompleted]} />
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressDot}>
              <View style={[styles.progressDotInner, styles.progressDotCompleted]} />
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressDot}>
              <View style={[styles.progressDotInner, styles.progressDotCompleted]} />
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressDot}>
              <View style={[styles.progressDotInner, styles.progressDotCompleted]} />
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressDot}>
              <View style={[styles.progressDotInner, styles.progressDotCompleted]} />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.backButtonText}>BACK</Text>
            </TouchableOpacity>
            
            <View style={styles.rightButtons}>
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.8}
              >
                <Text style={styles.skipButtonText}>SKIP</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  isDoneButtonDisabled && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={isDoneButtonDisabled}
              >
                <Text style={[
                  styles.submitButtonText,
                  isDoneButtonDisabled && styles.disabledButtonText
                ]}>DONE</Text>
                <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color={isDoneButtonDisabled ? "rgba(255, 255, 255, 0.5)" : "#fff"} 
                  style={styles.buttonIcon} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  contentWrapper: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingBottom: 30,
    paddingTop: Platform.OS === 'ios' ? 50 : 70,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  stepIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  stepNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  placeholderImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButtons: {
    alignItems: 'center',
    marginBottom: 30,
  },
  uploadButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  confirmButton: {
    backgroundColor: 'rgba(74, 222, 128, 0.3)',
    borderColor: 'rgba(74, 222, 128, 0.5)',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadStatusText: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  progressDotCompleted: {
    backgroundColor: '#4ade80',
  },
  progressLine: {
    height: 2,
    width: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flex: 1,
    marginRight: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  rightButtons: {
    flexDirection: 'row',
    flex: 1.8,
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 10,
    flex: 1,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  submitButton: {
    backgroundColor: '#4ade80',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.5)',
    flex: 1.5,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(74, 222, 128, 0.4)',
    shadowOpacity: 0.1,
    opacity: 0.6,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  disabledButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  buttonIcon: {
    marginLeft: 8,
    marginRight: 8,
  }
});

export default UploadProfilePic;