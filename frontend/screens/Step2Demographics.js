import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
        <LinearGradient
            colors={['#6C85FF', '#4A90E2', '#7B4A9E']}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            locations={[0, 0.6, 1]}
        >
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
                    placeholderTextColor="#a9a9a9"
                />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleBack}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                    <View style={styles.buttonSpacer} />
                    <TouchableOpacity style={styles.button} onPress={handleNext}>
                        <Text style={styles.buttonText}>Next</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#fff',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: "#fff",
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        fontSize: 16,
        color: '#000',
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
    button: {
        backgroundColor: '#4A90E2',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
    },
});