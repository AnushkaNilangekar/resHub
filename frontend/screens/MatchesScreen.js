import React, { useEffect, useState, useCallback, useLayoutEffect } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import CustomTopTabNavigator from '../navigation/CustomTopTabNavigator';
import axios from "axios";
import config from "../config";

const MatchesScreen = ({ navigation, userId }) => {
  const [matches, setMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMatches = async () => {
    try {
      const userIds = [1, 2, 3, 4, 5];

      const dummyUsers = {
        1: { id: 1, name: "Jessica", bio: "Hey there! How are you?", profilePicture: "https://via.placeholder.com/50" },
        2: { id: 2, name: "Katy", bio: "Omg that sounds so fun!", profilePicture: "https://via.placeholder.com/50" },
        3: { id: 3, name: "Hannah", bio: "I would love to hang out together!", profilePicture: "https://via.placeholder.com/50" },
        4: { id: 4, name: "Selena", bio: "What else do you do for fun?", profilePicture: "https://via.placeholder.com/50" },
        5: { id: 5, name: "Jane", bio: "It's been a while but I love to ski!", profilePicture: "https://via.placeholder.com/50" },
      };

    //   call api

      setMatches(userIds.map(id => dummyUsers[id]));
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [userId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMatches();
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
    <FlatList
      data={matches}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.matchCard}>
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.bio}>{item.bio}</Text>
          </View>
          <Ionicons name="chatbubble-ellipses-outline" size={32}/>
        </View>
      )}      
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  </View>
  );
};

const ChatScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Conversations Screen</Text>
    </View>
  );
};

const MatchesTabNavigator = () => {
    const tabs = [
        { name: 'Matches', component: <MatchesScreen /> },
        { name: 'Conversations', component: <ChatScreen /> },
    ];

    return <CustomTopTabNavigator tabs={tabs} />;
};

export default MatchesTabNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  matchCard: {
    width: "100%",
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  bio: {
    fontSize: 14,
    color: "#555",
  },
});
