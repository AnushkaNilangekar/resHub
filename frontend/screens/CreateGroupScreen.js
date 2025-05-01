import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, StatusBar, ScrollView, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TextInput } from "react-native";


const CreateGroupScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const originalChatList = route.params?.chatList || [];
  const chatList = originalChatList.filter(chat => chat.isGroupChat !== "true");

  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleSelect = (user) => {
    if (selectedUsers.find(u => u.otherUserId === user.otherUserId)) {
      setSelectedUsers(prev => prev.filter(u => u.otherUserId !== user.otherUserId));
    } else {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleCreateGroup = () => {
    if (selectedUsers.length < 2) {
        alert("Please select at least two people.");
        return;
      }
    
      navigation.navigate("NameGroupScreen", {
        selectedUsers,
      });
  };

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
          <Text style={styles.headerTitle}>Select Participants</Text>
          </View>
        </View>
        {/* <Text style={styles.title}>Select People for Group Chat</Text> */}
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {chatList
            .filter(item => !item.isCreateGroup)
            .map((item) => {
              const isSelected = selectedUsers.find(u => u.otherUserId === item.otherUserId);
              return (
                <TouchableOpacity
                  key={item.chatId}
                  style={[styles.chatCard, isSelected && styles.selectedCard]}
                  onPress={() => toggleSelect(item)}
                >
                  <View style={styles.profileContainer}>
                    {item.profilePicUrl ? (
                      <Image source={{ uri: item.profilePicUrl }} style={styles.profilePic} />
                    ) : (
                      <View style={styles.profilePlaceholder}>
                        <Ionicons name="person" size={40} color="rgba(255, 255, 255, 0.8)" />
                      </View>
                    )}
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.fullName}>{item.fullName}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color="#4cd137" />
                  )}
                </TouchableOpacity>
              );
            })}
        </ScrollView>

        <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create Group</Text>
        </TouchableOpacity>
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
  selectedCard: {
    borderColor: "#4cd137",
    borderWidth: 2,
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
  createButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#3867d6',
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default CreateGroupScreen;
