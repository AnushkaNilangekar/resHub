import React, { useEffect, useState } from "react";
//import API_BASE_URL from "config.js
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from "react-native";
//import GestureRecognizer from "react-native-swipe-gestures";
import config from "../config";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
//import RNPickerSelect from "react-native-picker-select";

/*const API_BASE_URL = "http://localhost:8080/api"; // Update with backend URL

const HomeScreen = () => {
  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [index, setIndex] = useState(0);
  const [genderFilter, setGenderFilter] = useState("all");

  useEffect(() => {
    fetchProfiles();
  }, [genderFilter]);

  const fetchProfiles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles?gender=${genderFilter}`);
      const data = await response.json();
      setProfiles(data);
      setCurrentProfile(data[0]);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleSwipe = async (direction) => {
    if (!currentProfile) return;

    try {
      await fetch(`${API_BASE_URL}/swipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentProfile.id, decision: direction }),
      });
    } catch (error) {
      console.error("Error sending swipe decision:", error);
    }

    const nextIndex = index + 1;
    if (nextIndex < profiles.length) {
      setCurrentProfile(profiles[nextIndex]);
      setIndex(nextIndex);
    } else {
      setCurrentProfile(null);
    }
  };

  return (
    <View style={styles.container}>
      { Gender Filter }
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Gender:</Text>
        <RNPickerSelect
          onValueChange={(value) => setGenderFilter(value)}
          items={[
            { label: "All", value: "all" },
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Non-Binary", value: "non-binary" },
          ]}
          style={pickerSelectStyles}
        />
      </View>

      { Profile Cards }
      {currentProfile ? (
        <GestureRecognizer
          onSwipeLeft={() => handleSwipe("left")}
          onSwipeRight={() => handleSwipe("right")}
          style={styles.card}
        >
          <Image source={{ uri: currentProfile.imageUrl }} style={styles.image} />
          <Text style={styles.name}>{currentProfile.name}</Text>
          <Text style={styles.details}>{currentProfile.age} | {currentProfile.gender}</Text>
          <Text style={styles.bio}>{currentProfile.bio}</Text>
        </GestureRecognizer>
      ) : (
        <Text style={styles.noProfiles}>No more profiles available</Text>
      )}

      { Swipe Buttons }
      {currentProfile && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => handleSwipe("left")} style={styles.rejectButton}>
            <Text style={styles.buttonText}>❌ Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSwipe("right")} style={styles.acceptButton}>
            <Text style={styles.buttonText}>💖 Like</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3E8FF", // Soft pastel purple background
  },
  filterContainer: {
    width: "90%",
    backgroundColor: "#D7C0FF",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#5B5F97", // Deep pastel blue
  },
  card: {
    width: 320,
    height: 450,
    backgroundColor: "#FFE5EC",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: "#C0A7FF",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5B5F97",
    marginTop: 10,
  },
  details: {
    fontSize: 16,
    color: "#868686",
    marginTop: 5,
  },
  bio: {
    fontSize: 14,
    color: "#6C567B",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 15,
  },
  noProfiles: {
    fontSize: 18,
    color: "#6C567B",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  rejectButton: {
    backgroundColor: "#FFB3C6",
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  acceptButton: {
    backgroundColor: "#C0A7FF",
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});

// Picker Select Styles
const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#5B5F97",
    borderRadius: 8,
    backgroundColor: "#FFF",
    color: "#5B5F97",
    width: 200,
    textAlign: "center",
  },
  inputAndroid: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#5B5F97",
    borderRadius: 8,
    backgroundColor: "#FFF",
    color: "#5B5F97",
    width: 200,
    textAlign: "center",
  },
};*/



const SwipeScreen = () => {
    const [profiles, setProfiles] = useState([]);
    const [selectedGender, setSelectedGender] = useState("All");
  
    useEffect(() => {
      fetchProfiles();
    }, [selectedGender]);
  
    const fetchProfiles = async () => {
      try {
          // No need to fetch the token for /getProfiles since it's public
          const response = await axios.get(`${config.API_BASE_URL}/api/getProfiles`, {
              params: { genderFilter: selectedGender },
              headers: {
                  "Content-Type": "application/json"
              }
          });
  
          if (!response.ok) {
              throw new Error(`HTTP Error! Status: ${response.status}`);
          }
  
          const text = await response.text(); // Read response as text
          console.log("Raw API Response:", text); // Log raw response for debugging
  
          if (!text.trim()) {
              console.warn("Empty API response, setting empty profiles list.");
              setProfiles([]); // Handle empty response safely
              return;
          }
  
          const data = JSON.parse(text); // Attempt to parse JSON
          setProfiles(data);
      } catch (error) {
          console.error("Error fetching profiles:", error);
      }
  };
  
  
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profiles for You</Text>
  
        {/* Gender Filter Buttons */}
        <View style={styles.filterContainer}>
          {["All", "Male", "Female", "Non-binary"].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[styles.filterButton, selectedGender === gender && styles.selectedFilter]}
              onPress={() => setSelectedGender(gender)}
            >
              <Text style={styles.filterText}>{gender}</Text>
            </TouchableOpacity>
          ))}
        </View>
  
        {/* Profile Cards */}
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.profileCard}>
              <Text style={styles.profileName}>{item.name}</Text>
              <Text style={styles.profileGender}>{item.gender}</Text>
              <Text style={styles.profileBio}>{item.bio}</Text>
            </View>
          )}
        />
      </View>
    );
  };  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5E6F7", // Pastel Purple
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E90FF", // Blue
    textAlign: "center",
    marginBottom: 10,
    marginTop: 10
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#FFC0CB", // Pastel Pink
  },
  selectedFilter: {
    backgroundColor: "#1E90FF", // Blue
  },
  filterText: {
    color: "#fff",
    fontWeight: "bold",
  },
  profileCard: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6A5ACD", //Purple
  },
  profileGender: {
    fontSize: 14,
    color: "#888",
  },
  profileBio: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },
});

export default SwipeScreen;
