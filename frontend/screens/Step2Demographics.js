import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  Platform, 
  StyleSheet,
  StatusBar,
  Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

export default function Step2Demographics({ gender, setGender, age, setAge, handleNext, handleBack }) {
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const renderGenderPicker = () => {
        if (Platform.OS === 'ios') {
            return (
                <>
                    <TouchableOpacity
                        style={styles.pickerContainer}
                        onPress={() => setShowGenderPicker(true)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="body-outline" size={20} color="rgba(255, 255, 255, 0.8)" style={styles.inputIcon} />
                        <Text style={[styles.pickerText, !gender && styles.placeholderText]}>
                            {gender || 'Select Gender'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="rgba(255, 255, 255, 0.8)" />
                    </TouchableOpacity>
                    
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showGenderPicker}
                        onRequestClose={() => setShowGenderPicker(false)}
                    >
                        <Pressable 
                            style={styles.modalOverlay} 
                            onPress={() => setShowGenderPicker(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <View style={styles.pickerHeader}>
                                        <Text style={styles.pickerTitle}>Select Gender</Text>
                                        <TouchableOpacity 
                                            onPress={() => setShowGenderPicker(false)} 
                                            style={styles.pickerHeaderButton}
                                        >
                                            <Text style={styles.pickerHeaderButtonText}>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Picker
                                        selectedValue={gender}
                                        onValueChange={(itemValue) => {
                                            setGender(itemValue);
                                        }}
                                        style={{ color: '#333' }}
                                    >
                                        <Picker.Item label="Select Gender" value="" />
                                        <Picker.Item label="Male" value="Male" />
                                        <Picker.Item label="Female" value="Female" />
                                        <Picker.Item label="Non-binary" value="Non-binary" />
                                        <Picker.Item label="Prefer not to say" value="Prefer not to say" />
                                    </Picker>
                                </View>
                            </View>
                        </Pressable>
                    </Modal>
                </>
            );
        }

        // Android picker
        return (
            <View style={styles.pickerContainer}>
                <Ionicons name="body-outline" size={20} color="rgba(255, 255, 255, 0.8)" style={styles.inputIcon} />
                <Picker
                    selectedValue={gender}
                    onValueChange={(itemValue) => setGender(itemValue)}
                    style={styles.androidPicker}
                    dropdownIconColor="rgba(255, 255, 255, 0.8)"
                >
                    <Picker.Item label="Select Gender" value="" />
                    <Picker.Item label="Male" value="Male" />
                    <Picker.Item label="Female" value="Female" />
                    <Picker.Item label="Non-binary" value="Non-binary" />
                    <Picker.Item label="Prefer not to say" value="Prefer not to say" />
                </Picker>
            </View>
        );
    };

    return (
        <>
            {/* First, fill the screen with solid color to avoid any white gaps */}
            <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#4d6ef5',
                zIndex: 0
            }} />
            
            {/* Then add the gradient that will extend beyond screen edges */}
            <LinearGradient
                colors={['#4d6ef5', '#70b2d0', '#6BBFBC', '#4d6ef5']}
                style={{
                    position: 'absolute',
                    top: -5,
                    left: -5,
                    right: -5,
                    bottom: -5,
                    zIndex: 1
                }}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                locations={[0, 0.45, 0.65, 1]}
            />
            
            {/* Make sure status bar is properly handled */}
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            
            {/* Main content */}
            <View style={[styles.container, { zIndex: 2 }]}>
                <View style={styles.contentWrapper}>
                    <View style={styles.headerContainer}>
                        <View style={styles.stepIndicator}>
                            <Text style={styles.stepNumber}>2</Text>
                        </View>
                        <Text style={styles.title}>Demographic Info</Text>
                        <Text style={styles.subtitle}>Tell us a bit about yourself</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>GENDER</Text>
                            {renderGenderPicker()}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>AGE</Text>
                            <View style={[
                                styles.inputWrapper,
                                isFocused && styles.inputWrapperFocused
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
                                    placeholder="Enter your age"
                                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                    keyboardType="numeric"
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                />
                            </View>
                        </View>
                        
                        <View style={styles.progressIndicator}>
                            <View style={styles.progressDot}>
                                <View style={[styles.progressDotInner, styles.progressDotCompleted]} />
                            </View>
                            <View style={styles.progressLine} />
                            <View style={styles.progressDot}>
                                <View style={styles.progressDotInner} />
                            </View>
                            <View style={styles.progressLine} />
                            <View style={styles.progressDot}>
                                <View style={[styles.progressDotInner, styles.progressDotInactive]} />
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
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    contentWrapper: {
        flex: 1,
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
        marginBottom: 25,
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
        padding: 15,
        height: 55,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    pickerText: {
        flex: 1,
        fontSize: 16,
        color: '#fff',
        paddingHorizontal: 15,
    },
    placeholderText: {
        color: 'rgba(255, 255, 255, 0.6)',
    },
    androidPicker: {
        flex: 1,
        color: '#fff',
        marginLeft: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 30 : 0,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    pickerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
    },
    pickerHeaderButton: { 
        padding: 5 
    },
    pickerHeaderButtonText: {
        color: '#4c6ef5',
        fontSize: 16,
        fontWeight: '600',
    },
    progressIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
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