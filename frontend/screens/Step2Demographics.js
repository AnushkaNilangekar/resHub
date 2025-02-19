import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function Step2Demographics({ gender, setGender, age, setAge, handleNext, handleBack }) {
    // Local state for showing the iOS modal picker
    const [showGenderPicker, setShowGenderPicker] = useState(false);

    // Renders the gender picker based on platform.
    const renderGenderPicker = () => {
        if (Platform.OS === 'ios') {
            return (
                <>
                    <TouchableOpacity
                        style={styles.pickerContainer}
                        onPress={() => setShowGenderPicker(true)}
                    >
                        <Text style={styles.pickerText}>{gender || 'Select Gender'}</Text>
                    </TouchableOpacity>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showGenderPicker}
                        onRequestClose={() => setShowGenderPicker(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <View style={styles.pickerHeader}>
                                    <TouchableOpacity onPress={() => setShowGenderPicker(false)} style={styles.pickerHeaderButton}>
                                        <Text style={styles.pickerHeaderButtonText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <Picker
                                    selectedValue={gender}
                                    onValueChange={(itemValue) => {
                                        setGender(itemValue);
                                        setShowGenderPicker(false);
                                    }}
                                    style={{ color: '#000' }}
                                    itemStyle={{ color: '#000' }}
                                >
                                    <Picker.Item label="Select Gender" value="" />
                                    <Picker.Item label="Male" value="Male" />
                                    <Picker.Item label="Female" value="Female" />
                                </Picker>
                            </View>
                        </View>
                    </Modal>
                </>
            );
        }
        // Android standard picker
        return (
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={gender}
                    onValueChange={(itemValue) => setGender(itemValue)}
                    style={{ color: '#000' }}
                    itemStyle={{ color: '#000' }}
                >
                    <Picker.Item label="Select Gender" value="" />
                    <Picker.Item label="Male" value="Male" />
                    <Picker.Item label="Female" value="Female" />
                </Picker>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Step 2: Demographics</Text>
            <Text style={styles.label}>Gender:</Text>
            {renderGenderPicker()}
            <Text style={styles.label}>Age:</Text>
            <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Enter age"
                keyboardType="numeric"
            />
            <View style={styles.buttonContainer}>
                <Button title="Back" onPress={handleBack} />
                <View style={styles.buttonSpacer} />
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
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: "#a9a9a9",
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#fff',
        padding: Platform.OS === 'ios' ? 12 : 0,
        justifyContent: 'center',
    },
    pickerText: {
        fontSize: 16,
        color: '#000'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    pickerHeaderButton: { padding: 4 },
    pickerHeaderButtonText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    buttonSpacer: { width: 20 },
});
