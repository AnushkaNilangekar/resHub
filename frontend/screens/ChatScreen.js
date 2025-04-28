import React, { useEffect, useState, useCallback, useRef } from "react";
import { 
  View, 
  Image, 
  Text, 
  StyleSheet, 
  RefreshControl, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import config from "../config";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors.js';

/*
* Chat Screen
*/
const ChatScreen = () => {
  const [chats, setChats] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [error, setError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [currentUserName, setCurrentUserName] = useState('');

  const MAX_MESSAGE_LENGTH = 25;

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(5000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setError(''));
    }
  }, [error, fadeAnim]);

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

      return response.data;
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Unable to fetch your chats. Please try again.');
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

        const { otherUserId, lastMessage, unreadCount, lastMessageSender, groupName, isGroupChat } = response.data;

        if (isGroupChat === "false") {
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
            isGroupChat
          });
 
        } else {
          // For group chats, use the group name and a placeholder for the profile picture
          chatDetails.push({
            chatId,
            fullName: groupName,
            profilePicUrl: null, // Placeholder for group chat
            lastMessage,
            otherUserId: null,
            unreadCount,
            lastMessageSender,
            isGroupChat,
          });

        }

        // console.log(currentUserId)

        const userId1 = await AsyncStorage.getItem("userId");

        const profileResponseOne = await axios.get(`${config.API_BASE_URL}/api/getProfile`, {
          params: {
            userId: userId1, // Assuming email is used as the userId for the profile
          },
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        setCurrentUserName(profileResponseOne.data.fullName);


       
      } catch (error) {
        console.error(`Error fetching chat details for ${chatId}:`, error);
        setError('Unable to load some chat details. Please try again.');
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
      setChats([{ isCreateGroup: true, chatId: 'create-group-chat' }, ...details]);
    } else {
      setChats([{ isCreateGroup: true, chatId: 'create-group-chat' }]);
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
      setError('Unable to unmatch. Please try again.');
    }
  };

  const handleLeaveChat = async (chatId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(`${config.API_BASE_URL}/api/users/leaveChat`, {
        userId: currentUserId,
        chatId: chatId,
      }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
  
      setChats(prevChats => prevChats.filter(chat => chat.chatId !== chatId));
    } catch (error) {
      console.error("Error unmatching:", error);
      setError('Unable to unmatch. Please try again.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        const id = await AsyncStorage.getItem("userId");
        setCurrentUserId(id);
  
        await getChatInformation();
        setLoading(false);
      };
  
      fetchData();
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
  
  // Helper function to truncate message text
  const truncateMessage = (message) => {
    if (!message) return "";
    return message.length > MAX_MESSAGE_LENGTH 
      ? `${message.substring(0, MAX_MESSAGE_LENGTH)}...` 
      : message;
  };

  const LoadingItem = ({ itemLoading }) => {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading {itemLoading}...</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#6C5CE7', '#45aaf2', '#2d98da', '#3867d6']}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.4, 0.7, 1]}
        >
          <LoadingItem itemLoading="Chat" />
        </LinearGradient>
      </SafeAreaView>
    );
  }
  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#4c6ef5', '#6C85FF', '#6BBFBC', '#2a47c3']}
        style={[styles.gradient, { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.4, 0.7, 1]}
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="chatbubbles" size={28} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Chats</Text>
          </View>
        </View>
        
        {error ? (
          <Animated.View 
            style={[
              styles.errorContainer, 
              { opacity: fadeAnim }
            ]}
          >
            <Ionicons name="alert-circle-outline" size={18} color="#FF6B6B" />
            <Text style={styles.error}>{error}</Text>
          </Animated.View>
        ) : null}

        <View style={styles.contentContainer}>
          {chats.length === 0 ? (
            <ScrollView 
              contentContainerStyle={styles.noMatchesContainer} 
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#fff"]} tintColor="#fff" />}
            >
              <View style={styles.emptyStateIconContainer}>
                <Ionicons name="chatbubbles-outline" size={60} color="#fff" />
              </View>
              <Text style={styles.noMatchesText}>No chats yet</Text>
              <Text style={styles.noMatchesSubText}>
                Start matching with people to begin conversations
              </Text>
            </ScrollView>
          ) : (
            <SwipeListView
              data={chats}
              keyExtractor={(item) => item.chatId.toString()}
              renderItem={({ item }) => {
                if (item.isCreateGroup) {
                  return (
                    <TouchableOpacity
                      style={styles.chatCard}
                      onPress={() => navigation.navigate("CreateGroupScreen", { chatList: chats })}
                    >
                      <View style={styles.profileContainer}>
                        <View style={styles.profilePlaceholder}>
                          <Ionicons name="add" size={32} color="rgba(255, 255, 255, 0.9)" />
                        </View>
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.createGroupText}>Create Group Chat</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }
                const isUnreadForCurrentUser = currentUserId
                  ? parseInt(item.unreadCount || '0') > 0 && item.lastMessageSender !== currentUserId
                  : false;
                return (
                  <TouchableOpacity
                    style={[
                      styles.chatCard,
                      isUnreadForCurrentUser && styles.unreadChatCard
                    ]}
                    onPress={() => navigation.navigate("MessageScreen", { chatId: item.chatId, otherUserId: item.otherUserId, name: currentUserName, otherName: item.fullName })}
                  >
                    <View style={styles.profileContainer}>
                    {item.isGroupChat === "true" ? (
                      <TouchableOpacity
                        onPress={() => navigation.navigate("GroupParticipantsScreen", { chatId: item.chatId })}
                      >
                        <View style={styles.profilePlaceholder}>
                          <Ionicons name="people-outline" size={40} color="rgba(255, 255, 255, 0.8)" />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => navigation.navigate("ProfileScreen", { userId: item.otherUserId })}
                      >
                        {item.profilePicUrl && item.profilePicUrl.trim() !== "" ? (
                          <Image source={{ uri: item.profilePicUrl }} style={styles.profilePic} />
                        ) : (
                          <View style={styles.profilePlaceholder}>
                            <Ionicons name="person" size={40} color="rgba(255, 255, 255, 0.8)" />
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                      {isUnreadForCurrentUser && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadBadgeText}>
                            {parseInt(item.unreadCount)}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.fullName} numberOfLines={1}>
                        {item.fullName}
                      </Text>
                      <Text style={styles.lastMessage} numberOfLines={1}>
                        {truncateMessage(item.lastMessage)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
              renderHiddenItem={({ item }) => {
                if (item.isCreateGroup) return null;
                return (
                  <View style={styles.hiddenItemContainer}>
                    {item.isGroupChat === 'true' ? (
                      <TouchableOpacity
                        style={styles.unmatchButton}
                        onPress={() => handleLeaveChat(item.chatId)}
                      >
                        <View style={styles.unmatchIconContainer}>
                          <Ionicons name="exit-outline" size={24} color="#fff" />
                        </View>
                        <Text style={styles.unmatchText}>Leave</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.unmatchButton}
                        onPress={() => handleUnmatch(item.chatId, item.otherUserId)}
                      >
                        <View style={styles.unmatchIconContainer}>
                          <Ionicons name="trash-outline" size={24} color="#fff" />
                        </View>
                        <Text style={styles.unmatchText}>Unmatch</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }}
              leftOpenValue={0}
              rightOpenValue={-110}
              disableRightSwipe={true}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#fff"]} tintColor="#fff" />}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background, 
  },
  container: {
    flex: 1,
    backgroundColor: '#4c6ef5',
  },
  createGroupText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlignVertical: 'center', // vertical alignment (Android only)
    textAlign: 'left', // keep horizontal alignment same as others
  },
  gradient: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    marginBottom: 30,
    marginTop: 50,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: "#FF6B6B",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  error: {
    color: "#FF6B6B",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
      fontSize: 16,
      color: colors.text.light,
      marginTop: 8,
  },
  noMatchesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyStateIconContainer: {
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
  noMatchesText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  noMatchesSubText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: 'center',
    maxWidth: '80%',
  },
  chatCard: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginBottom: 10,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    height: 85,
  },
  unreadChatCard: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  profileContainer: {
    position: 'relative',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
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
  fullName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#fff",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    backgroundColor: "#ff6b6b",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 1,
  },
  unreadBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  hiddenItemContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    height: 85,
    marginBottom: 10,
    borderRadius: 12,
    paddingRight: 0,
  },
  unmatchIconContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 45,
    height: 45,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  unmatchButton: {
    backgroundColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  unmatchText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 6,
    letterSpacing: 0.5,
  }
});

export default ChatScreen;