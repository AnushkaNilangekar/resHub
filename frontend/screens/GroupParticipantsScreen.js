import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, StatusBar, ScrollView, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from "../config"; // Make sure you import your API config!

const GroupParticipantsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatId } = route.params;
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      const token = await AsyncStorage.getItem("token");
      try {
        const response = await axios.get(`${config.API_BASE_URL}/api/users/getParticipants`, {
          params: { chatId },
          headers: { Authorization: `Bearer ${token}` },
        });
        setParticipants(response.data); // assuming backend returns array of { fullName, profilePicUrl }
      } catch (error) {
        console.error("Error fetching participants:", error);
      }
    };

    fetchParticipants();
  }, [chatId]);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#4c6ef5', '#6C85FF', '#6BBFBC', '#2a47c3']}
        style={{ flex: 1, paddingTop: 60, paddingHorizontal: 16 }}
      >
         <View style={styles.headerContainer}>
            <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
                <Ionicons name="people-outline" size={24} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Group Participants</Text>
            </View>
        </View>
        {/* <Text style={styles.title}>Group Participants</Text> */}
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {participants.map((participant, index) => (
            <View
              key={index}
              style={styles.chatCard}
            >
              <View style={styles.profileContainer}>
                {participant.profilePicUrl ? (
                  <Image source={{ uri: participant.profilePicUrl }} style={styles.profilePic} />
                ) : (
                  <View style={styles.profilePlaceholder}>
                    <Ionicons name="person" size={40} color="rgba(255, 255, 255, 0.8)" />
                  </View>
                )}
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.fullName}>{participant.fullName}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
        paddingBottom: 15,
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
      },
      headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
      },
      iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
      },
      headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#fff",
        flex: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
      },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  profileContainer: {},
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  fullName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
});

export default GroupParticipantsScreen;
