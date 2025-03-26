import React, { useState, useEffect, useLayoutEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Keybo } from "react-native";
import Chat from "@codsod/react-native-chat";
import { useNavigation } from "@react-navigation/native"; 
import { Ionicons } from "@expo/vector-icons"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

const MessageScreen = ({ route }) => {
  const { chatId, otherUserId, name } = route.params;
  const [messages, setMessages] = useState([]);
  const userId = AsyncStorage.getItem("userId");
  const token = AsyncStorage.getItem("token");
  // const navigation = useNavigation();

    // // Set the header title dynamically
    // useLayoutEffect(() => {
    //   navigation.setOptions({
    //     title: `Chat with ${name}`, // Customize the title dynamically
    //     headerStyle: { backgroundColor: "orange" }, // Customize header background
    //     headerTitleStyle: { color: "white" }, // Customize header text color
    //   });
    // }, [navigation, otherUserId]);
  

  // Dummy data for messages
  const fetchMessages = () => {
    const dummyMessages = [
      {
        // _id: 1,
        text: "Hey, how are you?",
        createdAt: new Date(),
        user: {
          _id: 23,
          name: "John Doe",
        },
      },
      {
        // _id: 2,
        text: "I'm good, thanks! How about you?",
        createdAt: new Date(),
        user: {
          _id: 1,
          name: "Vishal Chaturvedi",
        },
      },
      {
        // _id: 3,
        text: "I'm doing well, working on some coding projects.",
        createdAt: new Date(),
        user: {
          _id: 23,
          name: "John Doe",
        },
      },
    ];
    setMessages(dummyMessages);
  };

  // Handle sending a new message
  const onSendMessage = (text) => {
    if (text.trim()) {
      const newMessage = {
        // _id: messages.length + 1,
        text,
        createdAt: new Date(),
        user: {
          _id: userId,
          name: name,
        },
      };
      const profileResponse = await axios.post(`${config.API_BASE_URL}/api/users/createChat`, {
        params: {
          newMessage // Assuming email is used as the userId for the profile
        },
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
    }
  };

  useEffect(() => {
    fetchMessages(); // Load dummy messages when the component mounts
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
        // themeColor="white"
        // themeTextColor="black"
        showSenderAvatar={false}
        showReceiverAvatar={true}
        // inputBorderColor="orange"
        user={{
          _id: 1,
          name: "Vishal Chaturvedi",
        }}
        backgroundColor="white"
        inputBackgroundColor="white"
        placeholder="Enter Your Message"
        placeholderColor="gray"
        showEmoji={true}
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
