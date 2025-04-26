import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import config from "../config";
import { LinearGradient } from 'expo-linear-gradient';

const reportReasons = [
  { id: "inappropriate", label: "Inappropriate Content" },
  { id: "harassment", label: "Harassment or Bullying" },
  { id: "spam", label: "Spam" },
  { id: "scam", label: "Scam or Fraud" },
  { id: "impersonation", label: "Impersonation" },
  { id: "other", label: "Other" }
];

const ReportScreen = ({ route }) => {
  const { chatId, otherUserId, name, messageTimestamp } = route.params;
  const navigation = useNavigation();
  
  const [selectedReason, setSelectedReason] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert("Error", "Please select a reason for your report.");
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("token");
      
      const reportData = {
        reporterId: userId,
        reportedUserId: otherUserId,
        chatId: chatId,
        reason: reportReasons.find(r => r.id === selectedReason)?.label || selectedReason,
        additionalInfo: additionalInfo.trim(),
        messageTimestamp: messageTimestamp || new Date().toISOString(),
        reportTimestamp: new Date().toISOString()
      };

      //console.log("Sending report data:", JSON.stringify(reportData, null, 2));

      const response = await axios.post(
        `${config.API_BASE_URL}/api/reports/create`, 
        reportData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      //console.log("Response received:", response.data);

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting report:", error);
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", JSON.stringify(error.response.headers, null, 2));
      }
      
      Alert.alert(
        "Error",
        "There was a problem submitting your report. Please try again later."
      );
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    navigation.navigate('Main', { screen: 'Chats' });
  };
  

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <LinearGradient
          colors={['#4c6ef5', '#6C85FF', '#6BBFBC', '#2a47c3']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.4, 0.7, 1]}
        >
          <View style={styles.thanksContainer}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleClose}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.thanksContent}>
              <View style={styles.checkIconContainer}>
                <Ionicons name="checkmark-circle" size={80} color="#fff" />
              </View>
              
              <Text style={styles.thanksTitle}>Thank You!</Text>
              <Text style={styles.thanksText}>
                Your report has been submitted successfully. We appreciate your help in keeping our community safe.
              </Text>
              <Text style={styles.thanksSubtext}>
                Our team will review your report and take appropriate action. You'll receive an email confirmation shortly.
              </Text>
              
              <TouchableOpacity 
                style={styles.returnButton} 
                onPress={handleClose}
              >
                <Text style={styles.returnButtonText}>Return to Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#4c6ef5', '#6C85FF', '#6BBFBC', '#2a47c3']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.4, 0.7, 1]}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Report Chat</Text>
          </View>
          
          <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.reportInfoContainer}>
              <Ionicons name="information-circle-outline" size={22} color="#fff" />
              <Text style={styles.reportInfoText}>
                Please select a reason for reporting this chat. Your report will help us maintain a safe community.
              </Text>
            </View>
            
            <Text style={styles.sectionTitle}>Reporting conversation with:</Text>
            <View style={styles.userInfoContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="person" size={24} color="#fff" />
              </View>
              <Text style={styles.userName}>{name}</Text>
            </View>
            
            <Text style={styles.sectionTitle}>Select a reason:</Text>
            <View style={styles.reasonsContainer}>
              {reportReasons.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={[
                    styles.reasonButton,
                    selectedReason === reason.id && styles.reasonButtonSelected
                  ]}
                  onPress={() => setSelectedReason(reason.id)}
                >
                  <Text style={[
                    styles.reasonText,
                    selectedReason === reason.id && styles.reasonTextSelected
                  ]}>
                    {reason.label}
                  </Text>
                  {selectedReason === reason.id && (
                    <Ionicons name="checkmark-circle" size={22} color="#4c6ef5" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>Additional Information (optional):</Text>
            <TextInput
              style={styles.additionalInfoInput}
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              placeholder="Please provide any additional details..."
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              multiline
              numberOfLines={5}
              maxLength={500}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selectedReason || isSubmitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!selectedReason || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Report</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4c6ef5',
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  reportInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: "#fff",
  },
  reportInfoText: {
    color: "#fff",
    fontSize: 15,
    marginLeft: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 2,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  reasonsContainer: {
    marginBottom: 20,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  reasonButtonSelected: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  reasonText: {
    fontSize: 16,
    color: "#555",
  },
  reasonTextSelected: {
    fontWeight: "600",
    color: "#4c6ef5",
  },
  additionalInfoInput: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
    color: "#fff",
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  submitButton: {
    backgroundColor: "#2a47c3",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "rgba(42, 71, 195, 0.5)",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  thanksContainer: {
    flex: 1,
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thanksContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  checkIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  thanksTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  thanksText: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  thanksSubtext: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
  },
  returnButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  returnButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ReportScreen;