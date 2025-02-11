import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import API_BASE_URL from './config';

const UploadProfilePic = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // Request permission for image picker
  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access media library is required!');
      }
    };

    requestPermission();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setSelectedImage(result.uri);
    }
  };

  const uploadImage = async () => {
    if (selectedImage) {
      const formData = new FormData();
      const uriParts = selectedImage.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('file', {
        uri: selectedImage,
        name: `profile-pic.${fileType}`,
        type: `image/${fileType}`,
      });

      //not sure what url should be in this case ?
      try {
        const response = await fetch(`${API_BASE_URL}/api/s3/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        });

        const data = await response.json();
        if (response.ok) {
          setUploadStatus(`Upload successful: ${data}`);
        } else {
          setUploadStatus(`Upload failed: ${data.message || data}`);
        }
      } catch (error) {
        setUploadStatus(`Upload failed: ${error}`);
      }
    } else {
      setUploadStatus('Please select an image first');
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
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
});

export default UploadProfilePic;
