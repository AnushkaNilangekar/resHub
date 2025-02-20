import React, { useState, useEffect } from "react";
import { View, Button, Text, StyleSheet, Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from 'expo-file-system';
import config from "./config";

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
      const response = await fetch(`${config.API_BASE_URL}/api/s3/upload`, {
        method: "POST",
        body: formData,
      });
  
      const responseText = await response.text(); // Get raw text response
      //console.log('Raw response:', responseText); // Debug logging
      //console.log('response code:', response.status);
  
      if (response.ok) {
        //const data = JSON.parse(responseText); // Parse response if valid JSON
        //setUploadStatus(`Upload successful: ${data.url}`);
        //Alert.alert("Success", "Image uploaded successfully!");
      } else {
        try {
          console.log(responseText);
          const errorData = JSON.parse(responseText); // Assuming the error response is JSON
          //setUploadStatus(`Upload failed: ${errorData.message || "Unknown error"}`);
          //Alert.alert("Upload Failed", errorData.message || "Unknown error");
        } catch (error) {
          //setUploadStatus(`Upload failed: Unable to parse error response.`);
          //Alert.alert("Upload Failed", "Unable to parse error response.");
        }
      }
    } catch (error) {
      //setUploadStatus(`Upload failed: ${error.message}`);
      //Alert.alert("Upload Failed", "Something went wrong!");
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
    flex: 1,               // Allow the container to expand fully
    justifyContent: "center", // Center the content vertically
    alignItems: "center",     // Center the content horizontally
    padding: 20,  
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
});

export default UploadProfilePic;