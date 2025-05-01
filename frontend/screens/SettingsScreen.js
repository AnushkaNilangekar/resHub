import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text,
    Switch, 
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
import Slider from '@react-native-community/slider';
import { preferenceOptions } from '../constants/preferences';

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
    const residenceOptions = [
        "Harrison",
        "Hillenbrand",
        "Windsor",
        "Honors",
        "Earhart",
        "Owen",
        "First Street Towers",
        "Meredith South",
        "Meredith",
        "Shreve",
        "McCutcheon",
        "Hawkins",
        "Frieda Parker",
        "Winifred Parker",
        "Cary Quadrangle",
        "Tarkington",
        "Wiley",
        "On-campus Apartments",
        "Off-campus Apartments",
        "Other Halls/Apartments",
      ];
      
    const toggleHobby = (hobby) => {
        if (hobbies.includes(hobby)) {
          setHobbies(hobbies.filter((currentHobby) => currentHobby !== hobby));
        } else {
          setHobbies([...hobbies, hobby]);
        }
      };   

    // Personal Traits States
    const [smokingStatus, setSmokingStatus] = useState(-1);
    const [cleanlinessLevel, setCleanlinessLevel] = useState(-1);
    const [sleepSchedule, setSleepSchedule] = useState(-1);
    const [guestFrequency, setGuestFrequency] = useState(-1);
    const [hasPets, setHasPets] = useState(-1);
    const [noiseLevel, setNoiseLevel] = useState(-1);
    const [sharingCommonItems, setSharingCommonItems] = useState(-1);
    const [dietaryPreference, setDietaryPreference] = useState(-1);
    const [allergies, setAllergies] = useState(-1);

    // Roommate Preferences States
    const [roommateSmokingPreference, setRoommateSmokingPreference] = useState('');
    const [roommateCleanlinessLevel, setRoommateCleanlinessLevel] = useState('');
    const [roommateSleepSchedule, setRoommateSleepSchedule] = useState('');
    const [roommateGuestFrequency, setRoommateGuestFrequency] = useState('');
    const [roommatePetPreference, setRoommatePetPreference] = useState('');
    const [roommateNoiseTolerance, setRoommateNoiseTolerance] = useState('');
    const [roommateSharingCommonItems, setRoommateSharingCommonItems] = useState('');
    const [roommateDietaryPreference, setRoommateDietaryPreference] = useState('');


    //Notification Volume States
    const [notifVolume, setNotifVolume] = useState(1);
    const [matchSoundEnabled, setMatchSoundEnabled] = useState(true);
    const [messageSoundEnabled, setMessageSoundEnabled] = useState(true);

    //Email and Password Editing States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const isEmailValid = email === '' || email.endsWith('@purdue.edu');
    const isPasswordValid = password === '' || (password.length >= 8 && password === confirmPassword);
    const isFormValid = isEmailValid && isPasswordValid && (email !== '' || password !== '');

    const preferenceConfigs = [
        { key: 'smoking', label: 'SMOKING STATUS', value: smokingStatus, setter: setSmokingStatus, placeholder: 'Enter smoking preference', icon: 'flame-outline' },
        { key: 'cleanliness', label: 'CLEANLINESS LEVEL', value: cleanlinessLevel, setter: setCleanlinessLevel, placeholder: 'Enter cleanliness preference', icon: 'sparkles-outline' },
        { key: 'sleep', label: 'SLEEP SCHEDULE', value: sleepSchedule, setter: setSleepSchedule, placeholder: 'Enter sleep preference', icon: 'moon-outline' },
        { key: 'guest', label: 'GUEST FREQUENCY', value: guestFrequency, setter: setGuestFrequency, placeholder: 'Enter guest preference', icon: 'people-outline' },
        { key: 'pet', label: 'DO YOU OWN PETS', value: hasPets, setter: setHasPets, placeholder: 'Enter pet preference', icon: 'paw-outline' },
        { key: 'noise', label: 'NOISE LEVEL', value: noiseLevel, setter: setNoiseLevel, placeholder: 'Enter noise preference', icon: 'volume-high-outline' },
        { key: 'sharing', label: 'SHARING COMMON ITEMS', value: sharingCommonItems, setter: setSharingCommonItems, placeholder: 'Enter sharing items preference', icon: 'share-outline' },
        { key: 'diet', label: 'DIETARY PREFERENCE', value: dietaryPreference, setter: setDietaryPreference, placeholder: 'Enter dietary preference', icon: 'restaurant-outline' },
    ];

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const handlePreferenceChange = (key, setter) => (selectedLabel) => {
        const options = preferenceOptions[key];
        const index = options.indexOf(selectedLabel);
        if (index !== -1) {
            setter(index);
        }
    };

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
            setResidence(profile.residence || 'Other Halls/Apartments');
            setBio(profile.bio || '');
            setHobbies(profile.hobbies || []); 
 
            // Set personal traits
            setSmokingStatus(profile.smokingStatus ?? -1);
            setCleanlinessLevel(profile.cleanlinessLevel ?? -1);
            setSleepSchedule(profile.sleepSchedule ?? -1);
            setGuestFrequency(profile.guestFrequency ?? -1);
            setHasPets(profile.hasPets ?? -1);
            setNoiseLevel(profile.noiseLevel ?? -1);
            setSharingCommonItems(profile.sharingCommonItems ?? -1);
            setDietaryPreference(profile.dietaryPreference ?? -1);
            setAllergies(profile.allergies ?? '');            

            // Set roommate preferences
            setRoommateSmokingPreference(profile.roommateSmokingPreference || '');
            setRoommateCleanlinessLevel(profile.roommateCleanlinessLevel || '');
            setRoommateSleepSchedule(profile.roommateSleepSchedule || '');
            setRoommateGuestFrequency(profile.roommateGuestFrequency || '');
            setRoommatePetPreference(profile.roommatePetPreference || '');
            setRoommateNoiseTolerance(profile.roommateNoiseTolerance || '');
            setRoommateSharingCommonItems(profile.roommateSharingCommonItems || '');
            setRoommateDietaryPreference(profile.roommateDietaryPreference || '');

            //Set notification sounds
            setNotifVolume(profile.notifVolume ?? 1);
            setMatchSoundEnabled(profile.matchSoundEnabled ?? true);
            setMessageSoundEnabled(profile.messageSoundEnabled ?? true);


        } catch (error) {
            console.error('Error fetching profile:', error);
            Alert.alert('Error', 'Could not fetch profile details');
        } finally {
            setLoading(false);
        }
    };

    const fetchAndSaveProfileData = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userId = await AsyncStorage.getItem('userId');
            if (!token || !userId) return;
    
            const res = await axios.get(`${config.API_BASE_URL}/api/getProfile`, {
                params: { userId: userId },
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const profile = res.data;
            //console.log(profile)
            if (profile.residence) {
                await AsyncStorage.setItem('residence', profile.residence);
            }
            if (profile.fullName) {
                //console.log(profile.fullName)
                await AsyncStorage.setItem('fullName', profile.fullName);
                //console.log('done')
            }
        } catch (error) {
            console.error('Error fetching profile after submit:', error);
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
                roommateDietaryPreference,

                //Notif Volume
                notifVolume,
                matchSoundEnabled,
                messageSoundEnabled,

            };

            await axios.put(`${config.API_BASE_URL}/api/updateProfile`, updateData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchAndSaveProfileData();
            Alert.alert('Success', 'Profile updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Could not update profile');
        }  finally {
            setSaving(false);
        }
    };

    const handleCredentialUpdate = async () => {
        try {
          const userId = await AsyncStorage.getItem('userId');
          const token = await AsyncStorage.getItem('token');
      
          const updateData = {};
          if (email) updateData.email = email;
          if (password) updateData.password = password;
      
          // send to both endpoints
          await axios.put(`${config.API_BASE_URL}/api/updateCredentials?userId=${userId}`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
          });
      
          await axios.put(`${config.API_BASE_URL}/api/updateAccountCredentials?userId=${userId}`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
          });
      
          Alert.alert('Success', 'Credentials updated successfully!');

          setPassword('');
          setConfirmPassword('');
          setShowPassword(false);
          setShowConfirmPassword(false);
        } catch (error) {
          console.error('Credential update error:', error);
          Alert.alert('Error', error.response?.data?.error || 'Failed to update credentials');
        }
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
                        <CustomDropdown 
                            label="Residence"
                            selectedValue={residence}
                            onValueChange={setResidence}
                            options={residenceOptions}
                            icon="home-outline"
                        />
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

                        {preferenceConfigs.map(({ key, label, value, setter, placeholder, icon }) => (
                            <CustomDropdown
                                key={key}
                                label={label}
                                selectedValue={preferenceOptions[key][value] || ''}
                                onValueChange={handlePreferenceChange(key, setter)}
                                options={preferenceOptions[key]}
                                placeholder={placeholder}
                                icon={icon}
                            />
                        ))}

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
                            options={['Quiet', 'Moderate', 'Loud Environment']}
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

                    { /* Notif Section */ }
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="notifications" size={22} color="#FFFFFF" />
                            <Text style={styles.sectionTitle}>Notification Preferences</Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Notification Volume</Text>
                            <Slider
                            style={{ width: '100%', height: 40 }}
                            minimumValue={0}
                            maximumValue={1}
                            step={0.01}
                            value={notifVolume}
                            onValueChange={setNotifVolume}
                            minimumTrackTintColor="#FFFFFF"
                            maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                            thumbTintColor="#FFFFFF"
                            />
                            <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>
                            Volume: {Math.round(notifVolume * 100)}%
                            </Text>
                        </View>

                        <View style={styles.toggleRow}>
                        <Text style={styles.toggleLabel}>  Match Notification Sound</Text>
                        <Switch
                            value={matchSoundEnabled}
                            onValueChange={setMatchSoundEnabled}
                            trackColor={{ false: '#ccc', true: '#9D67C1' }}
                            thumbColor={matchSoundEnabled ? '#FFFFFF' : '#888'}
                            ios_backgroundColor="#ccc"
                        />
                        </View>

                        <View style={styles.toggleRow}>
                        <Text style={styles.toggleLabel}>  Message Notification Sound</Text>
                        <Switch
                            value={messageSoundEnabled}
                            onValueChange={setMessageSoundEnabled}
                            trackColor={{ false: '#ccc', true: '#9D67C1' }}
                            thumbColor={messageSoundEnabled ? '#FFFFFF' : '#888'}
                            ios_backgroundColor="#ccc"
                        />
                        </View>
                    </View>

                    {/* Edit Password and Email Section */}
                    <View style={styles.sectionContainer}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="lock-closed" size={22} color="#FFFFFF" />
                            <Text style={styles.sectionTitle}>Login Credentials</Text>
                        </View>

                        {/* Email Field */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={20} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                placeholder="Enter new email"
                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            </View>
                        </View>

                        {/* New Password Field */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>New Password</Text>
                            <View style={styles.inputWrapper}>
                            <Ionicons name="key-outline" size={20} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter new password"
                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                name={showPassword ? "eye-off" : "eye"}
                                size={20}
                                color="rgba(255, 255, 255, 0.7)"
                                style={{ paddingHorizontal: 10 }}
                                />
                            </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password Field */}
                        {password.length > 0 && (
                            <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Confirm Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="key" size={20} color="rgba(255, 255, 255, 0.7)" style={styles.inputIcon} />
                                <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Re-enter new password"
                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                />
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons
                                    name={showConfirmPassword ? "eye-off" : "eye"}
                                    size={20}
                                    color="rgba(255, 255, 255, 0.7)"
                                    style={{ paddingHorizontal: 10 }}
                                />
                                </TouchableOpacity>
                            </View>
                            </View>
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.saveButton, 
                                { backgroundColor: isFormValid ? '#8B5CF6' : '#ccc' }
                              ]}
                            onPress={() => {
                            if (password.length > 0) {
                                if (password !== confirmPassword) {
                                Alert.alert("Password Mismatch", "Passwords do not match.");
                                return;
                                } else if (password.length < 8) {
                                Alert.alert("Weak Password", "Password must be at least 8 characters.");
                                return;
                                }
                            }

                            Alert.alert(
                                "Confirm Update",
                                "Are you sure you want to update your login credentials?",
                                [
                                { text: "Cancel", style: "cancel" },
                                { text: "Yes", onPress: handleCredentialUpdate }
                                ]
                            );
                            }}
                        >
                            <Ionicons name="checkmark-outline" size={20} color="#FFFFFF" style={styles.saveButtonIcon} />
                            <Text style={styles.updateCredentialsButtonText}>Update Credentials</Text>
                        </TouchableOpacity>
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
        backgroundColor: '#8B5CF6',
        width: '48%',
        alignSelf: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,       
        marginBottom: 20,
        flexDirection: 'row',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,         
        fontWeight: '600',
    }, 
    updateCredentialsButtonText: {
        color: '#FFFFFF',
        fontSize: 14,         
        fontWeight: '600',
    },
    saveButtonIcon: {
        marginRight: 10,
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
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    }, 
    toggleLabel: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '500',
    },      
});

export default SettingsScreen;