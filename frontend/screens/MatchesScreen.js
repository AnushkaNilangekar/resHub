import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import config from "../config";

/*
* Matches Screen
*/
const MatchesScreen = ({ navigation, userId }) => {
  const [matches, setMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  /*
  * Gets a list of the user ids of the current user's matches
  */
  async function getMatches() {
    try {
      // TODO temporary userId for testing
      const userId = "12345";

      const response = await axios.get(`${config.API_BASE_URL}/api/users/getMatches?userId=${userId}`);

      return response.data;
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  }

  /*
  * Gets a list of user profile information given a list of userIds
  */
  async function getUserProfiles(userIds) {
    const profiles = [];

    for (const userId of userIds) {
      try {
        const response = await axios.get(`${config.API_BASE_URL}/api/getProfile?userId=${userId}`);
        const { fullName, bio } = response.data;

        profiles.push({ fullName, bio });
      } catch (error) {
        console.error(`Error fetching profile for ${userId}:`, error);
      }
    }

    return profiles;
  }

  /*
  * Fetches the profile information for the current user's matches and populates the UI
  */
  async function getMatchingProfileInformation() {
    const userIds = await getMatches();

    if (userIds.length > 0) {
      const profiles = await getUserProfiles(userIds);

      setMatches(profiles);
    } else {
      console.log('No matches found.');
    }
  }

  /*
  * Activates the loading of profile upon load and when information when userId is changed
  */
  useEffect(() => {
    getMatchingProfileInformation();
  }, [userId]);

  /*
  * Allows user to refresh the profiles by pulling down on the matches screen
  */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getMatchingProfileInformation();
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.matchCard}>
            <View style={styles.textContainer}>
              <Text style={styles.fullName}>{item.fullName}</Text>
              <Text style={styles.bio}>{item.bio}</Text>
            </View>
            <Ionicons name="chatbubble-ellipses-outline" size={32} />
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

export default MatchesScreen;

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
    height: 90
  },
  fullName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  bio: {
    fontSize: 18,
    color: "#555",
  },
});
