import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Keybo } from "react-native";
import Chat from "@codsod/react-native-chat";
import { useNavigation } from "@react-navigation/native"; 
import { Ionicons } from "@expo/vector-icons"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import config from "../config";

const MessageScreen = ({ route }) => {
  const { chatId, otherUserId, name } = route.params;
  const [messages, setMessages] = useState([]);
  const [userId, setUserId]= useState("");
  // const navigation = useNavigation();

    // // Set the header title dynamically
    // useLayoutEffect(() => {
    //   navigation.setOptions({
    //     title: `Chat with ${name}`, // Customize the title dynamically
    //     headerStyle: { backgroundColor: "orange" }, // Customize header background
    //     headerTitleStyle: { color: "white" }, // Customize header text color
    //   });
    // }, [navigation, otherUserId]);
  

  const fetchMessages = async () => {
    const storedUserId = await AsyncStorage.getItem("userId");
    setUserId(storedUserId);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${config.API_BASE_URL}/api/users/getMessages`, {
        params: { chatId },
        headers: {
          'Authorization': `Bearer ${token}`,
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
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Handle sending a new message
const onSendMessage = async (text) => {
  console.log("clicked")
  const token = await AsyncStorage.getItem("token");
  console.log(token)

  console.log("Sending message:", text);
  if (text.trim()) {
    // const newMessage = {
    //   text,
    //   createdAt: new Date(),
    //   user: {
    //     _id: userId,
    //     name: name,
    //   },
    // };

    const requestData = {
      chatId: chatId,  // Include chatId in the URL
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
      console.log("yes")
      await axios.post(
        `${config.API_BASE_URL}/api/users/createMessage?${userParams.toString()}`,
        {},  // You don't need to send the body if all data is in the URL
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      // setMessages((prevMessages) => [newMessage, ...prevMessages]);
    } catch (error) {
      console.error("Error sending message:", error);
    }

    fetchMessages();  // Fetch messages again to include the new message
  }
};

useEffect(() => {
  fetchMessages(); // Initial fetch

  const interval = setInterval(() => {
    fetchMessages(); // Fetch messages every 5 seconds
  }, 100);

  return () => clearInterval(interval); // Cleanup on unmount
}, [chatId]);

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text style={styles.headerText}>Chat</Text>
        </TouchableOpacity>
      </View> */}
      <View style={styles.chatContainer}>
      <Chat
        messages={messages}
        setMessages={onSendMessage}
        themeColor="blue"
        themeTextColor="white"
        showSenderAvatar={true}
        showReceiverAvatar={true}
        inputBorderColor="black"
        user={{
          _id: userId,
          name: name,
        }}
        backgroundColor="white"
        inputBackgroundColor="white"
        placeholder="Enter Your Message"
        placeholderColor="gray"
        showEmoji={false}
        onPressEmoji={() => console.log("Emoji Button Pressed..")}
        showAttachment={true}
        onPressAttachment={() => console.log("Attachment Button Pressed..")}
        timeContainerColor="red"
        timeContainerTextColor="white"
      />
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
  // header: {
  //   height: 60, // Ensure the header has enough space
  //   flexDirection: "row",
  //   alignItems: "center",
  //   paddingHorizontal: 15,
  //   backgroundColor: "white",
  //   elevation: 3, // Android shadow
  //   shadowColor: "#000", // iOS shadow
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 2,
  // },
  // backButton: {
  //   flexDirection: "row",
  //   alignItems: "center",
  // },
  chatContainer: {
    flex: 1, // Ensures the chat takes up the remaining space
    marginTop: 10, // Creates space between the header and chat
    paddingBottom: 10, // Avoids messages getting too close to the bottom
  },
});

export default MessageScreen;
