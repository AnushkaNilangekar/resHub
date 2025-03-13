import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Chat from "@codsod/react-native-chat";

const MessageScreen = ({ route }) => {
  const { chatId, otherUserId } = route.params;
  const [messages, setMessages] = useState([]);

  // Dummy data for messages
  const fetchMessages = () => {
    const dummyMessages = [
      {
        _id: 1,
        text: "Hey, how are you?",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: "John Doe",
        },
      },
      {
        _id: 2,
        text: "I'm good, thanks! How about you?",
        createdAt: new Date(),
        user: {
          _id: 1,
          name: "Vishal Chaturvedi",
        },
      },
      {
        _id: 3,
        text: "I'm doing well, working on some coding projects.",
        createdAt: new Date(),
        user: {
          _id: 2,
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
        _id: messages.length + 1,
        text,
        createdAt: new Date(),
        user: {
          _id: 1,
          name: "Vishal Chaturvedi",
        },
      };
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
    }
  };

  useEffect(() => {
    fetchMessages(); // Load dummy messages when the component mounts
  }, [chatId]);

  return (
    <View style={styles.container}>
      <Chat
        messages={messages}
        setMessages={onSendMessage}
        themeColor="orange"
        themeTextColor="white"
        showSenderAvatar={false}
        showReceiverAvatar={true}
        inputBorderColor="orange"
        user={{
          _id: 1,
          name: "Vishal Chaturvedi",
        }}
        backgroundColor="white"
        inputBackgroundColor="white"
        placeholder="Enter Your Message"
        placeholderColor="gray"
        backgroundImage={
          "https://fastly.picsum.photos/id/54/3264/2176.jpg?hmac=blh020fMeJ5Ru0p-fmXUaOAeYnxpOPHnhJojpzPLN3g"
        }
        showEmoji={true}
        onPressEmoji={() => console.log("Emoji Button Pressed..")}
        showAttachment={true}
        onPressAttachment={() => console.log("Attachment Button Pressed..")}
        timeContainerColor="red"
        timeContainerTextColor="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
});

export default MessageScreen;
