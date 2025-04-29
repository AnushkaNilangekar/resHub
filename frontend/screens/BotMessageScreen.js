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
  const lastCheckedTime = useRef(new Date());

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

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        setUserId(storedUserId);
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);

        const existingConversationId = await AsyncStorage.getItem("botConversationId");
        const existingUserKey = await AsyncStorage.getItem("botUserKey");

        if (existingConversationId && existingUserKey) {
          setConversationId(existingConversationId);
          setUserKey(existingUserKey);
          await fetchMessages(existingUserKey, existingConversationId);
        } else {
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
            
            await AsyncStorage.setItem("botConversationId", conversationId);
            await AsyncStorage.setItem("botUserKey", userKey);
            
            setMessages([]);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing bot chat:", error);
        setError('Failed to connect to support bot. Please try again.');
        setIsLoading(false);
      }
    };

    initializeChat();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const initializeChat = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      setUserId(storedUserId);
      const storedToken = await AsyncStorage.getItem("token");
      setToken(storedToken);

      const existingConversationId = await AsyncStorage.getItem("botConversationId");
      const existingUserKey = await AsyncStorage.getItem("botUserKey");

      if (existingConversationId && existingUserKey) {
        setConversationId(existingConversationId);
        setUserKey(existingUserKey);
        await fetchMessages(existingUserKey, existingConversationId);
      } else {
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

  const fetchMessages = async (key, convId) => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      console.log("Using userKey:", key);
      console.log("Using conversationId:", convId);
      const response = await axios.get(
        `${config.API_BASE_URL}/api/botpress/getAllMessages`,
        {
          params: { conversationId: convId, userKey: key},
          headers: { 'Authorization': `Bearer ${storedToken}` }
        }
      );
  
      if (response.status === 200) {
        const formattedMessages = response.data.messages.map((msg, index) => ({
          _id: `msg-${Date.now()}-${index}`, 
          text: msg.payload.text,
          createdAt: new Date(msg.createdAt),
          user: {
            _id: msg.userId === userId ? userId : 'bot',
            name: msg.userId === userId ? 'You' : 'Support Bot',
          },
        }));
  
        const sortedMessages = formattedMessages.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        setMessages(sortedMessages.reverse());  
        
        lastCheckedTime.current = new Date();
      }
    } catch (error) {
      console.error("Error fetching bot messages:", error);
      setError('Unable to load messages. Please try again.');
    }
  };

  
    
  const pollNewMessages = async () => {
    if (!conversationId || !userId || !userKey) return;
    
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const response = await axios.get(
        `${config.API_BASE_URL}/api/botpress/getNewMessages`,
        {
          params: { 
            userId: userId,
            conversationId: conversationId,
            userKey: userKey  // Add this parameter
          },
          headers: { 'Authorization': `Bearer ${storedToken}` }
        }
      );
  
      if (response.status === 200 && response.data.length > 0) {
        const newBotMessages = response.data.map((msg, index) => ({
          _id: `bot-${Date.now()}-${index}`,
          text: msg.payload.text,
          createdAt: new Date(msg.createdAt),
          user: {
            _id: 'bot',
            name: 'Support Bot',
          },
        }));
  
        const sortedNewMessages = newBotMessages.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setMessages(prevMessages => [...sortedNewMessages, ...prevMessages]);
      }
      
      lastCheckedTime.current = new Date();
    } catch (error) {
      console.error("Error polling new bot messages:", error);
    }
  };

  const onSendMessage = async (text) => {
    if (text.trim()) {
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
        
      } catch (error) {
        console.error("Error sending message to bot:", error);
        setError('Unable to send message. Please try again.');
      }
    }
  };

  useEffect(() => {

    messagePollingInterval.current = setInterval(() => {
      if (conversationId && userId) {
        pollNewMessages();
      }
    }, 2000);

    return () => {
      if (messagePollingInterval.current) {
        clearInterval(messagePollingInterval.current);
      }
    };
  }, [conversationId, userId]);

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
});

export default BotChatScreen;