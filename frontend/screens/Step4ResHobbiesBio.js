import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    Platform,
    StatusBar,
    Modal,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

export default function Step4ResHobbiesBio({
    residence,
    setResidence,
    hobbies,
    toggleHobby,
    bio,
    setBio,
    handleNext,
    handleBack,
    commonHobbies,
}) {
    const [focusedInput, setFocusedInput] = useState(null);
    const [showResidencePicker, setShowResidencePicker] = useState(false);

    const renderResidencePicker = () => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>RESIDENCE</Text>
            {Platform.OS === 'ios' ? (
                <>
                    <TouchableOpacity
                        style={styles.pickerContainer}
                        onPress={() => setShowResidencePicker(true)}
                    >
                        <Ionicons 
                            name="home-outline" 
                            size={20} 
                            color="rgba(255, 255, 255, 0.8)" 
                            style={styles.inputIcon} 
                        />
                        <Text style={[
                            styles.pickerText,
                            !residence && styles.placeholderText
                        ]}>
                            {residence || 'Select Residence'}
                        </Text>
                    </TouchableOpacity>
    
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={showResidencePicker}
                        onRequestClose={() => setShowResidencePicker(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <View style={styles.pickerHeader}>
                                        <Text style={styles.pickerTitle}>Select Residence</Text>
                                        <TouchableOpacity
                                            onPress={() => setShowResidencePicker(false)}
                                            style={styles.pickerHeaderButton}
                                        >
                                            <Text style={styles.pickerHeaderButtonText}>Done</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Picker
                                        selectedValue={residence}
                                        onValueChange={(itemValue) => {
                                            setResidence(itemValue);
                                            setShowResidencePicker(false);
                                        }}
                                    >
                                        <Picker.Item label="Select Residence" value="" />
                                        <Picker.Item label="Harrison" value="Harrison" />
                                        <Picker.Item label="Hillenbrand" value="Hillenbrand" />
                                        <Picker.Item label="Windsor" value="Windsor" />
                                        <Picker.Item label="Honors" value="Honors" />
                                        <Picker.Item label="Earhart" value="Earhart" />
                                        <Picker.Item label="Owen" value="Owen" />
                                        <Picker.Item label="First Street Towers" value="First Street Towers" />
                                        <Picker.Item label="Meredith South" value="Meredith South" />
                                        <Picker.Item label="Meredith" value="Meredith" />
                                        <Picker.Item label="Shreve" value="Shreve" />
                                        <Picker.Item label="McCutcheon" value="McCutcheon" />
                                        <Picker.Item label="Hawkins" value="Hawkins" />
                                        <Picker.Item label="Frieda Parker" value="Frieda Parker" />
                                        <Picker.Item label="Winifred Parker" value="Winifred Parker" />
                                        <Picker.Item label="Cary Quadrangle" value="Cary Quadrangle" />
                                        <Picker.Item label="Tarkington" value="Tarkington" />
                                        <Picker.Item label="Wiley" value="Wiley" />
                                        <Picker.Item label="On-campus Apartments" value="On-campus Apartments" />
                                        <Picker.Item label="Off-campus Apartments" value="Off-campus Apartments" />
                                        <Picker.Item label="Other Halls/Apartments" value="Other Halls/Apartments" />
                                    </Picker>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </>
            ) : (
                <View style={styles.androidPickerWrapper}>
                    <Ionicons 
                        name="home-outline" 
                        size={20} 
                        color="rgba(255, 255, 255, 0.8)" 
                        style={styles.inputIcon} 
                    />
                    <View style={styles.androidPickerContainer}>
                        <Picker
                            selectedValue={residence}
                            onValueChange={(itemValue) => setResidence(itemValue)}
                            style={styles.androidPicker}
                            dropdownIconColor="rgba(255, 255, 255, 0.8)"
                        >
                            <Picker.Item label="Select Residence" value="" color="#333" />
                            <Picker.Item label="Harrison" value="Harrison" color="#333" />
                            <Picker.Item label="Hillenbrand" value="Hillenbrand" color="#333" />
                            <Picker.Item label="Windsor" value="Windsor" color="#333" />
                            <Picker.Item label="Honors" value="Honors" color="#333" />
                            <Picker.Item label="Earhart" value="Earhart" color="#333" />
                            <Picker.Item label="Owen" value="Owen" color="#333" />
                            <Picker.Item label="First Street Towers" value="First Street Towers" color="#333" />
                            <Picker.Item label="Meredith South" value="Meredith South" color="#333" />
                            <Picker.Item label="Meredith" value="Meredith" color="#333" />
                            <Picker.Item label="Shreve" value="Shreve" color="#333" />
                            <Picker.Item label="McCutcheon" value="McCutcheon" color="#333" />
                            <Picker.Item label="Hawkins" value="Hawkins" color="#333" />
                            <Picker.Item label="Frieda Parker" value="Frieda Parker" color="#333" />
                            <Picker.Item label="Winifred Parker" value="Winifred Parker" color="#333" />
                            <Picker.Item label="Cary Quadrangle" value="Cary Quadrangle" color="#333" />
                            <Picker.Item label="Tarkington" value="Tarkington" color="#333" />
                            <Picker.Item label="Wiley" value="Wiley" color="#333" />
                            <Picker.Item label="On-campus Apartments" value="On-campus Apartments" color="#333" />
                            <Picker.Item label="Off-campus Apartments" value="Off-campus Apartments" color="#333" />
                            <Picker.Item label="Other Halls/Apartments" value="Other Halls/Apartments" color="#333" />
                        </Picker>
                    </View>
                </View>
            )}
        </View>
    );

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
            <ScrollView contentContainerStyle={styles.contentWrapper}>
                <View style={styles.headerContainer}>
                    <View style={styles.stepIndicator}>
                        <Text style={styles.stepNumber}>4</Text>
                    </View>
                    <Text style={styles.title}>Personal Details</Text>
                    <Text style={styles.subtitle}>Tell us more about yourself</Text>
                </View>

                <View style={styles.formContainer}>
                    {renderResidencePicker()}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>HOBBIES</Text>
                        <View style={styles.hobbiesContainer}>
                            {commonHobbies.map((hobby) => (
                                <TouchableOpacity
                                    key={hobby}
                                    style={[
                                        styles.hobbyItem,
                                        hobbies.includes(hobby) && styles.hobbySelected,
                                    ]}
                                    onPress={() => toggleHobby(hobby)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.hobbyText, 
                                        hobbies.includes(hobby) && styles.hobbyTextSelected
                                    ]}>
                                        {hobby}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>BIO</Text>
                        <View style={[
                            styles.inputWrapper,
                            styles.bioInputWrapper,
                            focusedInput === 'bio' && styles.inputWrapperFocused
                        ]}>
                            <Ionicons 
                                name="person-outline" 
                                size={20} 
                                color="rgba(255, 255, 255, 0.8)" 
                                style={[styles.inputIcon, styles.bioIcon]} 
                            />
                            <TextInput
                                style={[styles.input, styles.bioInput]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about yourself"
                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                maxLength={40} 
                                onFocus={() => setFocusedInput('bio')}
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
                        onPress={() => {
                            if (!residence) {
                                setResidence('Other Halls/Apartments');
                            }
                            handleNext();
                        }}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.nextButtonText}>CONTINUE</Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    </>
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4c6ef5',
    },
    gradient: {
        flex: 1,
    },
    contentWrapper: {
        flexGrow: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 25,
        paddingBottom: 30,
        paddingTop: Platform.OS === 'ios' ? 50 : 70,
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
    bioInputWrapper: {
        height: 120,
        alignItems: 'flex-start',
    },
    inputWrapperFocused: {
        borderColor: '#fff',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        shadowOpacity: 0.2,
    },
    inputIcon: {
        marginLeft: 15,
    },
    bioIcon: {
        marginTop: 15,
    },
    input: {
        flex: 1,
        height: 55,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#fff',
    },
    bioInput: {
        height: 120,
        textAlignVertical: 'top',
        paddingTop: 15,
    },
    hobbiesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginVertical: 5,
    },
    hobbyItem: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 14,
        margin: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    hobbySelected: {
        backgroundColor: '#4ade80',
        borderColor: '#4ade80',
    },
    hobbyText: { 
        color: '#fff',
        fontWeight: '500',
    },
    hobbyTextSelected: { 
        color: '#fff',
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
    androidPickerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        overflow: 'hidden',
        height: 55,
    },
    androidPickerContainer: {
        flex: 1,
        height: 55,
    },
    androidPicker: {
        flex: 1,
        color: '#fff',
        marginLeft: -3,
    },
});