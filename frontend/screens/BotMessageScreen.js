import React, { useState, useEffect, useLayoutEffect } from "react";
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  Text, 
  StatusBar,
  ActivityIndicator,
  Alert
} from "react-native";
import Chat from "@codsod/react-native-chat";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import config from "../config";
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BotMessagesScreen = () => {
  const botId = config.BOT_ID;

  const [userIdGlobal, setUserIdGlobal] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Runs on page initialization - loads message history
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setUserIdGlobal(await AsyncStorage.getItem('userId'));
      await loadMessageHistory();
      setLoading(false);
    };
  
    init();
  }, []);

  // Runs every 2 seconds - fetches new chats
  useEffect(() => {
    const interval = setInterval(fetchNewMessages, 2000);
    return () => clearInterval(interval);
  }, [fetchNewMessages]);

  const onSendMessage = async (text) => {
    if (text.trim()) {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
  
        const tempMessage = {
          _id: Date.now().toString(),
          text: text,
          createdAt: new Date(),
          user: {
            _id: userId,
            name: "You",
          },
        };
  
        setMessages(prevMessages => {
          const messagesMap = new Map();
          prevMessages.forEach(msg => messagesMap.set(msg._id, msg));
          messagesMap.set(tempMessage._id, tempMessage);
  
          return Array.from(messagesMap.values())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
  
        // Send the message to the backend
        await axios.post(
          `${config.API_BASE_URL}/api/botpress/sendMessage?userId=${userId}&message=${text}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
      } catch (error) {
        console.error("Error sending bot message:", error);
        Alert.alert("Error", "Failed to send message");
      }
    }
  };  

  const fetchNewMessages = async () => {
    // Prevent fetching if a message is being sent
    if (isFetching) return;
    
    setIsFetching(true);

    const token = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('userId');

    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/botpress/getNewMessages?userId=${userId}`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      const formattedMessages = response.data.map((msg) => ({
        _id: msg.id,
        text: msg.payload?.text || '',
        createdAt: msg.createdAt,
        user: {
          _id: botId,
          name: 'Bot'
        },
      }));

      setMessages(prevMessages => {
        const messagesMap = new Map();
        prevMessages.forEach(msg => messagesMap.set(msg._id, msg));
        formattedMessages.forEach(msg => messagesMap.set(msg._id, msg));

        return Array.from(messagesMap.values())
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
    } catch (error) {
      console.error("Error fetching bot messages:", error);
    } finally {
      setIsFetching(false); // Reset fetching flag
    }
  };

  const loadMessageHistory = async () => {
    const token = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('userId');

    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/botpress/getAllMessages?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const formattedMessages = response.data.messages.map((msg) => ({
        _id: msg.id,
        text: msg.payload?.text || "",
        createdAt: msg.createdAt,
        user: {
          _id: msg.userId,
          name: msg.userId === userId ? "You" : "Support Bot",
        },
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching bot messages:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
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
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support Bot</Text>
          <View style={{ width: 32 }} /> 
        </View>

        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <Chat
            messages={messages}
            setMessages={(val) => onSendMessage(val)}
            themeColor="#4c6ef5"
            themeTextColor="white"
            showSenderAvatar={false}
            showReceiverAvatar={false}
            inputBorderColor="rgba(255, 255, 255, 0.3)"
            inputBackgroundColor="rgba(255, 255, 255, 0.2)"
            placeholder="Ask me anything!"
            user={{
              _id: userIdGlobal,
              name: "You",
            }}
            backgroundColor="transparent"
            placeholderColor="rgba(255, 255, 255, 0.7)"
            showEmoji={false}
            showAttachment={false}
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
            sendButtonBackgroundColor="rgba(255, 255, 255, 0.3)"
            sendButtonIconColor="white"
          />
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#4c6ef5',
    justifyContent: "center",
    alignItems: "center",
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
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
});

export default BotMessagesScreen;
