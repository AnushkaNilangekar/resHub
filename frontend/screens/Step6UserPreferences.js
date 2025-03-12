// File: Step6RoommatePreferences.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function Step6RoommatePreferences({
    roommateSmokingPreference, setRoommateSmokingPreference,
    roommateCleanlinessLevel, setRoommateCleanlinessLevel,
    roommateSleepSchedule, setRoommateSleepSchedule,
    roommateGuestFrequency, setRoommateGuestFrequency,
    roommatePetPreference, setRoommatePetPreference,
    roommateNoiseTolerance, setRoommateNoiseTolerance,
    roommateSharingCommonItems, setRoommateSharingCommonItems,
    roommateDietaryPreference, setRoommateDietaryPreference,
    handleNext, handleBack,
}) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Step 6: Roommate Preferences</Text>
            <Text style={styles.label}>Roommate Smoking Preference:</Text>
            <Picker selectedValue={roommateSmokingPreference} onValueChange={setRoommateSmokingPreference} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Non-Smoker" value="Non-Smoker" />
                <Picker.Item label="Smoker" value="Smoker" />
                <Picker.Item label="Only when I'm not around" value="Only when I'm not around" />
                <Picker.Item label="No Preference" value="No Preference" />
            </Picker>
            <Text style={styles.label}>Roommate Cleanliness Level:</Text>
            <Picker selectedValue={roommateCleanlinessLevel} onValueChange={setRoommateCleanlinessLevel} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Very Clean" value="Very Clean" />
                <Picker.Item label="Moderate" value="Moderate" />
                <Picker.Item label="Messy" value="Messy" />
                <Picker.Item label="No Preference" value="No Preference" />
            </Picker>
            <Text style={styles.label}>Roommate Sleep Schedule:</Text>
            <Picker selectedValue={roommateSleepSchedule} onValueChange={setRoommateSleepSchedule} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Early Bird" value="Early Bird" />
                <Picker.Item label="Night Owl" value="Night Owl" />
                <Picker.Item label="Flexible" value="Flexible" />
                <Picker.Item label="No Preference" value="No Preference" />
            </Picker>
            <Text style={styles.label}>Roommate Guest Frequency:</Text>
            <Picker selectedValue={roommateGuestFrequency} onValueChange={setRoommateGuestFrequency} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Rarely" value="Rarely" />
                <Picker.Item label="Occasionally" value="Occasionally" />
                <Picker.Item label="Frequently" value="Frequently" />
                <Picker.Item label="No Preference" value="No Preference" />
            </Picker>
            <Text style={styles.label}>Roommate Pet Preference:</Text>
            <Picker selectedValue={roommatePetPreference} onValueChange={setRoommatePetPreference} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="No Pets" value="No Pets" />
                <Picker.Item label="Okay with Pets" value="Okay with Pets" />
                <Picker.Item label="No Preference" value="No Preference" />
            </Picker>
            <Text style={styles.label}>Roommate Noise Tolerance:</Text>
            <Picker selectedValue={roommateNoiseTolerance} onValueChange={setRoommateNoiseTolerance} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Quiet" value="Quiet" />
                <Picker.Item label="Moderate Noise" value="Moderate Noise" />
                <Picker.Item label="Loud Environment" value="Loud Environment" />
                <Picker.Item label="No Preference" value="No Preference" />
            </Picker>
            <Text style={styles.label}>Roommate Sharing Common Items:</Text>
            <Picker selectedValue={roommateSharingCommonItems} onValueChange={setRoommateSharingCommonItems} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Strictly Separate" value="Strictly Separate" />
                <Picker.Item label="Willing to Share" value="Willing to Share" />
                <Picker.Item label="Flexible" value="Flexible" />
                <Picker.Item label="No Preference" value="No Preference" />
            </Picker>
            <Text style={styles.label}>Roommate Dietary Preference:</Text>
            <Picker selectedValue={roommateDietaryPreference} onValueChange={setRoommateDietaryPreference} style={styles.picker}>
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Vegetarian" value="Vegetarian" />
                <Picker.Item label="Vegan" value="Vegan" />
                <Picker.Item label="No Restrictions" value="No Restrictions" />
                <Picker.Item label="No Preference" value="No Preference" />
            </Picker>
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
