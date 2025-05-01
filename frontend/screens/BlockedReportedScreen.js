import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    FlatList,
    StatusBar,
    Platform,
    ActivityIndicator
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';
import { Ionicons } from '@expo/vector-icons';

const BlockedReportedScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);

    // Blocked Users and Reported Chats
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [reportedChats, setReportedChats] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
          await fetchBlockedUsers();
          await fetchReportedChats();
          setLoading(false);
        };
    
        fetchData();
    }, []);

    const fetchBlockedUsers = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');
    
            const response = await axios.get(`${config.API_BASE_URL}/api/getBlockedUsers`, {
                params: { userId: userId },
                headers: { 'Authorization': `Bearer ${token}` }
            });
    
            if (response.data.error) {
                console.error('Error fetching blocked users:', response.data.error);
                return;
            }
    
            setBlockedUsers(response.data);
        } catch (error) {
            console.error('Error fetching blocked users:', error);
        }
    };
    
    
    const fetchReportedChats = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${config.API_BASE_URL}/api/reports/byReporter/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setReportedChats(response.data);
        } catch (error) {
            console.error('Error fetching reported chats:', error);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
      
        const date = new Date(timestamp);
        const options = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        };
      
        return date.toLocaleString(undefined, options);
      };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LinearGradient
                    colors={['#7B4A9E', '#9D67C1', '#9775E3', '#6152AA']}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    locations={[0, 0.3, 0.6, 1]}
                >
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Loading your blocked and reported users...</Text>
                </LinearGradient>
            </View>
        );
    }
   
    return (
        <GestureHandlerRootView style={styles.rootContainer}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <LinearGradient
                colors={['#7B4A9E', '#9D67C1', '#9775E3', '#6152AA']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                locations={[0, 0.3, 0.6, 1]}
            >
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Blocked and Reported</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView 
                    style={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContent}
                >
                    {/* Blocked Users Section */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="ban" size={22} color="#FFFFFF" />
                            <Text style={styles.sectionTitle}>Blocked Users</Text>
                        </View>
                        {blockedUsers.length > 0 ? (
                            <FlatList
                                data={blockedUsers}
                                renderItem={({ item }) => (
                                    <View style={styles.blockedUserItem}>
                                        <Text style={styles.blockedUserText}>{item}</Text>
                                    </View>
                                )}
                                keyExtractor={(item) => item}
                                scrollEnabled={false}
                                nestedScrollEnabled={true}
                            />
                        ) : (
                            <View style={styles.noDataContainer}>
                                <Text style={styles.noDataText}>No users blocked.</Text>
                            </View>
                        )}
                    </View>

                    {/* Reported Chats Section */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="alert-circle" size={22} color="#FFFFFF" />
                            <Text style={styles.sectionTitle}>Reported Chats</Text>
                        </View>
                        {reportedChats.length > 0 ? (
                            <FlatList
                                data={reportedChats}
                                renderItem={({ item }) => (
                                    <View style={styles.reportedChatItem}>
                                        <Text style={styles.reportedChatText}>{item.reportedUserName}</Text>
                                        <Text style={styles.reportedChatText}>{item.reason}</Text>
                                        <Text style={styles.reportedChatText}>{formatDate(item.reportTimestamp)}</Text>
                                    </View>
                                )}
                                keyExtractor={(item) => item.reportId}
                                scrollEnabled={false}
                                nestedScrollEnabled={true}
                            />
                        ) : (
                            <View style={styles.noDataContainer}>
                                <Text style={styles.noDataText}>No reported chats.</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </LinearGradient>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: '#7B4A9E',
    },
    gradient: {
        flex: 1,
        position: 'absolute',
        left: 0,
        right: 0, 
        top: 0,
        bottom: 0,
        height: '100%',
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    container: {
        flex: 1,
    },
    scrollViewContent: {
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 15,
    },
    sectionContainer: {
        marginBottom: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 10,
    },
    blockedUserItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    blockedUserText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    reportedChatItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    reportedChatText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    noDataText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 10,
    },
    noDataContainer: {
        paddingVertical: 15,
        paddingHorizontal: 16,
    },
    reportDate: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.6)",
        marginTop: 4,
    },  
});

export default BlockedReportedScreen;