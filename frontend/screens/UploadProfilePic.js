import React, { useState, useEffect } from "react";
import { View, Button, Text, StyleSheet, Image, Alert, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import config from "../config";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

const UploadProfilePic = ({ onPictureUploaded, handleSubmit, handleBack }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("Permission status:", status);
      if (status !== "granted") {
        alert("Permission to access media library is required!");
      }
    };

    requestPermission();
  }, []);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaType: 'photo',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri } = result.assets[0];
        setSelectedImage(uri); 
        //console.log('Image URI:', uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) {
      Alert.alert("Upload Failed", "Please select an image first.");
      return;
    }
  
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
          'Content-Type': 'multipart/form-data', // proper content type
        },
      });
  
      if (response.status >= 200 && response.status < 300) {
        const data = response.data; 
        Alert.alert("Success", "Image uploaded successfully!");
        setUploadSuccess(true); // Update upload status
        onPictureUploaded(data.url);
      } else {
        const errorData = response.data; 
        Alert.alert("Upload Failed", errorData.message || "Unknown error");
      }
    } catch (error) {
      Alert.alert("Upload Failed", "Something went wrong!");
      console.error(error);
    }
  };
  
  

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Upload Profile Picture</Text>
        
        <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Pick an image from gallery</Text>
        </TouchableOpacity>

        {uploadSuccess && (
        <Text style={styles.uploadStatus}>
            ✓ Image uploaded successfully - Ready to submit
          </Text>
)}

        {selectedImage && (
            <>
                <Image source={{ uri: selectedImage }} style={styles.image} />
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={uploadImage}
                >
                    <Text style={styles.buttonText}>Upload Image</Text>
                </TouchableOpacity>
            </>
        )}

        <View style={styles.buttonContainer}>
            <Button title="Back" onPress={handleBack} />
            <View style={styles.buttonSpacer} />
            <Button 
                title="Submit" 
                onPress={handleSubmit} 
                disabled={!uploadSuccess}
            />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  buttonSpacer: {
      width: 20,
  },
  uploadStatus: {
      marginTop: 10,
      color: '#007AFF',
      fontSize: 14,
  },
});


export default UploadProfilePic;