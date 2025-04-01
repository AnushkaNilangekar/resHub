import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity, 
  Text, 
  StatusBar, 
  Image
} from "react-native";
import Chat from "@codsod/react-native-chat";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from 'expo-linear-gradient';
import config from "../config";

const MessageScreen = ({ route }) => {
  const { chatId, otherUserId, name } = route.params;
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("");
  const [token, setToken] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const navigation = useNavigation();
  
  // Remove the default header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const fetchMessages = async () => {
    const storedUserId = await AsyncStorage.getItem("userId");
    setUserId(storedUserId);
    const storedToken = await AsyncStorage.getItem("token");
    setToken(storedToken);
    
    try {
      // Fetch profile picture
      const profileResponse = await axios.get(`${config.API_BASE_URL}/api/getProfile`, {
        params: { userId: otherUserId },
        headers: { 'Authorization': `Bearer ${storedToken}` },
      });
      
      if (profileResponse.data && profileResponse.data.profilePicUrl) {
        setProfilePic(profileResponse.data.profilePicUrl);
      }
      
      // Fetch messages
      const response = await axios.get(`${config.API_BASE_URL}/api/users/getMessages`, {
        params: { chatId },
        headers: { 'Authorization': `Bearer ${storedToken}` },
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
            avatar: msg.userId === otherUserId ? profilePic : null,
          },
        }));

        setMessages(formattedMessages);
      } else {
        console.error("Failed to fetch messages:", response.status);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Handle sending a new message
  const onSendMessage = async (text) => {
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
        
        // Add the message locally for immediate UI update
        const newMessage = {
          _id: messages.length > 0 ? Math.max(...messages.map(m => m._id)) + 1 : 1,
          text: text,
          createdAt: new Date().toISOString(),
          user: {
            _id: userId,
            name: name,
          },
        };
        
        setMessages(prevMessages => [newMessage, ...prevMessages]);
        
        // Still fetch messages to ensure consistency
        setTimeout(fetchMessages, 500);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  useEffect(() => {
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
        
        // Notify the ChatScreen to update this conversation's unread status
        navigation.setParams({ updatedChatId: chatId });
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }
    
    markMessagesRead();
    fetchMessages(); // Initial fetch

    const interval = setInterval(() => {
      fetchMessages(); // Fetch messages every 5 seconds
    }, 5000);

    return () => {
      clearInterval(interval);
      if (route.params?.onGoBack) {
        route.params.onGoBack(chatId);
      }
    };
  }, [chatId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#4c6ef5', '#6C85FF', '#6BBFBC', '#2a47c3']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.4, 0.7, 1]}
      >
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={styles.profileContainer}>
              {profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.profilePic} />
              ) : (
                <View style={styles.defaultProfilePic}>
                  <Ionicons name="person" size={22} color="#fff" />
                </View>
              )}
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>{name}</Text>
          </View>
          
          <TouchableOpacity style={styles.optionsButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        {/* Chat Content Area */}
        <View style={styles.chatContentWrapper}>
          <KeyboardAvoidingView
            style={styles.keyboardAvoidView}
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
                showReceiverAvatar={true}
                inputBorderColor="rgba(255, 255, 255, 0.2)"
                user={{
                  _id: userId,
                  name: name,
                }}
                backgroundColor="transparent"
                inputBackgroundColor="rgba(255, 255, 255, 0.15)"
                placeholder="Type your message..."
                placeholderColor="rgba(255, 255, 255, 0.7)"
                inputTextColor="#fff"
                inputHeightFix={45}
                bubbleLeft={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                bubbleRight={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
                textLeft={{ color: '#fff' }}
                textRight={{ color: '#fff' }}
                showEmoji={false}
                showAttachment={false}
                onPressAttachment={() => console.log("Attachment Button Pressed..")}
                timeContainerColor="rgba(0, 0, 0, 0.2)"
                timeContainerTextColor="rgba(255, 255, 255, 0.8)"
                sendButtonText=""
                sendButtonIcon={<Ionicons name="paper-plane" size={22} color="#fff" />}
                scrollToBottomStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
                dateTextStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#4c6ef5',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 10 : StatusBar.currentHeight + 10,
    paddingBottom: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    padding: 5,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  profileContainer: {
    marginRight: 10,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  defaultProfilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    maxWidth: '70%',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  optionsButton: {
    padding: 5,
  },
  chatContentWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardAvoidView: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
});

export default MessageScreen;