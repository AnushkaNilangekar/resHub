import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Alert,
    Modal,
    FlatList 
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TextInput } from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';


const CustomDropdown = ({ label, options, selectedValue, onValueChange }) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.dropdownContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TouchableOpacity 
                style={styles.dropdownButton} 
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.dropdownButtonText}>
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
                                    style={styles.modalOption}
                                    onPress={() => {
                                        onValueChange(item);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.modalOptionText}>{item}</Text>
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
    // Personal Info States
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [major, setMajor] = useState('');
    const [minor, setMinor] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [residence, setResidence] = useState('');
    const [bio, setBio] = useState('');
    const [hobbies, setHobbies] = useState('');

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

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const ProfileInput = ({ label, value, onChangeText, keyboardType = 'default', multiline = false }) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput 
                style={[
                    styles.input, 
                    multiline && styles.multilineInput
                ]} 
                value={value} 
                onChangeText={onChangeText} 
                keyboardType={keyboardType}
                multiline={multiline}
                placeholderTextColor="#999"
            />
        </View>
    );

    const fetchUserProfile = async () => {
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
            setHobbies(profile.hobbies ? profile.hobbies.join(', ') : '');

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
        }
    };

    const handleSaveProfile = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const token = await AsyncStorage.getItem('token');
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
                hobbies: hobbies.split(',').map(h => h.trim()),
                
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
        }
    };

   
    return (
        <GestureHandlerRootView style={styles.rootContainer}>
            <ScrollView 
                style={styles.container}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.scrollViewContent}
            >
                <Text style={styles.pageTitle}>Profile Settings</Text>

                {/* Personal Information Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <ProfileInput 
                        label="Full Name" 
                        value={fullName} 
                        onChangeText={setFullName} 
                    />
                    <ProfileInput 
                        label="Age" 
                        value={age} 
                        onChangeText={setAge} 
                        keyboardType="numeric"
                    />
                    <CustomDropdown 
                        label="Gender"
                        selectedValue={gender}
                        onValueChange={setGender}
                        options={['Female', 'Male', 'Non-Binary', 'Prefer Not to Say']}
                    />
                </View>

                {/* Additional Sections */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Academic Details</Text>
                    <ProfileInput 
                        label="Major" 
                        value={major} 
                        onChangeText={setMajor} 
                    />
                    <CustomDropdown 
                        label="Graduation Year"
                        selectedValue={graduationYear}
                        onValueChange={setGraduationYear}
                        options={['2024', '2025', '2026', '2027']}
                    />
                </View>

                {/* Additional Sections (you can uncomment and add more as needed) */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Additional Information</Text>
                    <ProfileInput 
                        label="Bio" 
                        value={bio} 
                        onChangeText={setBio} 
                        multiline={true}
                    />
                    <ProfileInput 
                        label="Hobbies" 
                        value={hobbies} 
                        onChangeText={setHobbies} 
                        multiline={true}
                    />
                </View>

                {/* Personal Traits Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Personal Traits</Text>
                    <CustomDropdown 
                        label="Smoking Status"
                        selectedValue={smokingStatus}
                        onValueChange={setSmokingStatus}
                        options={['Non-Smoker', 'Smoker']}
                    />
                    <CustomDropdown 
                        label="Cleanliness Level"
                        selectedValue={cleanlinessLevel}
                        onValueChange={setCleanlinessLevel}
                        options={['Very Clean', 'Moderate', 'Messy']}
                    />
                    <CustomDropdown 
                        label="Sleep Schedule"
                        selectedValue={sleepSchedule}
                        onValueChange={setSleepSchedule}
                        options={['Early Bird', 'Night Owl', 'Flexible']}
                    />
                    <CustomDropdown 
                        label="Guest Frequency"
                        selectedValue={guestFrequency}
                        onValueChange={setGuestFrequency}
                        options={['Rarely', 'Occasionally', 'Frequently']}
                    />
                    <CustomDropdown 
                        label="Do you own pets?"
                        selectedValue={hasPets}
                        onValueChange={setHasPets}
                        options={['Yes', 'No', 'Might']}
                    />
                    <CustomDropdown 
                        label="Noise Level"
                        selectedValue={noiseLevel}
                        onValueChange={setNoiseLevel}
                        options={['Quiet', 'Moderate Noise', 'Loud Environment']}
                    />
                    <CustomDropdown 
                        label="Sharing Common Items"
                        selectedValue={sharingCommonItems}
                        onValueChange={setSharingCommonItems}
                        options={['Strictly Separate', 'Willing to Share', 'Flexible']}
                    />
                    <CustomDropdown 
                        label="Dietary Preference"
                        selectedValue={dietaryPreference}
                        onValueChange={setDietaryPreference}
                        options={['Vegetarian', 'Vegan', 'Allergies', 'No Restrictions', 'Other']}
                    />
                    <ProfileInput 
                        label="Allergies" 
                        value={allergies} 
                        onChangeText={setAllergies} 
                        placeholder="Enter allergies if any"
                    />

                    {/* Roommate Preferences Section */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Roommate Preferences</Text>
                        <CustomDropdown 
                            label="Roommate Smoking Preference"
                            selectedValue={roommateSmokingPreference}
                            onValueChange={setRoommateSmokingPreference}
                            options={[
                                'Non-Smoker', 
                                'Smoker', 
                                'Only when I\'m not around'
                            ]}
                        />
                        <CustomDropdown 
                            label="Roommate Cleanliness Level"
                            selectedValue={roommateCleanlinessLevel}
                            onValueChange={setRoommateCleanlinessLevel}
                            options={['Very Clean', 'Moderate', 'Messy']}
                        />
                        <CustomDropdown 
                            label="Roommate Sleep Schedule"
                            selectedValue={roommateSleepSchedule}
                            onValueChange={setRoommateSleepSchedule}
                            options={['Early Bird', 'Night Owl', 'Flexible']}
                        />
                        <CustomDropdown 
                            label="Roommate Guest Frequency"
                            selectedValue={roommateGuestFrequency}
                            onValueChange={setRoommateGuestFrequency}
                            options={['Rarely', 'Occasionally', 'Frequently']}
                        />
                        <CustomDropdown 
                            label="Roommate Pet Preference"
                            selectedValue={roommatePetPreference}
                            onValueChange={setRoommatePetPreference}
                            options={['No Pets', 'Okay with Pets']}
                        />
                        <CustomDropdown 
                            label="Roommate Noise Tolerance"
                            selectedValue={roommateNoiseTolerance}
                            onValueChange={setRoommateSleepSchedule}
                            options={['Quiet', 'Moderate Noise', 'Loud Environment']}
                        />
                        <CustomDropdown 
                            label="Roommate Sharing Common Items"
                            selectedValue={roommateSharingCommonItems}
                            onValueChange={setRoommateSharingCommonItems}
                            options={['Strictly Separate', 'Willing to Share', 'Flexible']}
                        />
                        <CustomDropdown 
                            label="Roommate Dietary Preference"
                            selectedValue={roommateDietaryPreference}
                            onValueChange={setRoommateDietaryPreference}
                            options={['Vegetarian', 'Vegan', 'No Restrictions']}
                        />
                    </View>
                </View>
                {/* Save Button */}
                <TouchableOpacity 
                    style={styles.saveButton} 
                    onPress={handleSaveProfile}
                >
                    <Text style={styles.saveButtonText}>Save Profile</Text>
                </TouchableOpacity>
            </ScrollView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#333'
    },
    sectionContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333'
    },
    inputContainer: {
        marginBottom: 15
    },
    inputLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9'
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: 'top'
    },
    saveButton: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold'
    },
    scrollViewContent: {
        paddingBottom: 100 
    },
    dropdownContainer: {
        marginBottom: 15
    },
    dropdownButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9f9f9'
    },
    dropdownButtonText: {
        fontSize: 16,
        color: '#000'
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        maxHeight: '60%'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
    },
    modalOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    modalOptionText: {
        fontSize: 16
    },
    modalCancelButton: {
        marginTop: 15,
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10
    },
    modalCancelButtonText: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold'
    }   
});


export default SettingsScreen;