import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
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
  ActivityIndicator
} from "react-native";
import Chat from "@codsod/react-native-chat";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import config from "../config";
import { LinearGradient } from 'expo-linear-gradient';

const BotChatScreen = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userKey, setUserKey] = useState("");
  const [conversationId, setConversationId] = useState("");
  const navigation = useNavigation();
  const [error, setError] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const messagePollingInterval = useRef(null);

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

  // Initialize or get existing chat
  const initializeChat = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      setUserId(storedUserId);
      const storedToken = await AsyncStorage.getItem("token");
      setToken(storedToken);

      // Check if we already have a bot conversation
      const existingConversationId = await AsyncStorage.getItem("botConversationId");
      const existingUserKey = await AsyncStorage.getItem("botUserKey");

      if (existingConversationId && existingUserKey) {
        setConversationId(existingConversationId);
        setUserKey(existingUserKey);
        await fetchMessages(existingUserKey, existingConversationId);
      } else {
        // Create a new chat with the bot
        const response = await axios.post(
          `${config.API_BASE_URL}/api/botpress/createChat`, 
          {},
          {
            params: { userId: storedUserId },
            headers: { 'Authorization': `Bearer ${storedToken}` }
          }
        );

        if (response.status === 200) {
          const { userKey, conversationId } = response.data;
          setUserKey(userKey);
          setConversationId(conversationId);
          
          // Store for future sessions
          await AsyncStorage.setItem("botConversationId", conversationId);
          await AsyncStorage.setItem("botUserKey", userKey);
          
          await fetchMessages(userKey, conversationId);
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing bot chat:", error);
      setError('Failed to connect to support bot. Please try again.');
      setIsLoading(false);
    }
  };

  // Fetch messages from the bot conversation
  const fetchMessages = async (key, convId) => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const response = await axios.get(
        `${config.API_BASE_URL}/api/botpress/getAllMessages`,
        {
          params: { conversationId: convId },
          headers: { 'Authorization': `Bearer ${storedToken}` }
        }
      );

      if (response.status === 200) {
        // Format bot messages for the chat component
        const formattedMessages = response.data.messages.map((msg, index) => ({
          _id: index + 1,
          text: msg.payload.text,
          createdAt: new Date(msg.createdAt),
          user: {
            _id: msg.userId === userId ? userId : 'bot',
            name: msg.userId === userId ? 'You' : 'Support Bot',
          },
        }));

        setMessages(formattedMessages.reverse()); // Most recent at the bottom
      }
    } catch (error) {
      console.error("Error fetching bot messages:", error);
      setError('Unable to load messages. Please try again.');
    }
  };

  // Poll for new messages from the bot
  const pollNewMessages = async () => {
    if (!conversationId || !userId) return;
    
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const response = await axios.get(
        `${config.API_BASE_URL}/api/botpress/getNewMessages`,
        {
          params: { 
            userId: userId,
            conversationId: conversationId 
          },
          headers: { 'Authorization': `Bearer ${storedToken}` }
        }
      );

      if (response.status === 200 && response.data.length > 0) {
        // Add any new messages from the bot
        const newBotMessages = response.data.map((msg, index) => ({
          _id: `bot-${Date.now()}-${index}`,
          text: msg.payload.text,
          createdAt: new Date(msg.createdAt),
          user: {
            _id: 'bot',
            name: 'Support Bot',
          },
        }));

        setMessages(prevMessages => [...newBotMessages.reverse(), ...prevMessages]);
      }
    } catch (error) {
      console.error("Error polling new bot messages:", error);
    }
  };

  // Handle sending a message to the bot
  const onSendMessage = async (text) => {
    if (text.trim()) {
      // Add the user message to the chat immediately
      const newMessage = {
        _id: Date.now(),
        text: text,
        createdAt: new Date(),
        user: {
          _id: userId,
          name: 'You',
        },
      };
      
      setMessages(prevMessages => [newMessage, ...prevMessages]);

      try {
        await axios.post(
          `${config.API_BASE_URL}/api/botpress/sendMessage`,
          {},
          {
            params: {
              userId: userId,
              conversationId: conversationId,
              message: text
            },
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        
        // The polling will pick up the bot's response
      } catch (error) {
        console.error("Error sending message to bot:", error);
        setError('Unable to send message. Please try again.');
      }
    }
  };
  const handleClearHistory = async () => {
    if (!conversationId) return;
    
    try {
      const storedToken = await AsyncStorage.getItem("token");
      await axios.delete(`${config.API_BASE_URL}/api/botpress/clearBotChat`, {
        params: { conversationId },
        headers: { 'Authorization': `Bearer ${storedToken}` }
      });
  
      setMessages([]); // Clear UI instantly
      Alert.alert("Chat history cleared!");
    } catch (error) {
      console.error("Error clearing chat history:", error);
      setError("Failed to clear chat history.");
    }
  };  

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#4c6ef5', '#6C85FF', '#6BBFBC', '#2a47c3']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.4, 0.7, 1]}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Connecting to support...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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

        <TouchableOpacity 
            style={styles.clearButton} 
            onPress={handleClearHistory}
        >
            <Ionicons name="trash-outline" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
            <Ionicons name="logo-android" size={24} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Support Bot</Text>
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
              inputBackgroundColor="rgba(255, 255, 255, 0.2)"
              placeholder="Ask the support bot a question..."
              user={{
                _id: userId,
                name: 'You',
              }}
              backgroundColor="transparent"
              placeholderColor="rgba(255, 255, 255, 0.7)"
              showEmoji={false}
              showAttachment={false}
              timeContainerColor="rgba(255, 255, 255, 0.2)"
              timeContainerTextColor="white"
              senderBubbleColor="rgba(255, 255, 255, 0.2)"
              receiverBubbleColor="rgba(72, 97, 201, 0.6)"
              senderTextColor="white"
              receiverTextColor="white"
              bubbleBorderRadius={16}
              messageTextSize={15}
              timeTextSize={11}
              inputHeight={50}
              inputTextColor="white"
              inputTextSize={15}
              sendButtonBackgroundColor="rgba(255, 255, 255, 0.3)"
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -5,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: "white",
    marginTop: 15,
    fontWeight: "500",
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
  clearButton: {
    padding: 8,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },  
});

export default BotChatScreen;