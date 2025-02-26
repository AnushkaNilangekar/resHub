import React, { useEffect, useState, useCallback } from "react";
import { View, Image, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import config from "../config";
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useNavigation } from '@react-navigation/native';

/*
* Chats Screen
*/
const ChatsScreen = () => {
  const [chats, setChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  /*
  * Gets a list of the chat ids for the current user
  */
  async function getChats() {
    try {
      const token = await AsyncStorage.getItem("token");
      const email = await AsyncStorage.getItem("userEmail");
      const response = await axios.get(`${config.API_BASE_URL}/api/users/getChats`, {
        params: {
          userId: email,
        },
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  }

  /*
  * Gets the last message and other user details for each chat
  */
  async function getChatDetails(chatIds) {
    const chatDetails = [];

    for (const chatId of chatIds) {
      try {
        const email = await AsyncStorage.getItem("userEmail");
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${config.API_BASE_URL}/api/users/getChatDetails`, {
          params: {
            userId: email,
            chatId: chatId,
          },
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        const { otherUserEmail, lastMessage } = response.data;

        // Get profile info for the other user
        const profileResponse = await axios.get(`${config.API_BASE_URL}/api/getProfile`, {
          params: {
            userId: otherUserEmail, // Assuming email is used as the userId for the profile
          },
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        const { fullName, profilePicUrl } = profileResponse.data;
        
        chatDetails.push({
          chatId,
          fullName,
          profilePicUrl,
          lastMessage,
          otherUserEmail,
        });
      } catch (error) {
        console.error(`Error fetching chat details for ${chatId}:`, error);
      }
    }

    return chatDetails;
  }

  /*
  * Fetches the chat details and populates the UI
  */
  async function getChatInformation() {
    const chatIds = await getChats();

    if (chatIds.length > 0) {
      const details = await getChatDetails(chatIds);
      setChats(details);
    } else {
      console.log('No chats found.');
    }
  }

  useEffect(() => {
    getChatInformation();
  },[]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getChatInformation();
    setRefreshing(false);
  }, []);
  

  return (
    <View style={styles.container}>
      {chats.length === 0 ? (
              <ScrollView contentContainerStyle={styles.noMatchesContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <Ionicons name="sad-outline" size={50} color="#555" />
                <Text style={styles.noMatchesText}>No chats yet</Text>
              </ScrollView>
      ) : (
      <FlatList
        data={chats}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.chatCard}>
            {item.profilePicUrl ? (
              <Image source={{ uri: item.profilePicUrl }} style={styles.profilePic} />
            ) : (
              <Ionicons name="person-circle-outline" size={100} color="#ccc"/>
            )}

            <View style={styles.textContainer}>
              <Text style={styles.fullName}>{item.fullName}</Text>
              <Text style={styles.bio}>{item.lastMessage}</Text>
            </View>

          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      )}
    </View>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  noMatchesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 200,
  },
  noMatchesText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#555",
    marginTop: 10,
  },
  chatCard: {
    width: "100%",
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 20,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    height: 100,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  fullName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 2,
  },
  bio: {
    fontSize: 16,
    color: "#555",
  },
  chatIcon: {
    fontSize: 45,
    color: "#555",
  }
});
