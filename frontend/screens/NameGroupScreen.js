import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import config from "../config";

const NameGroupScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedUsers } = route.params;

  const [groupName, setGroupName] = useState('');

  const handleConfirm = async () => {
    if (!groupName.trim()) {
      alert("Please enter a group name.");
      return;
    }

    const currentUserId = await AsyncStorage.getItem("userId");

    const userIds = [
        currentUserId, // add current user first
        ...selectedUsers.map(user => user.otherUserId),
      ];   
    
    const token = await AsyncStorage.getItem("token");
    console.log(token);

    console.log(config.API_BASE_URL)

    try {

        const response = await axios.get(`${config.API_BASE_URL}/api/users/findMatchingGroupChat`, {
          params: {
            userIds: userIds,
          },
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (response.data) {
          console.log("Group chat already exists:", response.data);
          Alert.alert(
            "Group Already Exists",
            "A group chat with these members already exists.",
            [
              {
                text: "OK",
                onPress: () => navigation.navigate('Main', { screen: 'Chats' }),
              },
            ],
            { cancelable: false }
          );
          return;
        }
        const result = await axios.post(
            `${config.API_BASE_URL}/api/users/createGroupChat`,
            {
              userIds: userIds,
              groupName: groupName,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
        );
    
        console.log("Create group result:", result.data); // ✅ correct placement
        Alert.alert(
            "Group Created 🎉",
            `Your group "${groupName}" has been created successfully.`,
            [
                {
                text: "OK",
                onPress: () => navigation.navigate('Main', { screen: 'Chats' }),
                },
            ],
            { cancelable: false }
        );
      
    } catch (error) {
    console.error("Error creating group:", error);
    alert("Failed to create group chat.");
    }
      

    // Example: Send to backend or navigate to group chat
    console.log("Creating group:", groupName);
    console.log("Members:", selectedUsers);

    navigation.navigate("ChatScreen"); // or navigate to the group chat screen
  };

  return (
    <LinearGradient
      colors={['#4c6ef5', '#6C85FF', '#6BBFBC', '#2a47c3']}
      style={styles.container}
    >
      <View style={styles.centeredSection}>
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
            <Text style={styles.headerTitle}>Name Group Chat</Text>
            </View>
        </View>
        <TextInput
          placeholder="Enter group name"
          placeholderTextColor="#ccc"
          value={groupName}
          onChangeText={setGroupName}
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
        <Text style={styles.confirmText}>Create Group</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingBottom: 60,
      justifyContent: "space-between",
    },
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
    centeredSection: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    label: {
      fontSize: 24,
      color: "#fff",
      fontWeight: "bold",
      marginBottom: 16,
    },
    input: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: 10,
      padding: 12,
      color: "#fff",
      fontSize: 16,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
      width: "100%",
    },
    confirmButton: {
      flexDirection: 'row',
      backgroundColor: "#3867d6",
      paddingVertical: 14,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    confirmText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
      marginLeft: 8,
    },
  });

export default NameGroupScreen;
