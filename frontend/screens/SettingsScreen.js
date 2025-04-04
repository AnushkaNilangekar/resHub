import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Alert,
    Modal,
    FlatList,
    StatusBar,
    Platform,
    ActivityIndicator
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TextInput } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';
import { Ionicons } from '@expo/vector-icons';

const CustomDropdown = ({ label, options, selectedValue, onValueChange, icon }) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TouchableOpacity 
                style={styles.dropdownButton} 
                onPress={() => setModalVisible(true)}
                activeOpacity={0.8}
            >
                <Ionicons name={icon} size={20} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
                <Text style={[
                    styles.dropdownButtonText,
                    !selectedValue && styles.dropdownPlaceholder
                ]}>
                    {selectedValue || `Select ${label}`}
                </Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        <FlatList
                            data={options}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={[
                                        styles.modalOption,
                                        selectedValue === item && styles.modalOptionSelected
                                    ]}
                                    onPress={() => {
                                        onValueChange(item);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalOptionText,
                                        selectedValue === item && styles.modalOptionTextSelected
                                    ]}>
                                        {item}
                                    </Text>
                                    {selectedValue === item && (
                                        <Ionicons name="checkmark" size={20} color="#7B4A9E" />
                                    )}
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item}
                        />
                        <TouchableOpacity 
                            style={styles.modalCancelButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalCancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const SettingsScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [focusedInput, setFocusedInput] = useState(null);
    // Personal Info States
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [major, setMajor] = useState('');
    const [minor, setMinor] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [residence, setResidence] = useState('');
    const [bio, setBio] = useState('');
    const [hobbies, setHobbies] = useState([]);
    const [saving, setSaving] = useState(false);
    const commonHobbies = [
        "Reading", "Hiking", "Gaming", "Cooking", 
        "Traveling", "Sports", "Music", "Art", "Working Out"
    ];

    const toggleHobby = (hobby) => {
        if (hobbies.includes(hobby)) {
          setHobbies(hobbies.filter((currentHobby) => currentHobby !== hobby));
        } else {
          setHobbies([...hobbies, hobby]);
        }
      };   

    // Personal Traits States
    const [smokingStatus, setSmokingStatus] = useState('');
    const [cleanlinessLevel, setCleanlinessLevel] = useState('');
    const [sleepSchedule, setSleepSchedule] = useState('');
    const [guestFrequency, setGuestFrequency] = useState('');
    const [hasPets, setHasPets] = useState('');
    const [noiseLevel, setNoiseLevel] = useState('');
    const [sharingCommonItems, setSharingCommonItems] = useState('');
    const [dietaryPreference, setDietaryPreference] = useState('');
    const [allergies, setAllergies] = useState('');

    // Roommate Preferences States
    const [roommateSmokingPreference, setRoommateSmokingPreference] = useState('');
    const [roommateCleanlinessLevel, setRoommateCleanlinessLevel] = useState('');
    const [roommateSleepSchedule, setRoommateSleepSchedule] = useState('');
    const [roommateGuestFrequency, setRoommateGuestFrequency] = useState('');
    const [roommatePetPreference, setRoommatePetPreference] = useState('');
    const [roommateNoiseTolerance, setRoommateNoiseTolerance] = useState('');
    const [roommateSharingCommonItems, setRoommateSharingCommonItems] = useState('');
    const [roommateDietaryPreference, setRoommateDietaryPreference] = useState('');

    // Blocked Users and Reported Chats
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [reportedChats, setReportedChats] = useState([]);

    useEffect(() => {
        fetchUserProfile();
        fetchBlockedUsers();
        //fetchReportedChats();
    }, []);

    const ProfileInput = ({ label, value, onChangeText, keyboardType = 'default', multiline = false, icon }) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputWrapper}>
                <Ionicons name={icon || "create-outline"} size={20} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
                <TextInput 
                    style={[
                        styles.input, 
                        multiline && styles.multilineInput
                    ]} 
                    value={value} 
                    onChangeText={onChangeText} 
                    keyboardType={keyboardType}
                    multiline={multiline}
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
            </View>
        </View>
    );

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${config.API_BASE_URL}/api/getProfile`, {
                params: { userId: userId },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const profile = response.data;

            // Set personal info
            setFullName(profile.fullName || '');
            setAge(profile.age ? profile.age.toString() : '');
            setGender(profile.gender || '');
            setMajor(profile.major || '');
            setMinor(profile.minor || '');
            setGraduationYear(profile.graduationYear ? profile.graduationYear.toString() : '');
            setResidence(profile.residence || '');
            setBio(profile.bio || '');
            setHobbies(profile.hobbies || []); 

            // Set personal traits
            setSmokingStatus(profile.smokingStatus || '');
            setCleanlinessLevel(profile.cleanlinessLevel || '');
            setSleepSchedule(profile.sleepSchedule || '');
            setGuestFrequency(profile.guestFrequency || '');
            setHasPets(profile.hasPets || '');
            setNoiseLevel(profile.noiseLevel || '');
            setSharingCommonItems(profile.sharingCommonItems || '');
            setDietaryPreference(profile.dietaryPreference || '');
            setAllergies(profile.allergies || '');

            // Set roommate preferences
            setRoommateSmokingPreference(profile.roommateSmokingPreference || '');
            setRoommateCleanlinessLevel(profile.roommateCleanlinessLevel || '');
            setRoommateSleepSchedule(profile.roommateSleepSchedule || '');
            setRoommateGuestFrequency(profile.roommateGuestFrequency || '');
            setRoommatePetPreference(profile.roommatePetPreference || '');
            setRoommateNoiseTolerance(profile.roommateNoiseTolerance || '');
            setRoommateSharingCommonItems(profile.roommateSharingCommonItems || '');
            setRoommateDietaryPreference(profile.roommateDietaryPreference || '');

        } catch (error) {
            console.error('Error fetching profile:', error);
            Alert.alert('Error', 'Could not fetch profile details');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!fullName.trim() || !age.trim() || !gender.trim() || !major.trim() || !graduationYear.trim()) {
            Alert.alert('Error', 'Please fill out all required fields: Name, Age, Gender, Major, and Graduation Year.');
            return;
        }    
        try {
            setSaving(true);
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');
            const formattedHobbies = hobbies.join(', '); 
            const updateData = {
                userId,
                fullName,
                age: parseInt(age),
                gender,
                major,
                minor,
                graduationYear: parseInt(graduationYear),
                residence,
                bio,
                hobbies: formattedHobbies.split(',').map(h => h.trim()),
                
                // Personal Traits
                smokingStatus,
                cleanlinessLevel,
                sleepSchedule,
                guestFrequency,
                hasPets,
                noiseLevel,
                sharingCommonItems,
                dietaryPreference,
                allergies,

                // Roommate Preferences
                roommateSmokingPreference,
                roommateCleanlinessLevel,
                roommateSleepSchedule,
                roommateGuestFrequency,
                roommatePetPreference,
                roommateNoiseTolerance,
                roommateSharingCommonItems,
                roommateDietaryPreference
            };

            await axios.put(`${config.API_BASE_URL}/api/updateProfile`, updateData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            Alert.alert('Success', 'Profile updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Could not update profile');
        }  finally {
            setSaving(false);
        }
    };

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
    
    
    /*const fetchReportedChats = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`${config.API_BASE_URL}/api/users/reportedChats`, {
                params: { userId: userId },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setReportedChats(response.data);
        } catch (error) {
            console.error('Error fetching reported chats:', error);
        }
    };*/

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
                    <Text style={styles.loadingText}>Loading your profile...</Text>
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
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView 
                    style={styles.container}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollViewContent}
                >
                    {/* Personal Information Section */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="person" size={22} color="#FFFFFF" />
                            <Text style={styles.sectionTitle}>Personal Information</Text>
                        </View>
                        <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <View style={[
                            styles.inputWrapper,
                            focusedInput === 'fullName' && styles.inputWrapperFocused
                        ]}>
                            <Ionicons 
                                name="person-outline" 
                                size={20} 
                                color="rgba(255, 255, 255, 0.8)" 
                                style={styles.inputIcon} 
                            />
                            <TextInput
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Enter your full name"
                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                onFocus={() => setFocusedInput('fullName')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>
                    </View>
                          <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Age</Text>
                            <View style={[
                                styles.inputWrapper,
                                focusedInput === 'age' && styles.inputWrapperFocused
                            ]}>
                                <Ionicons 
                                    name="calendar-outline" 
                                    size={20} 
                                    color="rgba(255, 255, 255, 0.8)" 
                                    style={styles.inputIcon} 
                                />
                                <TextInput
                                    style={styles.input}
                                    value={age}
                                    onChangeText={setAge}
                                    keyboardType="numeric"
                                    placeholder="Enter your age"
                                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                    onFocus={() => setFocusedInput('age')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>
                        </View>
                        <CustomDropdown 
                            label="Gender"
                            selectedValue={gender}
                            onValueChange={setGender}
                            options={['Female', 'Male', 'Non-Binary', 'Prefer Not to Say']}
                            icon="person-outline"
                        />
                        <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Residence</Text>
                        <View style={[
                            styles.inputWrapper,
                            focusedInput === 'residence' && styles.inputWrapperFocused
                        ]}>
                            <Ionicons 
                                name="home-outline" 
                                size={20} 
                                color="rgba(255, 255, 255, 0.8)" 
                                style={styles.inputIcon} 
                            />
                            <TextInput
                                style={styles.input}
                                value={residence}
                                onChangeText={setResidence}
                                placeholder="Enter your residence"
                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                onFocus={() => setFocusedInput('residence')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>
                    </View>
                    </View>

                    {/* Academic Details */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="school" size={22} color="#FFFFFF" />
                            <Text style={styles.sectionTitle}>Academic Details</Text>
                        </View>
                        <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Major</Text>
                        <View style={[
                            styles.inputWrapper,
                            focusedInput === 'major' && styles.inputWrapperFocused
                        ]}>
                            <Ionicons 
                                name="book-outline" 
                                size={20} 
                                color="rgba(255, 255, 255, 0.8)" 
                                style={styles.inputIcon} 
                            />
                            <TextInput
                                style={styles.input}
                                value={major}
                                onChangeText={setMajor}
                                placeholder="Enter your major"
                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                onFocus={() => setFocusedInput('major')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Minor</Text>
                        <View style={[
                            styles.inputWrapper,
                            focusedInput === 'minor' && styles.inputWrapperFocused
                        ]}>
                            <Ionicons 
                                name="bookmark-outline" 
                                size={20} 
                                color="rgba(255, 255, 255, 0.8)" 
                                style={styles.inputIcon} 
                            />
                            <TextInput
                                style={styles.input}
                                value={minor}
                                onChangeText={setMinor}
                                placeholder="Enter your minor"
                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                onFocus={() => setFocusedInput('minor')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>
                    </View>
                    <CustomDropdown 
                            label="Graduation Year"
                            selectedValue={graduationYear}
                            onValueChange={setGraduationYear}
                            options={['2025', '2026', '2027', '2028', '2029', '2030', 'n/a']}
                            icon="calendar-outline"
                        />
                    </View>

                    {/* Bio & Hobbies */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="heart" size={22} color="#FFFFFF" />
                            <Text style={styles.sectionTitle}>Bio & Interests</Text>
                        </View>
                        <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Bio</Text>
                        <View style={[
                            styles.inputWrapper,
                            focusedInput === 'bio' && styles.inputWrapperFocused
                        ]}>
                            <Ionicons 
                                name="document-text-outline" 
                                size={20} 
                                color="rgba(255, 255, 255, 0.8)" 
                                style={styles.inputIcon} 
                            />
                            <TextInput
                                style={[styles.input, styles.multilineInput]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about yourself"
                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                multiline={true}
                                maxLength={40}
                                onFocus={() => setFocusedInput('bio')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>
                    </View>
                        <Text style={styles.inputLabel}>Select Your Hobbies:</Text>
                        <View style={styles.hobbiesContainer}>
                            {commonHobbies.map((hobby) => (
                                <TouchableOpacity
                                    key={hobby}
                                    style={[
                                        styles.hobbyItem,
                                        hobbies.includes(hobby) && styles.hobbySelected,
                                    ]}
                                    onPress={() => toggleHobby(hobby)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.hobbyText, 
                                        hobbies.includes(hobby) && styles.hobbyTextSelected
                                    ]}>
                                        {hobby}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Personal Traits Section */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="options" size={22} color="#FFFFFF" />
                            <Text style={styles.sectionTitle}>Personal Traits</Text>
                        </View>
                        <CustomDropdown 
                            label="Smoking Status"
                            selectedValue={smokingStatus}
                            onValueChange={setSmokingStatus}
                            options={['Non-Smoker', 'Smoker']}
                            icon="flame-outline"
                        />
                        <CustomDropdown 
                            label="Cleanliness Level"
                            selectedValue={cleanlinessLevel}
                            onValueChange={setCleanlinessLevel}
                            options={['Very Clean', 'Moderate', 'Messy']}
                            icon="sparkles-outline"
                        />
                        <CustomDropdown 
                            label="Sleep Schedule"
                            selectedValue={sleepSchedule}
                            onValueChange={setSleepSchedule}
                            options={['Early Bird', 'Night Owl', 'Flexible']}
                            icon="moon-outline"
                        />
                        <CustomDropdown 
                            label="Guest Frequency"
                            selectedValue={guestFrequency}
                            onValueChange={setGuestFrequency}
                            options={['Rarely', 'Occasionally', 'Frequently']}
                            icon="people-outline"
                        />
                        <CustomDropdown 
                            label="Do you own pets?"
                            selectedValue={hasPets}
                            onValueChange={setHasPets}
                            options={['Yes', 'No', 'Might']}
                            icon="paw-outline"
                        />
                        <CustomDropdown 
                            label="Noise Level"
                            selectedValue={noiseLevel}
                            onValueChange={setNoiseLevel}
                            options={['Quiet', 'Moderate Noise', 'Loud Environment']}
                            icon="volume-high-outline"
                        />
                        <CustomDropdown 
                            label="Sharing Common Items"
                            selectedValue={sharingCommonItems}
                            onValueChange={setSharingCommonItems}
                            options={['Strictly Separate', 'Willing to Share', 'Flexible']}
                            icon="share-outline"
                        />
                        <CustomDropdown 
                            label="Dietary Preference"
                            selectedValue={dietaryPreference}
                            onValueChange={setDietaryPreference}
                            options={['Vegetarian', 'Vegan', 'Allergies', 'No Restrictions', 'Other']}
                            icon="restaurant-outline"
                        />
                        <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Allergies</Text>
                        <View style={[
                            styles.inputWrapper,
                            focusedInput === 'allergies' && styles.inputWrapperFocused
                        ]}>
                            <Ionicons 
                                name="alert-circle-outline" 
                                size={20} 
                                color="rgba(255, 255, 255, 0.8)" 
                                style={styles.inputIcon} 
                            />
                            <TextInput
                                style={styles.input}
                                value={allergies}
                                onChangeText={setAllergies}
                                placeholder="Enter allergies if any"
                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                onFocus={() => setFocusedInput('allergies')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>
                    </View>
                    </View>

                    {/* Roommate Preferences Section */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="people" size={22} color="#FFFFFF" />
                            <Text style={styles.sectionTitle}>Roommate Preferences</Text>
                        </View>
                        <CustomDropdown 
                            label="Roommate Smoking Preference"
                            selectedValue={roommateSmokingPreference}
                            onValueChange={setRoommateSmokingPreference}
                            options={[
                                'Non-Smoker', 
                                'Smoker', 
                                'Only when I\'m not around'
                            ]}
                            icon="flame-outline"
                        />
                        <CustomDropdown 
                            label="Roommate Cleanliness Level"
                            selectedValue={roommateCleanlinessLevel}
                            onValueChange={setRoommateCleanlinessLevel}
                            options={['Very Clean', 'Moderate', 'Messy']}
                            icon="sparkles-outline"
                        />
                        <CustomDropdown 
                            label="Roommate Sleep Schedule"
                            selectedValue={roommateSleepSchedule}
                            onValueChange={setRoommateSleepSchedule}
                            options={['Early Bird', 'Night Owl', 'Flexible']}
                            icon="moon-outline"
                        />
                        <CustomDropdown 
                            label="Roommate Guest Frequency"
                            selectedValue={roommateGuestFrequency}
                            onValueChange={setRoommateGuestFrequency}
                            options={['Rarely', 'Occasionally', 'Frequently']}
                            icon="people-outline"
                        />
                        <CustomDropdown 
                            label="Roommate Pet Preference"
                            selectedValue={roommatePetPreference}
                            onValueChange={setRoommatePetPreference}
                            options={['No Pets', 'Okay with Pets']}
                            icon="paw-outline"
                        />
                        <CustomDropdown 
                            label="Roommate Noise Tolerance"
                            selectedValue={roommateNoiseTolerance}
                            onValueChange={setRoommateNoiseTolerance}
                            options={['Quiet', 'Moderate Noise', 'Loud Environment']}
                            icon="volume-high-outline"
                        />
                        <CustomDropdown 
                            label="Roommate Sharing Common Items"
                            selectedValue={roommateSharingCommonItems}
                            onValueChange={setRoommateSharingCommonItems}
                            options={['Strictly Separate', 'Willing to Share', 'Flexible']}
                            icon="share-outline"
                        />
                        <CustomDropdown 
                            label="Roommate Dietary Preference"
                            selectedValue={roommateDietaryPreference}
                            onValueChange={setRoommateDietaryPreference}
                            options={['Vegetarian', 'Vegan', 'No Restrictions']}
                            icon="restaurant-outline"
                        />
                    </View>

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
                                        <Text style={styles.reportedChatText}>{item.chatId}</Text>
                                    </View>
                                )}
                                keyExtractor={(item) => item.chatId}
                                scrollEnabled={false}
                                nestedScrollEnabled={true}
                            />
                        ) : (
                            <View style={styles.noDataContainer}>
                                <Text style={styles.noDataText}>No reported chats.</Text>
                            </View>
                        )}
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity 
                        style={styles.saveButton} 
                        onPress={handleSaveProfile}
                        activeOpacity={0.8}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={20} color="#FFFFFF" style={styles.saveButtonIcon} />
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>
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
    inputContainer: {
        marginHorizontal: 16,
        marginVertical: 10,
    },
    inputLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 8,
        fontWeight: '500',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
    },
    inputIcon: {
        marginLeft: 12,
        marginRight: 5,
    },
    input: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 12,
        color: '#FFFFFF',
        fontSize: 16,
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    dropdownButtonText: {
        flex: 1,
        fontSize: 16,
        color: '#FFFFFF',
        paddingHorizontal: 10,
    },
    dropdownPlaceholder: {
        color: 'rgba(255, 255, 255, 0.5)',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 20,
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 20,
        maxHeight: '70%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#7B4A9E',
        marginBottom: 15,
        textAlign: 'center',
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalOptionSelected: {
        backgroundColor: 'rgba(123, 74, 158, 0.1)',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333333',
    },
    modalOptionTextSelected: {
        color: '#7B4A9E',
        fontWeight: '600',
    },
    modalCancelButton: {
        marginTop: 15,
        marginHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCancelButtonText: {
        color: '#7B4A9E',
        fontSize: 16,
        fontWeight: '600',
    },
    hobbiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: 10,
        marginBottom: 10,
    },
    hobbyItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        margin: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    hobbySelected: {
        backgroundColor: '#9775E3',
        borderColor: '#9775E3',
    },
    hobbyText: {
        fontSize: 14,
        color: '#FFFFFF',
    },
    hobbyTextSelected: {
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#4ade80',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 30,
        flexDirection: 'row',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    saveButtonIcon: {
        marginRight: 10,
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
});

export default SettingsScreen;