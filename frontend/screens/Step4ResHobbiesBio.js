import React from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from 'react-native';

export default function Step4ResHobbiesBio({
    residence,
    setResidence,
    hobbies,
    toggleHobby,
    bio,
    setBio,
    handleSubmit,
    handleBack,
    commonHobbies,
}) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Step 4: Residence, Hobbies, and Bio</Text>
            <Text style={styles.label}>Residence (e.g., Res Hall name, apt, house, etc.):</Text>
            <TextInput
                style={styles.input}
                value={residence}
                onChangeText={setResidence}
                placeholder="Enter your residence details"
            />
            <Text style={styles.label}>Select Your Hobbies:</Text>
            <View style={styles.hobbiesContainer}>
                {commonHobbies.map((hobby) => (
                    <TouchableOpacity
                        key={hobby}
                        style={[
                            styles.hobbyItem,
                            hobbies.includes(hobby) && styles.hobbySelected,
                        ]}
                        onPress={() => toggleHobby(hobby)}
                    >
                        <Text style={[styles.hobbyText, hobbies.includes(hobby) && styles.hobbyTextSelected]}>
                            {hobby}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <Text style={styles.label}>Bio:</Text>
            <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                multiline
                numberOfLines={4}
            />
            <View style={styles.buttonContainer}>
                <Button title="Back" onPress={handleBack} />
                <View style={styles.buttonSpacer} />
                <Button title="Submit" onPress={handleSubmit} />
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
    label: {
        fontSize: 16,
        marginBottom: 8
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    hobbiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 5,
        marginBottom: 16,
    },
    hobbyItem: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 10,
        margin: 5,
    },
    hobbySelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    hobbyText: { color: '#000' },
    hobbyTextSelected: { color: '#fff' },
    bioInput: {
        textAlignVertical: 'top',
        height: 100,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    buttonSpacer: { width: 20 },
});
