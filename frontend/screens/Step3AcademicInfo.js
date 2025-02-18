import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function Step3AcademicInfo({
    major,
    setMajor,
    minor,
    setMinor,
    graduationYear,
    setGraduationYear,
    handleNext,
    handleBack,
}) {
    // Local state for showing the iOS graduation year modal
    const [showYearPicker, setShowYearPicker] = useState(false);

    // Renders the graduation year picker for iOS or Android.
    const renderYearPicker = () => {
        if (Platform.OS === 'ios') {
            return (
                <>
                    <TouchableOpacity
                        style={styles.pickerContainer}
                        onPress={() => setShowYearPicker(true)}
                    >
                        <Text style={styles.pickerText}>
                            {graduationYear || 'Select Graduation Year'}
                        </Text>
                    </TouchableOpacity>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showYearPicker}
                        onRequestClose={() => setShowYearPicker(false)}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <View style={styles.pickerHeader}>
                                    <TouchableOpacity
                                        onPress={() => setShowYearPicker(false)}
                                        style={styles.pickerHeaderButton}
                                    >
                                        <Text style={styles.pickerHeaderButtonText}>Done</Text>
                                    </TouchableOpacity>
                                </View>
                                <Picker
                                    selectedValue={graduationYear}
                                    onValueChange={(itemValue) => {
                                        setGraduationYear(itemValue);
                                        setShowYearPicker(false);
                                    }}
                                    style={{ color: '#000' }}
                                    itemStyle={{ color: '#000' }}
                                >
                                    <Picker.Item label="Select Graduation Year" value="" />
                                    <Picker.Item label="2025" value="2025" />
                                    <Picker.Item label="2026" value="2026" />
                                    <Picker.Item label="2027" value="2027" />
                                    <Picker.Item label="2028" value="2028" />
                                    <Picker.Item label="2029" value="2029" />
                                    <Picker.Item label="2030" value="2030" />
                                    <Picker.Item label="n/a" value="n/a" />
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
                    selectedValue={graduationYear}
                    onValueChange={(itemValue) => setGraduationYear(itemValue)}
                    style={{ color: '#000' }}
                    itemStyle={{ color: '#000' }}
                >
                    <Picker.Item label="Select Graduation Year" value="" />
                    <Picker.Item label="2025" value="2025" />
                    <Picker.Item label="2026" value="2026" />
                    <Picker.Item label="2027" value="2027" />
                    <Picker.Item label="2028" value="2028" />
                    <Picker.Item label="2029" value="2029" />
                    <Picker.Item label="2030" value="2030" />
                    <Picker.Item label="n/a" value="n/a" />
                </Picker>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Step 3: Academic Information</Text>
            <Text style={styles.label}>Major:</Text>
            <TextInput
                style={styles.input}
                value={major}
                onChangeText={setMajor}
                placeholder="Enter major"
            />
            <Text style={styles.label}>Minor (optional):</Text>
            <TextInput
                style={styles.input}
                value={minor}
                onChangeText={setMinor}
                placeholder="Enter minor"
            />
            <Text style={styles.label}>Graduation Year:</Text>
            {renderYearPicker()}
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#fff',
        padding: Platform.OS === 'ios' ? 12 : 0,
        justifyContent: 'center',
    },
    pickerText: { fontSize: 16, color: '#000' },
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
