import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    Modal, 
    Platform, 
    StyleSheet, 
    StatusBar 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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
    // Local state for showing the iOS graduation year modal and input focus
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    // Renders the graduation year picker for iOS or Android.
    const renderYearPicker = () => {
        if (Platform.OS === 'ios') {
            return (
                <>
                    <TouchableOpacity
                        style={styles.pickerContainer}
                        onPress={() => setShowYearPicker(true)}
                    >
                        <Ionicons 
                            name="calendar-outline" 
                            size={20} 
                            color="rgba(255, 255, 255, 0.8)" 
                            style={styles.inputIcon} 
                        />
                        <Text style={[
                            styles.pickerText,
                            !graduationYear && styles.placeholderText
                        ]}>
                            {graduationYear || 'Select Graduation Year'}
                        </Text>
                    </TouchableOpacity>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showYearPicker}
                        onRequestClose={() => setShowYearPicker(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <View style={styles.pickerHeader}>
                                        <Text style={styles.pickerTitle}>Graduation Year</Text>
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
                        </View>
                    </Modal>
                </>
            );
        }
        // Android standard picker
        return (
            <View style={styles.pickerContainer}>
                <Ionicons 
                    name="calendar-outline" 
                    size={20} 
                    color="rgba(255, 255, 255, 0.8)" 
                    style={styles.inputIcon} 
                />
                <Picker
                    selectedValue={graduationYear}
                    onValueChange={(itemValue) => setGraduationYear(itemValue)}
                    style={styles.androidPicker}
                    dropdownIconColor="rgba(255, 255, 255, 0.8)"
                >
                    <Picker.Item label="Select Graduation Year" value="" color="rgba(255, 255, 255, 0.6)" />
                    <Picker.Item label="2025" value="2025" color="#fff" />
                    <Picker.Item label="2026" value="2026" color="#fff" />
                    <Picker.Item label="2027" value="2027" color="#fff" />
                    <Picker.Item label="2028" value="2028" color="#fff" />
                    <Picker.Item label="2029" value="2029" color="#fff" />
                    <Picker.Item label="2030" value="2030" color="#fff" />
                    <Picker.Item label="n/a" value="n/a" color="#fff" />
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
                            <Text style={styles.stepNumber}>3</Text>
                        </View>
                        <Text style={styles.title}>Academic Info</Text>
                        <Text style={styles.subtitle}>Share your educational details</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>MAJOR</Text>
                            <View style={[
                                styles.inputWrapper,
                                focusedInput === 'major' && styles.inputWrapperFocused
                            ]}>
                                <Ionicons 
                                    name="school-outline" 
                                    size={20} 
                                    color="rgba(255, 255, 255, 0.8)" 
                                    style={styles.inputIcon} 
                                />
                                <TextInput
                                    style={styles.input}
                                    value={major}
                                    onChangeText={setMajor}
                                    placeholder="Enter your major"
                                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                    onFocus={() => setFocusedInput('major')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>MINOR (OPTIONAL)</Text>
                            <View style={[
                                styles.inputWrapper,
                                focusedInput === 'minor' && styles.inputWrapperFocused
                            ]}>
                                <Ionicons 
                                    name="book-outline" 
                                    size={20} 
                                    color="rgba(255, 255, 255, 0.8)" 
                                    style={styles.inputIcon} 
                                />
                                <TextInput
                                    style={styles.input}
                                    value={minor}
                                    onChangeText={setMinor}
                                    placeholder="Enter your minor"
                                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                    onFocus={() => setFocusedInput('minor')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>
                        </View>
                        
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>GRADUATION YEAR</Text>
                            {renderYearPicker()}
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