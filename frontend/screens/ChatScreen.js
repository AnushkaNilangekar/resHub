import React, { useEffect, useState, useCallback } from "react";
import { View, Image, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import config from "../config";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { SwipeListView } from 'react-native-swipe-list-view';

/*
* Chats Screen
*/
const ChatsScreen = () => {
  const [chats, setChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [currentUserId, setCurrentUserId] = useState(null);

  /*
  * Gets a list of the chat ids for the current user
  */
  async function getChats() {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");
      const response = await axios.get(`${config.API_BASE_URL}/api/users/getChats`, {
        params: {
          userId: userId,
        },
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      console.log("Getting chat IDs for user", userId, response.data)

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
        const userId = await AsyncStorage.getItem("userId");
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${config.API_BASE_URL}/api/users/getChatDetails`, {
          params: {
            userId: userId,
            chatId: chatId,
          },
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        const { otherUserId, lastMessage, unreadCount, lastMessageSender } = response.data;

        // Get profile info for the other user
        const profileResponse = await axios.get(`${config.API_BASE_URL}/api/getProfile`, {
          params: {
            userId: otherUserId, // Assuming email is used as the userId for the profile
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
          otherUserId,
          unreadCount,
          lastMessageSender,
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

  const handleUnmatch = async (chatId, otherUserId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(`${config.API_BASE_URL}/api/users/unMatch`, {
        userId: currentUserId,
        matchUserId: otherUserId,
        chatId: chatId,
      }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
  
      setChats(prevChats => prevChats.filter(chat => chat.chatId !== chatId));
    } catch (error) {
      console.error("Error unmatching:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("userId").then(id => setCurrentUserId(id));
      // Initial fetch
      getChatInformation();

      //removed to avoid exceeding AWS free tier limit

      // Set up interval polling every 5000ms (5 seconds)
      const interval = setInterval(() => {
        getChatInformation();
      }, 5000);

      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }, [])
  );

  const route = useRoute();

  useEffect(() => {
    if (route.params?.updatedChatId) {
      // Update the specific chat locally to remove the unread status.
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.chatId === route.params.updatedChatId ? { ...chat, unreadCount: "0" } : chat
        )
      );
    }
  }, [route.params?.updatedChatId]);



  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getChatInformation();
    setRefreshing(false);
  }, [])


  return (
    <View style={styles.container}>
      {chats.length === 0 ? (
        <ScrollView contentContainerStyle={styles.noMatchesContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <Ionicons name="sad-outline" size={50} color="#555" />
          <Text style={styles.noMatchesText}>No chats yet</Text>
        </ScrollView>
      ) : (
        // <FlatList
        //   data={chats}
        //   keyExtractor={(item, index) => index.toString()}
        //   renderItem={({ item }) => {
        //     // Only apply grey if we have a currentUserId and there are unread messages AND the last message was not sent by the current user
        //     const isUnreadForCurrentUser = currentUserId
        //       ? parseInt(item.unreadCount || '0') > 0 && item.lastMessageSender !== currentUserId
        //       : false;
        //     return (
          <SwipeListView
            data={chats}
            keyExtractor={(item) => item.chatId.toString()}
            renderItem={({ item }) => {
              const isUnreadForCurrentUser = currentUserId
                ? parseInt(item.unreadCount || '0') > 0 && item.lastMessageSender !== currentUserId
                : false;
            return (
              <TouchableOpacity
                style={[
                  styles.chatCard,
                  isUnreadForCurrentUser && styles.unreadChatCard
                ]}
                onPress={() => navigation.navigate("MessageScreen", { chatId: item.chatId, otherUserId: item.otherUserId, name: item.fullName })}
              >
                {item.profilePicUrl ? (
                  <Image source={{ uri: item.profilePicUrl }} style={styles.profilePic} />
                ) : (
                  <Ionicons name="person-circle-outline" size={100} color="#ccc" />
                )}
                <View style={styles.textContainer}>
                  <Text style={styles.fullName}>{item.fullName}</Text>
                  <Text style={styles.bio}>{item.lastMessage}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          renderHiddenItem={({ item }) => (
            <View style={styles.hiddenItemContainer}>
              <TouchableOpacity
                style={styles.unmatchButton}
                onPress={() => handleUnmatch(item.chatId, item.otherUserId)}
              >
                <Text style={styles.unmatchText}>Unmatch</Text>
              </TouchableOpacity>
            </View>
          )}
          leftOpenValue={0}
          rightOpenValue={-100} // Swipe left to reveal unmatch button
          disableRightSwipe={true} // Prevent swiping right
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
  unreadChatCard: {
    backgroundColor: "#dff8ff", // a darker shade for chats with unread messages
    borderColor: "#0B185F",
    borderWidth: "0.5"
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
  },
  hiddenItemContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    height: 100,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 10,
    paddingRight: 15,
  },
  unmatchButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    height: "100%",
    borderRadius: 20,
  },
  unmatchText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
