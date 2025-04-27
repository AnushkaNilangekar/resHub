import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    KeyboardAvoidingView, 
    Platform, 
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    StatusBar,
    SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import config from '../config';

const ForumScreen = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [residenceHall, setResidenceHall] = useState('Other Halls/Apartments');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let residenceHall = await AsyncStorage.getItem('residence');
      if (!residenceHall) {
        residenceHall = 'Other Halls/Apartments'; // default if missing
      }
      //console.log(residenceHall)
      setResidenceHall(residenceHall);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${config.API_BASE_URL}/api/forum/getPosts`, {
        params: { residenceHall },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPosts((response.data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      //console.log(posts)
    } catch (error) {
      console.error('Error fetching forum posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [])
  );

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      const residence = await AsyncStorage.getItem('residence');
      const fullName = await AsyncStorage.getItem('fullName');
      //console.log(residenceHall)
      await axios.post(`${config.API_BASE_URL}/api/forum/create`, {
        userId,
        residenceHall: residence,
        content: newPost.trim(),
        fullName,
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setNewPost('');
      fetchPosts();
    } catch (error) {
      console.error('Error posting message:', error);
    } finally {
      setPosting(false);
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postAuthor}>{item.fullName ? item.fullName : 'Anonymous'}</Text>
      <Text style={styles.postMessage}>{item.content}</Text>
      <Text style={styles.postTimestamp}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#4c6ef5', '#6C85FF', '#6BBFBC', '#2a47c3']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.header}>
                <Text style={styles.headerText}>Residence Hall Forum</Text>
                {residenceHall ? (
                    <Text style={styles.subHeaderText}>{residenceHall}</Text>
                ) : null}
            </View>

          {loading ? (
            <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
            ) : (
            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.postId}
                contentContainerStyle={[
                styles.postsList, 
                posts.length === 0 && { flex: 1 }
                ]}
                refreshControl={
                <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={() => { setRefreshing(true); fetchPosts(); }} 
                />
                }
                ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                    No posts yet. Start the conversation!
                    </Text>
                </View>
                }
            />
            )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={newPost}
              onChangeText={setNewPost}
              placeholder="Post something..."
              placeholderTextColor="#ccc"
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handlePost} disabled={posting}>
              {posting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="send" size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
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
  container: {
    flex: 1,
    paddingBottom: 60,
  },
  header: {
    marginTop: 15,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  postsList: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  postContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  postAuthor: {
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  postMessage: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  postTimestamp: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    margin: 10,
    borderRadius: 10,
  },

  input: {
    flex: 1,
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#2a47c3',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    opacity: 0.7,
  },  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subHeaderText: {
    fontSize: 18,
    color: '#cfd6f6',
    marginTop: 4,
    fontWeight: '500',
  },  
});

export default ForumScreen;
