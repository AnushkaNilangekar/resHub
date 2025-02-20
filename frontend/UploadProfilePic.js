import React, { useState, useEffect } from "react";
import { View, Button, Text, StyleSheet, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import config from "./config";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

const UploadProfilePic = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

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
        setSelectedImage(uri); // Update the selectedImage state
        console.log('Image URI:', uri);
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
          'Content-Type': 'multipart/form-data', // Ensure the proper content type
        },
      });
  
      console.log('Response status:', response.status); // Check the status code
      if (response.status >= 200 && response.status < 300) {
        const data = response.data; // Axios automatically parses JSON response
        setUploadStatus(`Upload successful: ${data.url}`);
        Alert.alert("Success", "Image uploaded successfully!");
      } else {
        const errorData = response.data; // Assuming the error response is JSON
        setUploadStatus(`Upload failed: ${errorData.message || "Unknown error"}`);
        Alert.alert("Upload Failed", errorData.message || "Unknown error");
      }
    } catch (error) {
      setUploadStatus(`Upload failed: ${error.message}`);
      Alert.alert("Upload Failed", "Something went wrong!");
      console.error(error);
    }
  };
  
  

  return (
    <View style={styles.container}>
      <Button title="Pick an image from gallery" onPress={pickImage} />
      {selectedImage && (
        <Image source={{ uri: selectedImage }} style={styles.image} />
      )}
      <Button title="Upload Image" onPress={uploadImage} />
      {uploadStatus ? <Text>{uploadStatus}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
});

export default UploadProfilePic;