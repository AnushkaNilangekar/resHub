import React from 'react';
import { View, Text, StyleSheet } from "react-native";

/*
* Chat Screen
*/
const ChatScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Placeholder for Chat Screen</Text>
        </View>
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});