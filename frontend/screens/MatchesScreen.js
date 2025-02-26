import React, { useEffect, useState, useCallback } from "react";
import { View, Image, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import config from "../config";
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useNavigation } from '@react-navigation/native';

/*
* Matches Screen
*/
const MatchesScreen = ({ userId }) => {
  const [matches, setMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  /*
  * Gets a list of the user ids of the current user's matches
  */
  async function getMatches() {
    try {
      const userId = await AsyncStorage.getItem("userEmail");

      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${config.API_BASE_URL}/api/users/getMatches`, {
        params: {
          userId: userId,
        },
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

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
    const token = await AsyncStorage.getItem("token");
    const userId = await AsyncStorage.getItem("userEmail");
    const response = await axios.get(`${config.API_BASE_URL}/api/users/getOtherUserEmails`, {
      params: {
        userId: userId,
      },
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });



    const otherUserEmails = response.data;

    for (const userId of userIds) {
      try {
        // const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${config.API_BASE_URL}/api/getProfile`, {
          params: {
            userId: userId,
          },
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        const {
          fullName,
          bio,
          profilePicUrl,
        } = response.data;

        let chatCreated = false;

        if (otherUserEmails.includes(userId)) {
          chatCreated = true;
        }

        profiles.push({ userId, fullName, bio, profilePicUrl, chatCreated });
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
      console.log(profiles)
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

  const handlePress = useCallback(async (userId2) => {
    console.log("in");
    try {
      const token = await AsyncStorage.getItem("token");
      const userId1 = await AsyncStorage.getItem("userEmail");
      const response = await axios.post(
        `${config.API_BASE_URL}/api/users/createChat`, 
        {}, // Empty body since we are using params
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { email1: userId1, email2: userId2 }, // Correct placement
        }
      );

      console.log(response);

      if (response.status !== 200) {
        throw new Error("Failed to create chat");
      }
      setMatches((prevMatches) =>
        prevMatches.map((match) =>
          match.userId === userId2 ? { ...match, chatCreated: true } : match
        )
      );

      alert("Chat was created!");

    } catch (error) {
      console.error("Error creating chat:", error);
      alert("Failed to create chat");
    }
  }, []);

  return (
    <View style={styles.container}>
      {matches.length === 0 ? (
        <ScrollView contentContainerStyle={styles.noMatchesContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <Ionicons name="sad-outline" size={50} color="#555" />
          <Text style={styles.noMatchesText}>No matches yet</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.matchCard}>
              {item.profilePicUrl ? (
                <Image source={{ uri: item.profilePicUrl }} style={styles.profilePic} />
              ) : (
                <Ionicons name="person-circle-outline" size={100} color="#ccc"/>
              )}

              <View style={styles.textContainer}>
                <Text style={styles.fullName}>{item.fullName}</Text>
                <Text style={styles.bio}>{item.bio}</Text>
              </View>

              {!item.chatCreated && (
                <TouchableOpacity style={styles.iconButton} onPress={() => handlePress(item.userId)}>
                  <Ionicons name="chatbubble-ellipses-outline" style={styles.chatIcon} />
                </TouchableOpacity>
              )}
            </View>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
};

export default MatchesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
  },
  noMatchesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 200,
  },
  noMatchesText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#555",
    marginTop: 10,
  },
  matchCard: {
    width: "100%",
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 20,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    height: 100,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  fullName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 2,
  },
  bio: {
    fontSize: 16,
    color: "#555",
  },
  chatIcon: {
    fontSize: 45,
    color: "#555",
  }
});
