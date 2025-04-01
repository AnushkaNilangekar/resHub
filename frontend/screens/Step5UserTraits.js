import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Platform,
    StatusBar,
    ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function Step5UserTraits({
    smokingStatus, setSmokingStatus,
    cleanlinessLevel, setCleanlinessLevel,
    sleepSchedule, setSleepSchedule,
    guestFrequency, setGuestFrequency,
    hasPets, setHasPets,
    noiseLevel, setNoiseLevel,
    sharingCommonItems, setSharingCommonItems,
    dietaryPreference, setDietaryPreference,
    allergies, setAllergies,
    handleNext, handleBack,
}) {
    const [focusedInput, setFocusedInput] = useState(null);

    const CustomPicker = ({ label, value, onValueChange, options }) => {
        const renderOptions = () => {
            return (
                <View style={styles.optionsContainer}>
                    {options.map(option => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.optionItem,
                                value === option && styles.optionSelected,
                            ]}
                            onPress={() => onValueChange(option)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.optionText,
                                value === option && styles.optionTextSelected
                            ]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        };

        return (
            <View style={styles.inputContainer}>
                <Text style={styles.label}>{label}</Text>
                <View style={[
                    styles.pickerContainer,
                    focusedInput === label && styles.inputWrapperFocused
                ]}>
                    <Ionicons 
                        name="options-outline" 
                        size={20} 
                        color="rgba(255, 255, 255, 0.8)" 
                        style={styles.pickerIcon} 
                    />
                    <TouchableOpacity
                        style={styles.pickerTrigger}
                        onPress={() => setFocusedInput(label === focusedInput ? null : label)}
                    >
                        <Text style={[styles.pickerText, !value || value === "Select an option" ? styles.placeholderText : null]}>
                            {!value || value === "Select an option" ? "Select an option" : value}
                        </Text>
                    </TouchableOpacity>
                </View>
                
                {focusedInput === label && renderOptions()}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <LinearGradient
                colors={['#4c6ef5', '#6C85FF', '#6BBFBC', '#2a47c3']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                locations={[0, 0.4, 0.7, 1]}
            >
                <ScrollView contentContainerStyle={styles.contentWrapper}>
                    <View style={styles.headerContainer}>
                        <View style={styles.stepIndicator}>
                            <Text style={styles.stepNumber}>5</Text>
                        </View>
                        <Text style={styles.title}>Your Traits</Text>
                        <Text style={styles.subtitle}>Tell us more about your lifestyle</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <CustomPicker 
                            label="SMOKING STATUS"
                            value={smokingStatus}
                            onValueChange={setSmokingStatus}
                            options={["Non-Smoker", "Smoker"]}
                        />

                        <CustomPicker 
                            label="CLEANLINESS LEVEL"
                            value={cleanlinessLevel}
                            onValueChange={setCleanlinessLevel}
                            options={["Very Clean", "Moderate", "Messy"]}
                        />

                        <CustomPicker 
                            label="SLEEP SCHEDULE"
                            value={sleepSchedule}
                            onValueChange={setSleepSchedule}
                            options={["Early Bird", "Night Owl", "Flexible"]}
                        />

                        <CustomPicker 
                            label="GUEST FREQUENCY"
                            value={guestFrequency}
                            onValueChange={setGuestFrequency}
                            options={["Rarely", "Occasionally", "Frequently"]}
                        />

                        <CustomPicker 
                            label="DO YOU OWN PETS"
                            value={hasPets}
                            onValueChange={setHasPets}
                            options={["Yes", "No", "Might"]}
                        />

                        <CustomPicker 
                            label="NOISE LEVEL"
                            value={noiseLevel}
                            onValueChange={setNoiseLevel}
                            options={["Quiet", "Moderate Noise", "Loud Environment"]}
                        />

                        <CustomPicker 
                            label="SHARING COMMON ITEMS"
                            value={sharingCommonItems}
                            onValueChange={setSharingCommonItems}
                            options={["Strictly Separate", "Willing to Share", "Flexible"]}
                        />

                        <CustomPicker 
                            label="DIETARY PREFERENCE"
                            value={dietaryPreference}
                            onValueChange={setDietaryPreference}
                            options={["Vegetarian", "Vegan", "Allergies", "No Restrictions", "Other"]}
                        />

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>ALLERGIES</Text>
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
                        
                        <View style={styles.progressIndicator}>
                            <View style={styles.progressDot}>
                                <View style={[styles.progressDotInner, styles.progressDotCompleted]} />
                            </View>
                            <View style={styles.progressLine} />
                            <View style={styles.progressDot}>
                                <View style={[styles.progressDotInner, styles.progressDotCompleted]} />
                            </View>
                            <View style={styles.progressLine} />
                            <View style={styles.progressDot}>
                                <View style={[styles.progressDotInner, styles.progressDotCompleted]} />
                            </View>
                            <View style={styles.progressLine} />
                            <View style={styles.progressDot}>
                                <View style={[styles.progressDotInner, styles.progressDotCompleted]} />
                            </View>
                            <View style={styles.progressLine} />
                            <View style={styles.progressDot}>
                                <View style={styles.progressDotInner} />
                            </View>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={handleBack}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="arrow-back" size={20} color="#fff" style={styles.buttonIcon} />
                            <Text style={styles.backButtonText}>BACK</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.nextButton}
                            onPress={handleNext}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.nextButtonText}>CONTINUE</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4c6ef5',
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
    contentWrapper: {
        flexGrow: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        paddingBottom: 30,
        paddingTop: Platform.OS === 'ios' ? 50 : 70,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    stepIndicator: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    stepNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    title: {
        fontSize: 28,
        color: "#fff",
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.15)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 8,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    inputWrapperFocused: {
        borderColor: '#fff',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        shadowOpacity: 0.2,
    },
    inputIcon: {
        marginLeft: 15,
    },
    input: {
        flex: 1,
        height: 55,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#fff',
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        height: 55,
    },
    pickerIcon: {
        marginLeft: 15,
        marginRight: 5,
    },
    pickerTrigger: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
    },
    pickerText: {
        fontSize: 16,
        color: '#fff',
        paddingHorizontal: 10,
    },
    placeholderText: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    optionsContainer: {
        marginTop: 5,
        marginBottom: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    optionItem: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    optionSelected: {
        backgroundColor: 'rgba(74, 222, 128, 0.3)',
    },
    optionText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
    },
    optionTextSelected: {
        fontWeight: '600',
    },
    progressIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    progressDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressDotInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    progressDotInactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    progressDotCompleted: {
        backgroundColor: '#4ade80',
    },
    progressLine: {
        height: 2,
        width: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        flex: 1,
        marginRight: 10,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    nextButton: {
        backgroundColor: '#4c6ef5',
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        flex: 1.5,
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    buttonIcon: {
        marginLeft: 8,
        marginRight: 8,
    }
});