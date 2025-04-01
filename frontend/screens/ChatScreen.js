import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Image, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from "axios";
import config from "../config";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

/**
 * Chats Screen
 */
const ChatsScreen = () => {
  const [chats, setChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [currentUserId, setCurrentUserId] = useState(null);

  /**
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
      console.log("Getting chat IDs for user", userId, response.data);

      return response.data;
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  }

  /**
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
            userId: otherUserId,
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

  /**
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

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("userId").then(id => setCurrentUserId(id));
      // Initial fetch
      getChatInformation();

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
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#4c6ef5', '#6C85FF', '#6BBFBC', '#2a47c3']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.4, 0.7, 1]}
      >
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubbles" size={30} color="#fff" />
            </View>
            <Text style={styles.appName}>ResHub</Text>
          </View>
          <Text style={styles.headerTitle}>Your Conversations</Text>
        </View>
        
        <View style={styles.contentContainer}>
          {chats.length === 0 ? (
            <ScrollView 
              contentContainerStyle={styles.noChatsContainer} 
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
              <View style={styles.noChatsIconContainer}>
                <Ionicons name="chatbubbles-outline" size={60} color="#fff" />
              </View>
              <Text style={styles.noChatsText}>No conversations yet</Text>
              <Text style={styles.noChatsSubText}>
                When you connect with others, your conversations will appear here
              </Text>
            </ScrollView>
          ) : (
            <FlatList
              data={chats}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.listContent}
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
                    onPress={() => navigation.navigate("MessageScreen", { 
                      chatId: item.chatId, 
                      otherUserId: item.otherUserId, 
                      name: item.fullName 
                    })}
                  >
                    <View style={styles.profilePicContainer}>
                      {item.profilePicUrl ? (
                        <Image source={{ uri: item.profilePicUrl }} style={styles.profilePic} />
                      ) : (
                        <View style={styles.defaultProfilePic}>
                          <Ionicons name="person" size={32} color="#fff" />
                        </View>
                      )}
                      {isUnreadForCurrentUser && <View style={styles.unreadBadge} />}
                    </View>
                    
                    <View style={styles.textContainer}>
                      <Text style={styles.fullName}>{item.fullName}</Text>
                      <Text 
                        style={[
                          styles.lastMessage,
                          isUnreadForCurrentUser && styles.unreadMessage
                        ]}
                        numberOfLines={1}
                      >
                        {item.lastMessage}
                      </Text>
                    </View>
                    
                    <View style={styles.chevronContainer}>
                      <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.6)" />
                    </View>
                  </TouchableOpacity>
                );
              }}
              refreshControl={
                <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh}
                  tintColor="#fff"
                  colors={["#fff"]}
                />
              }
            />
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4c6ef5',
  },
  gradient: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    marginTop: 5,
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  listContent: {
    paddingVertical: 10,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  unreadChatCard: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  profilePicContainer: {
    position: 'relative',
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  defaultProfilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  unreadBadge: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    right: 0,
    top: 0,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  fullName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  unreadMessage: {
    fontWeight: "600",
    color: "#fff",
  },
  chevronContainer: {
    paddingHorizontal: 5,
  },
  noChatsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  noChatsIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  noChatsText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: 'center',
  },
  noChatsSubText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: 'center',
    lineHeight: 22,
  }
});

export default ChatsScreen;