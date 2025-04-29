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
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import config from "../config";
import { LinearGradient } from 'expo-linear-gradient';

const BotMessagesScreen = () => {
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    initializeBotChat();
    const interval = setInterval(fetchBotMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const initializeBotChat = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      const storedToken = await AsyncStorage.getItem("token");
      setUserId(storedUserId);
      setToken(storedToken);

      const profileResponse = await axios.get(`${config.API_BASE_URL}/api/getProfile`, {
        params: { userId: storedUserId },
        headers: { 'Authorization': `Bearer ${storedToken}` },
      });

      if (!profileResponse.data.botConversationId) {
        await axios.post(`${config.API_BASE_URL}/api/botpress/createChat`, null, {
          params: { userId: storedUserId },
          headers: { 'Authorization': `Bearer ${storedToken}` },
        });
      }

      fetchBotMessages();
    } catch (error) {
      console.error("Error initializing bot chat:", error);
      Alert.alert("Error", "Unable to start or load support chat. Please try again.");
      setLoading(false);
    }
  };

  const fetchBotMessages = async () => {
    try {
      const response = await axios.get(`${config.API_BASE_URL}/api/botpress/getAllMessages`, {
        params: { userId },
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

      setMessages(formattedMessages.reverse());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bot messages:", error);
      setLoading(false);
    }
  };

  const onSendMessage = async (text) => {
    if (text.trim()) {
      try {
        await axios.post(`${config.API_BASE_URL}/api/botpress/sendMessage`, null, {
          params: { userId, message: text },
          headers: { 'Authorization': `Bearer ${token}` },
        });
        fetchBotMessages();
      } catch (error) {
        console.error("Error sending bot message:", error);
      }
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
              _id: userId,
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
