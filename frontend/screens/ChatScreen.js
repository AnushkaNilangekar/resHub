import { View, Text, StyleSheet } from "react-native";

/*
* Chat Screen
*/
const ChatScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Chat Screen</Text>
        </View >
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
});