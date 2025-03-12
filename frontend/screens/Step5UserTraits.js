import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
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
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Step 5: Your Own Traits</Text>
            <Text style={styles.label}>Do you smoke?</Text>
            <Picker selectedValue={smokingStatus} onValueChange={setSmokingStatus} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Non-Smoker" value="Non-Smoker" />
                <Picker.Item label="Smoker" value="Smoker" />
                <Picker.Item label="Occasional Smoker" value="Occasional Smoker" />
            </Picker>
            <Text style={styles.label}>Cleanliness Level</Text>
            <Picker selectedValue={cleanlinessLevel} onValueChange={setCleanlinessLevel} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Very Clean" value="Very Clean" />
                <Picker.Item label="Moderate" value="Moderate" />
                <Picker.Item label="Messy" value="Messy" />
                <Picker.Item label="Other" value="Other" />
            </Picker>
            <Text style={styles.label}>Sleep Schedule</Text>
            <Picker selectedValue={sleepSchedule} onValueChange={setSleepSchedule} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Early Bird" value="Early Bird" />
                <Picker.Item label="Night Owl" value="Night Owl" />
                <Picker.Item label="Flexible" value="Flexible" />
                <Picker.Item label="Other" value="Other" />
            </Picker>
            <Text style={styles.label}>Guest Frequency</Text>
            <Picker selectedValue={guestFrequency} onValueChange={setGuestFrequency} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Rarely" value="Rarely" />
                <Picker.Item label="Occasionally" value="Occasionally" />
                <Picker.Item label="Frequently" value="Frequently" />
            </Picker>
            <Text style={styles.label}>Do you own pets?</Text>
            <Picker selectedValue={hasPets} onValueChange={setHasPets} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
            </Picker>
            <Text style={styles.label}>Noise Level</Text>
            <Picker selectedValue={noiseLevel} onValueChange={setNoiseLevel} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Quiet" value="Quiet" />
                <Picker.Item label="Moderate Noise" value="Moderate Noise" />
                <Picker.Item label="Loud Environment" value="Loud Environment" />
            </Picker>
            <Text style={styles.label}>Sharing Common Items</Text>
            <Picker selectedValue={sharingCommonItems} onValueChange={setSharingCommonItems} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Strictly Separate" value="Strictly Separate" />
                <Picker.Item label="Willing to Share" value="Willing to Share" />
                <Picker.Item label="Flexible" value="Flexible" />
            </Picker>
            <Text style={styles.label}>Dietary Preference</Text>
            <Picker selectedValue={dietaryPreference} onValueChange={setDietaryPreference} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Vegetarian" value="Vegetarian" />
                <Picker.Item label="Vegan" value="Vegan" />
                <Picker.Item label="Allergies" value="Allergies" />
                <Picker.Item label="No Restrictions" value="No Restrictions" />
                <Picker.Item label="Other" value="Other" />
            </Picker>
            <Text style={styles.label}>Allergies</Text>
            <TextInput style={styles.input} value={allergies} onChangeText={setAllergies} placeholder="Enter allergies if any" placeholderTextColor="#888" />
            <View style={styles.buttonContainer}>
                <Button title="Back" onPress={handleBack} />
                <Button title="Next" onPress={handleNext} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    title: {
        fontSize: 22,
        marginBottom: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    label: { fontSize: 16, marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    picker: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
});
