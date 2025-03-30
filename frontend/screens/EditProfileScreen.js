import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  TextInput 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';

const commonHobbies = [
  "Reading", "Hiking", "Gaming", "Cooking", 
  "Traveling", "Sports", "Music", "Art", "Working Out"
];

const EditProfileScreen = ({ route, navigation }) => {
  const { profileData, section } = route.params;
  const [formData, setFormData] = useState({
    age: profileData?.age ? profileData.age.toString() : '',
  });
  
  const [editedData, setEditedData] = useState({
    gender: profileData.gender || '',
    residence: profileData.residence || '',
    age: profileData?.age ? profileData.age.toString() : '',
    major: profileData.major || '',
    minor: profileData.minor || '',
    graduationYear: profileData.graduationYear || '',
    bio: profileData.bio || ''
  });

  const [hobbies, setHobbies] = useState(
    section === 'Hobbies' 
      ? (profileData.hobbies || []) 
      : []
  );

  const toggleHobby = (hobby) => {
    if (hobbies.includes(hobby)) {
      setHobbies(hobbies.filter((currentHobby) => currentHobby !== hobby));
    } else {
      setHobbies([...hobbies, hobby]);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const validateField = (section, editedData) => {
    switch(section) {
      case 'Basic Information':
        if (!editedData.gender || editedData.gender.trim() === '') {
          Alert.alert('Validation Error', 'Gender cannot be blank');
          return false;
        }
        if (!editedData.age || isNaN(parseInt(editedData.age)) || parseInt(editedData.age) <= 0) {
          Alert.alert('Validation Error', 'Please enter a valid age');
          return false;
        }
        break;
      
      case 'Academic Information':
        if (!editedData.major || editedData.major.trim() === '') {
          Alert.alert('Validation Error', 'Major cannot be blank');
          return false;
        }
        if (!editedData.graduationYear || editedData.graduationYear.trim() === '') {
          Alert.alert('Validation Error', 'Graduation Year cannot be blank');
          return false;
        }
        // Optional: Add additional validation for graduation year (e.g., must be a 4-digit year)
        const graduationYear = parseInt(editedData.graduationYear);
        if (isNaN(graduationYear) || graduationYear < 2000 || graduationYear > 2030) {
          Alert.alert('Validation Error', 'Please enter a valid graduation year');
          return false;
        }
        break;
    }
    return true;
  };

  // render method for hobbies
  const renderHobbiesSection = () => {
    return (
      <View style={styles.hobbiesContainer}>
        <Text style={styles.sectionTitle}>Select Your Hobbies</Text>
        <View style={styles.hobbyGrid}>
          {commonHobbies.map((hobby) => (
            <TouchableOpacity
              key={hobby}
              style={[
                styles.hobbyButton,
                hobbies.includes(hobby) && styles.selectedHobbyButton
              ]}
              onPress={() => toggleHobby(hobby)}
            >
              <Text 
                style={[
                  styles.hobbyButtonText,
                  hobbies.includes(hobby) && styles.selectedHobbyButtonText
                ]}
              >
                {hobby}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // render method for input fields
  const renderInputFields = () => {
    switch(section) {
      case 'Basic Information':
        return (
          <>
            <Text style={styles.label}>Gender</Text>
            <TextInput
              style={styles.input}
              value={editedData.gender}
              onChangeText={(text) => setEditedData(prev => ({ ...prev, gender: text }))}
              placeholder="Enter your gender"
            />

            <Text style={styles.label}>Residence</Text>
            <TextInput
              style={styles.input}
              value={editedData.residence}
              onChangeText={(text) => setEditedData(prev => ({ ...prev, residence: text }))}
              placeholder="Where do you live?"
            />

            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={editedData.age}
              onChangeText={(text) => setEditedData(prev => ({ ...prev, age: text }))}
              placeholder="Enter your age"
              keyboardType="numeric"
            />
          </>
        );
      
      case 'Academic Information':
        return (
          <>
            <Text style={styles.label}>Major</Text>
            <TextInput
              style={styles.input}
              value={editedData.major}
              onChangeText={(text) => setEditedData(prev => ({ ...prev, major: text }))}
              placeholder="What's your major?"
            />

            <Text style={styles.label}>Minor (Optional)</Text>
            <TextInput
              style={styles.input}
              value={editedData.minor}
              onChangeText={(text) => setEditedData(prev => ({ ...prev, minor: text }))}
              placeholder="Do you have a minor?"
            />

            <Text style={styles.label}>Graduation Year</Text>
            <TextInput
              style={styles.input}
              value={editedData.graduationYear}
              onChangeText={(text) => setEditedData(prev => ({ ...prev, graduationYear: text }))}
              placeholder="What year do you graduate?"
              keyboardType="numeric"
            />
          </>
        );
      
      case 'Hobbies':
        return renderHobbiesSection();
      
      case 'Bio':
        return (
          <>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={editedData.bio}
              onChangeText={(text) => setEditedData(prev => ({ ...prev, bio: text }))}
              multiline
              placeholder="Tell us about yourself"
            />
          </>
        );
      
      default:
        return null;
    }
  };

  const handleSave = async () => {
    // Validate fields before saving
    if (!validateField(section, editedData)) {
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      let dataToSend = { userId };

      if (section === 'Hobbies' || (hobbies && hobbies.length > 0)) {
        dataToSend.hobbies = hobbies;
      }
  
      switch(section) {
        case 'Basic Information':
          dataToSend.gender = editedData.gender;
          dataToSend.residence = editedData.residence;
          dataToSend.age = editedData.age ? parseInt(editedData.age) : null;
          break;
        case 'Academic Information':
          dataToSend.major = editedData.major;
          dataToSend.minor = editedData.minor;
          dataToSend.graduationYear = editedData.graduationYear;
          break;
        case 'Bio':
          dataToSend.bio = editedData.bio;
          break;
      }
      
      const response = await axios.put(
        `${config.API_BASE_URL}/api/updateProfile`,
        dataToSend,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
  
      if (response.status === 200) {
        Alert.alert("Success", "Profile updated successfully");
        navigation.goBack();
      }
    } catch (error) {
      console.error('Update error:', error.response ? error.response.data : error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>{section}</Text>
      
      {section === 'Hobbies' 
        ? renderHobbiesSection() 
        : renderInputFields()}

      {/* Button Container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={handleCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]} 
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Styles remain the same as in the original code
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  multilineInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#1a73e8',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  hobbiesContainer: {
    marginTop: 20,
  },
  hobbyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  hobbyButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedHobbyButton: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  hobbyButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedHobbyButtonText: {
    color: 'white',
  },
});

export default EditProfileScreen;