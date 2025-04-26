import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  Text, 
  StatusBar,
  Animated,
  Alert,
  ActionSheetIOS
} from "react-native";
import Chat from "@codsod/react-native-chat";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import config from "../config";
import { LinearGradient } from 'expo-linear-gradient';

const MessageScreen = ({ route }) => {
  const { chatId, otherUserId, name } = route.params;
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [otherUserExists, setOtherUserExists] = useState(true);
  const navigation = useNavigation();
  const [error, setError] = useState('');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [isBlocked, setIsBlocked] = useState(false);
  const [isCurrentUserBlocked, setisCurrentUserBlocked] = useState(false);
  // Error animation effect
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

  // Set the header title dynamically
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false, // Hide the default header
    });
  }, [navigation]);

  // Check if the other user still exists
  const checkUserExists = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const response = await axios.get(`${config.API_BASE_URL}/api/users/checkUserExists`, {
        params: { userId: otherUserId },
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });
      setOtherUserExists(response.data.exists);
    } catch (error) {
      console.error("Error checking if user exists:", error);
      setOtherUserExists(false);
    }
  }, [otherUserId]);

  const fetchMessages = async () => {
    const storedUserId = await AsyncStorage.getItem("userId");
    setUserId(storedUserId);
    const storedToken = await AsyncStorage.getItem("token");
    setToken(storedToken);
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/users/getMessages`, {
        params: { chatId },
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });

      if (response.status === 200) {
        let messageId = 1;
        // Assuming the backend returns an array of messages
        const formattedMessages = response.data.map((msg, index) => ({
          _id: messageId + index,
          text: msg.text,
          createdAt: msg.createdAt,
          user: {
            _id: msg.userId,
            name: msg.name,
          },
        }));

        setMessages(formattedMessages);
      } else {
        console.error("Failed to fetch messages:", response.status);
        setError('Unable to load messages. Please try again.');
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError('Unable to load messages. Please try again.');
    }
  };

  // Handle sending a new message
  const onSendMessage = async (text) => {
    if (!otherUserExists) {
      setError('Cannot send message. The other user has deleted their account.');
      return;
    }

    if (isBlocked) {
      setError('Cannot send message. You have blocked this user.')
      return;
    }

    if (isCurrentUserBlocked) {
      setError('Cannot send message. You have been blocked by this user.')
      return;
    }
    
    if (text.trim()) {
      const requestData = {
        chatId: chatId,
        createdAt: new Date().toISOString(),
        userId: userId,
        name: name,
        text: text,
      };

      const userParams = new URLSearchParams();
      userParams.append('chatId', requestData.chatId);
      userParams.append('createdAt', requestData.createdAt);
      userParams.append('text', requestData.text);
      userParams.append('userId', requestData.userId);
      userParams.append('name', requestData.name);

      try {
        await axios.post(
          `${config.API_BASE_URL}/api/users/createMessage?${userParams.toString()}`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        fetchMessages();  // Fetch messages again to include the new message
      } catch (error) {
        console.error("Error sending message:", error);
        setError('Unable to send message. Please try again.');
      }
    }
  };

  const checkBlockedStatus = async (blockerId, blockedId) => {
    try {
        const storedToken = await AsyncStorage.getItem('token');

        const response = await axios.get(`${config.API_BASE_URL}/api/isBlocked`, {
            params: { blockerId, blockedId },
            headers: { 'Authorization': `Bearer ${storedToken}` },
        });

        console.log(`User ${blockerId} has blocked user ${blockedId}: ${response.data}`);
        return response.data; // Return the boolean result
    } catch (error) {
        console.error('Error checking blocked status:', error);
        return false; // Return false as default in case of error
    }
  };

  // Check if the OTHER user has blocked the CURRENT user
  const checkIfCurrentUserIsBlocked = async () => {
    const storedUserId = await AsyncStorage.getItem('userId');
    const isBlocked = await checkBlockedStatus(otherUserId, storedUserId);
    setisCurrentUserBlocked(isBlocked);
    console.log("Current user ", storedUserId, " is blocked:", isBlocked);
  };

  // Check if the CURRENT user has blocked the OTHER user
  const checkIfOtherUserIsBlocked = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      const isBlocked = await checkBlockedStatus(storedUserId, otherUserId);
      setIsBlocked(isBlocked);
  };

  const confirmBlockUser = () => {
    Alert.alert(
      "Block User",
      "Are you sure you want to block this user? You will no longer be able to send or receive messages.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: handleBlockUser
        }
      ]
    );
  };  

  const handleBlockUser = async () => {
    if (isBlocked) {
      Alert.alert('Already Blocked', 'You have already blocked this user.');
      return;
    }
    
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedToken = await AsyncStorage.getItem('token');
      await axios.post(`${config.API_BASE_URL}/api/blockUser`, {
        blockerId: storedUserId,
        blockedId: otherUserId,
      }, {
        headers: { 'Authorization': `Bearer ${storedToken}` },
      });
      setIsBlocked(true);
      Alert.alert('User Blocked', 'You have blocked this user.');
    } catch (error) {
      console.error('Error blocking user:', error);
      Alert.alert('Error', 'Failed to block user.');
    }
  };

  const navigateToReportScreen = () => {
    navigation.navigate('ReportScreen', {
      chatId,
      otherUserId,
      name,
      messageTimestamp: new Date().toISOString(),
      onGoBack: () => {
        // This will be called when returning from the report screen
      }
    });
  };

  const confirmReportChat = () => {
    Alert.alert(
      "Report Chat",
      "Are you sure you want to report this chat to the ResHub team? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          style: "destructive",
          onPress: handleReportChat
        }
      ]
    );
  };  

  // Handle the report button press in the header
  const handleReportChat = () => {
    navigateToReportScreen();
  };

  useEffect(() => {
    // Check if the other user exists
    checkUserExists();
    checkIfOtherUserIsBlocked();
    checkIfCurrentUserIsBlocked();

    // Mark messages as read when the screen loads
    async function markMessagesRead() {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("token");
      try {
        await axios.post(`${config.API_BASE_URL}/api/users/markMessagesAsRead`, {
          chatId: chatId,
          userId: userId,
        }, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }
    
    markMessagesRead();
    fetchMessages(); // Initial fetch

    const interval = setInterval(() => {
      fetchMessages(); // Fetch messages every 5 seconds
      markMessagesRead(); // Mark messages as read every 5 seconds
    }, 5000);

    return () => {
      clearInterval(interval);
      if (route.params?.onGoBack) {
        route.params.onGoBack(chatId);
      }
    };
  }, [chatId, checkUserExists, otherUserId]);

  

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
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>{name}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={confirmReportChat}
            >
              <Ionicons name="flag-outline" size={22} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={confirmBlockUser}
            >
              <Ionicons name="ban-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        {!otherUserExists && (
          <View style={styles.accountDeletedContainer}>
            <Ionicons name="information-circle-outline" size={18} color="#fff" />
            <Text style={styles.accountDeletedText}>
              This user has deleted their account. You can't send new messages.
            </Text>
          </View>
        )}
        
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

        <KeyboardAvoidingView
          style={styles.contentContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.chatContainer}>
            <Chat
              messages={messages}
              setMessages={(val) => onSendMessage(val)}
              themeColor="#4c6ef5"
              themeTextColor="white"
              showSenderAvatar={false}
              showReceiverAvatar={false}
              inputBorderColor="rgba(255, 255, 255, 0.3)"
              disabled={!otherUserExists || isBlocked || isCurrentUserBlocked}
              inputBackgroundColor={otherUserExists && !isBlocked && !isCurrentUserBlocked ? "rgba(255, 255, 255, 0.2)" : "rgba(100, 100, 100, 0.2)"}
              placeholder={
                !otherUserExists ? "Chat disabled (User account deleted)" : 
                isBlocked ? "Chat disabled (User blocked)" : 
                isCurrentUserBlocked ? "Chat disabled (You've been blocked)" :
                "Type a message..." 
              }
              user={{
                _id: userId,
                name: name,
              }}
              backgroundColor="transparent"
              placeholderColor="rgba(255, 255, 255, 0.7)"
              showEmoji={false}
              onPressEmoji={() => console.log("Emoji Button Pressed..")}
              showAttachment={false}
              onPressAttachment={() => console.log("Attachment Button Pressed..")}
              timeContainerColor="rgba(255, 255, 255, 0.2)"
              timeContainerTextColor="white"
              senderBubbleColor="rgba(255, 255, 255, 0.2)"
              receiverBubbleColor="rgba(76, 110, 245, 0.4)"
              senderTextColor="white"
              receiverTextColor="white"
              bubbleBorderRadius={16}
              messageTextSize={15}
              timeTextSize={11}
              inputHeight={50}
              inputTextColor="white"
              inputTextSize={15}
              sendButtonBackgroundColor={otherUserExists && !isBlocked ? "rgba(255, 255, 255, 0.3)" : "rgba(100, 100, 100, 0.3)"}
              sendButtonIconColor="white"
            />
          </View>
        </KeyboardAvoidingView>
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
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  accountDeletedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    borderLeftWidth: 3,
    borderLeftColor: "#fff",
  },
  accountDeletedText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
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
    marginTop: 10,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
});

export default MessageScreen;