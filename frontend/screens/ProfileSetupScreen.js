import React, { useState, useEffect, useRef, useContext } from 'react';
import { ScrollView, Alert, StyleSheet } from 'react-native';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Demographics from './Step2Demographics';
import Step3AcademicInfo from './Step3AcademicInfo';
import Step4ResHobbiesBio from './Step4ResHobbiesBio';
import Step5UserTraits from './Step5UserTraits';
import Step6RoommatePreferences from './Step6UserPreferences';
import UploadProfilePic from './UploadProfilePic';
import config from '../config';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from '../context/AuthContext';

const ProfileSetupScreen = ({ navigation }) => {
    const {profileSetup, logout} = useContext(AuthContext);  
    // Step state (1-4)
    const [step, setStep] = useState(1);

    // State for Step 1: Basic Information
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');

    // State for Step 2: Demographics
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');

    // State for Step 3: Academic Information
    const [major, setMajor] = useState('');
    const [minor, setMinor] = useState('');
    const [graduationYear, setGraduationYear] = useState('');

    // State for Step 4: Residence, Hobbies, and Bio
    const [residence, setResidence] = useState('');
    const [hobbies, setHobbies] = useState([]);
    const [bio, setBio] = useState('');

    // State for userId
    const [userId, setUserId] = useState('');

    // State for User's Own Traits
    const [smokingStatus, setSmokingStatus] = useState(-1);
    const [cleanlinessLevel, setCleanlinessLevel] = useState(-1);
    const [sleepSchedule, setSleepSchedule] = useState(-1);
    const [guestFrequency, setGuestFrequency] = useState(-1);
    const [hasPets, setHasPets] = useState(-1);
    const [noiseLevel, setNoiseLevel] = useState(-1);
    const [sharingCommonItems, setSharingCommonItems] = useState(-1);
    const [dietaryPreference, setDietaryPreference] = useState(-1);
    const [allergies, setAllergies] = useState('');

    // State for Roommate Preferences
    const [roommateSmokingPreference, setRoommateSmokingPreference] = useState('');
    const [roommateCleanlinessLevel, setRoommateCleanlinessLevel] = useState('');
    const [roommateSleepSchedule, setRoommateSleepSchedule] = useState('');
    const [roommateGuestFrequency, setRoommateGuestFrequency] = useState('');
    const [roommatePetPreference, setRoommatePetPreference] = useState('');
    const [roommateNoiseTolerance, setRoommateNoiseTolerance] = useState('');
    const [roommateSharingCommonItems, setRoommateSharingCommonItems] = useState('');
    const [roommateDietaryPreference, setRoommateDietaryPreference] = useState('');

    const [imageUri, setImageUri] = useState('https://reshub-profile-pics.s3.amazonaws.com/default-avatar.jpg');

    // Common hobbies list for multi-select
    const commonHobbies = ["Reading", "Hiking", "Gaming", "Cooking", "Traveling", "Sports", "Music", "Art", "Working Out"];

    // Toggle hobby selection
    const toggleHobby = (hobby) => {
        if (hobbies.includes(hobby)) {
            // remove current hobby if already selected
            setHobbies(hobbies.filter((currentHobby) => currentHobby !== hobby));
        } else {
            // add hobby if not already selected
            setHobbies([...hobbies, hobby]);
        }
    };

    const scrollViewRef = useRef(null);

    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
    }, [step]);

    useEffect(() => {
        const fetchEmail = async () => {
            try {
                const storedEmail = await AsyncStorage.getItem('userEmail');
                if (storedEmail) {
                    setEmail(storedEmail);
                } else {
                    Alert.alert('Error', 'No email found. Please log in again.');
                    navigation.navigate('Login');
                }
            } catch (error) {
                console.error('Error fetching email:', error);
                Alert.alert('Error', 'Failed to retrieve email.');
            }
        };

        const fetchUserId = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                if (storedUserId) {
                    setUserId(storedUserId);
                } else {
                    Alert.alert('Error', 'No userId found. Please log in again.');
                    navigation.navigate('Login');
                }
            } catch (error) {
                console.error('Error fetching userId:', userId);
                Alert.alert('Error', 'Failed to retrieve userId.');
            }
        };

        fetchEmail();
        fetchUserId();
    }, []);

    // handleNext: Validate fields on current step.
    // For step 1, also check if the email is already in use.
    const handleNext = async () => {
        if (step === 1) {
            if (!fullName.trim()) {
                Alert.alert('Error', 'Please enter your full name.');
                return;
            }
        }
        if (step === 2) {
            if (!gender || !age.trim()) {
                Alert.alert('Error', 'Please select your gender and enter your age.');
                return;
            }
        }
        if (step === 3) {
            if (!major.trim() || !graduationYear) {
                Alert.alert('Error', 'Please enter your major and select your graduation year.');
                return;
            }
        }
        setStep(step + 1);
    };


    // handleBack: Go back one step or exit if on the first step.
    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            navigation.goBack();
        }
    };
    
    // Is called in handle submit after profile is created - creates support bot chat
    const createSupportBotChat = async () => {
        token = await AsyncStorage.getItem('token');
        id = await AsyncStorage.getItem('userId');

        console.log('\n', token, '\n')
        console.log('\n', id, '\n')

        try
        {
            const response = await axios.post(`${config.API_BASE_URL}/api/botpress/createChat?userId=${id}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                console.log('Support bot chat created successfully');
            }
        } catch (error) {
            console.error('Support bot chat creation error:', error.response || error);
            Alert.alert('Error', error.response?.data || error.message);
        }
    }

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
            if (profile.residence) {
                await AsyncStorage.setItem('residence', profile.residence);
            }
            if (profile.fullName) {
                await AsyncStorage.setItem('fullName', profile.fullName);
            }
        } catch (error) {
            console.error('Error fetching profile after submit:', error);
        }
    };
    
    // handleSubmit: Final submission of profile data.
    const handleSubmit = async () => {
        const profileData = {
            userId,
            email,
            fullName,
            gender,
            age: parseInt(age),
            major,
            minor,
            graduationYear,
            residence,
            hobbies,
            bio,
            profilePicUrl: imageUri,
            // New fields for user's own traits:
            smokingStatus,
            cleanlinessLevel,
            sleepSchedule,
            guestFrequency,
            hasPets,
            noiseLevel,
            sharingCommonItems,
            dietaryPreference,
            allergies,
            // New fields for roommate preferences:
            roommateSmokingPreference,
            roommateCleanlinessLevel,
            roommateSleepSchedule,
            roommateGuestFrequency,
            roommatePetPreference,
            roommateNoiseTolerance,
            roommateSharingCommonItems,
            roommateDietaryPreference,
        };

        try {
            const token = await AsyncStorage.getItem("token");
            await AsyncStorage.setItem("userEmail", email);

            const response = await axios.post(`${config.API_BASE_URL}/api/profile`, profileData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {

                createSupportBotChat();
                profileSetup();
                await fetchAndSaveProfileData();
                Alert.alert('Success', 'Profile created successfully');
            }
        } catch (error) {
            console.error('Profile creation error:', error.response || error);
            Alert.alert('Error', error.response?.data || error.message);
        }
    };



    return (
        <ScrollView contentContainerStyle={styles.container} ref={scrollViewRef}>
            {step === 1 && (
                <Step1BasicInfo
                    fullName={fullName}
                    setFullName={setFullName}
                    handleNext={handleNext}
                />
            )}
            {step === 2 && (
                <Step2Demographics
                    gender={gender}
                    setGender={setGender}
                    age={age}
                    setAge={setAge}
                    handleNext={handleNext}
                    handleBack={handleBack}
                />
            )}
            {step === 3 && (
                <Step3AcademicInfo
                    major={major}
                    setMajor={setMajor}
                    minor={minor}
                    setMinor={setMinor}
                    graduationYear={graduationYear}
                    setGraduationYear={setGraduationYear}
                    handleNext={handleNext}
                    handleBack={handleBack}
                />
            )}
            {step === 4 && (
                <Step4ResHobbiesBio
                    residence={residence}
                    setResidence={setResidence}
                    hobbies={hobbies}
                    toggleHobby={toggleHobby}
                    bio={bio}
                    setBio={setBio}
                    handleNext={handleNext}
                    handleBack={handleBack}
                    commonHobbies={commonHobbies}
                />
            )}
            {step === 5 && (
                <Step5UserTraits
                    smokingStatus={smokingStatus} setSmokingStatus={setSmokingStatus}
                    cleanlinessLevel={cleanlinessLevel} setCleanlinessLevel={setCleanlinessLevel}
                    sleepSchedule={sleepSchedule} setSleepSchedule={setSleepSchedule}
                    guestFrequency={guestFrequency} setGuestFrequency={setGuestFrequency}
                    hasPets={hasPets} setHasPets={setHasPets}
                    noiseLevel={noiseLevel} setNoiseLevel={setNoiseLevel}
                    sharingCommonItems={sharingCommonItems} setSharingCommonItems={setSharingCommonItems}
                    dietaryPreference={dietaryPreference} setDietaryPreference={setDietaryPreference}
                    allergies={allergies} setAllergies={setAllergies}
                    handleNext={handleNext}
                    handleBack={handleBack}
                />
            )}
            {step === 6 && (
                <UploadProfilePic onPictureUploaded={(uri) => setImageUri(uri)}
                    handleSubmit={handleSubmit}
                    handleBack={handleBack}
                />
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
});

export default ProfileSetupScreen;