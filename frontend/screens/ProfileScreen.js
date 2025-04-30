import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, SafeAreaView, StyleSheet, StatusBar, ActivityIndicator, Platform, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from "@react-navigation/native";
import axios from "axios";
import config from "../config";
import { colors } from "../styles/colors";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RFPercentage } from "react-native-responsive-fontsize";
import UploadProfilePic from "./UploadProfilePic";

const ProfileScreen = () => {
  const route = useRoute();
  const { userId } = route.params;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(`${config.API_BASE_URL}/api/getProfile`, {
          params: { userId },
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#6C5CE7', '#45aaf2', '#2d98da', '#3867d6']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#6C5CE7', '#45aaf2', '#2d98da', '#3867d6']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#fff" />
            <Text style={styles.loadingText}>Profile not found.</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient colors={[colors.gradientStart, colors.accent2, '#2d98da', colors.primaryDark]} style={styles.gradient}>
      <View style={styles.headerContainer}>
                <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
                >
                <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                </View>
            </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            {/* Profile header */}
            <LinearGradient colors={[colors.primary, colors.primaryLight]} style={styles.cardHeader}>
              <Image source={{ uri: profile.profilePicUrl }} style={styles.profileImage} />
              <View style={styles.headerInfo}>
                <Text style={styles.cardTitle}>{profile.fullName || "No Name"}</Text>
                <View style={styles.basicInfo}>
                  <InfoItem icon="calendar-outline" text={profile.age} />
                  <InfoItem icon="person-outline" text={profile.gender} />
                  <InfoItem icon="calendar-number-outline" text={profile.graduationYear} />
                </View>
              </View>
            </LinearGradient>

            {/* Profile body */}
            <View style={styles.cardBody}>
              <InfoRow label="Major" value={profile.major} icon="school-outline" />
              <InfoRow label="Minor" value={profile.minor} icon="bookmark-outline" />
              <InfoRow label="Residence" value={profile.residence} icon="home-outline" />

              <View style={styles.bioSection}>
                <Text style={styles.sectionTitle}>Bio:</Text>
                <Text style={styles.bioText}>{profile.bio || "No bio available"}</Text>
              </View>

              <View style={styles.bioSection}>
                <Text style={styles.sectionTitle}>Hobbies:</Text>
                <View style={styles.tagContainer}>
                  {profile.hobbies?.length > 0 ? (
                    profile.hobbies.map((hobby, index) => (
                      <View key={index} style={[styles.tag, styles[`tagAccent${index % 5}`]]}>
                        <Text style={styles.tagText}>{hobby}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.hobbiesText}>No hobbies listed</Text>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.cardFooter}>
            <Text style={styles.preferencesTitle}>Living Preferences</Text>
            <View style={styles.preferencesGrid}>
                <View style={styles.preferenceItem}>
                <View style={styles.preferenceHeader}>
                    <Ionicons name="flame-outline" size={18} color={colors.accent1} />
                    <Text style={styles.preferenceLabel}>Smoking:</Text>
                </View>
                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{profile.smokingStatus || "N/A"}</Text>
                </View>
                <View style={styles.preferenceItem}>
                <View style={styles.preferenceHeader}>
                    <Ionicons name="sparkles-outline" size={18} color={colors.accent2} />
                    <Text style={styles.preferenceLabel}>Cleanliness:</Text>
                </View>
                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{profile.cleanlinessLevel || "N/A"}</Text>
                {/* Add progress bar for visual indication */}
                <View style={styles.progressBarContainer}>
                    <View 
                    style={[
                        styles.progressBar, 
                        styles.progressAccent2,
                        {width: getCleanlinessPercentage(profile.cleanlinessLevel)}
                    ]} 
                    />
                </View>
                </View>
                <View style={styles.preferenceItem}>
                <View style={styles.preferenceHeader}>
                    <Ionicons name="volume-high-outline" size={18} color={colors.accent3} />
                    <Text style={styles.preferenceLabel}>Noise:</Text>
                </View>
                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{profile.noiseLevel || "N/A"}</Text>
                {/* Add progress bar for visual indication */}
                <View style={styles.progressBarContainer}>
                    <View 
                    style={[
                        styles.progressBar, 
                        styles.progressAccent3,
                        {width: getNoisePercentage(profile.noiseLevel)}
                    ]} 
                    />
                </View>
                </View>
                <View style={styles.preferenceItem}>
                <View style={styles.preferenceHeader}>
                    <Ionicons name="people-outline" size={18} color={colors.accent4} />
                    <Text style={styles.preferenceLabel}>Sharing:</Text>
                </View>
                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{profile.sharingCommonItems || "N/A"}</Text>
                </View>
                <View style={styles.preferenceItem}>
                <View style={styles.preferenceHeader}>
                    <Ionicons name="restaurant-outline" size={18} color={colors.primaryLight} />
                    <Text style={styles.preferenceLabel}>Diet:</Text>
                </View>
                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{profile.dietaryPreference || "N/A"}</Text>
                </View>
                <View style={styles.preferenceItem}>
                <View style={styles.preferenceHeader}>
                    <Ionicons name="moon-outline" size={18} color={colors.primary} />
                    <Text style={styles.preferenceLabel}>Sleep:</Text>
                </View>
                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{profile.sleepSchedule || "N/A"}</Text>
                </View>
                <View style={styles.preferenceItem}>
                <View style={styles.preferenceHeader}>
                    <Ionicons name="paw-outline" size={18} color={colors.accent1} />
                    <Text style={styles.preferenceLabel}>Pets:</Text>
                </View>
                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{profile.hasPets || "N/A"}</Text>
                </View>
                <View style={styles.preferenceItem}>
                <View style={styles.preferenceHeader}>
                    <Ionicons name="person-add-outline" size={18} color={colors.accent2} />
                    <Text style={styles.preferenceLabel}>Guests:</Text>
                </View>
                <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{profile.guestFrequency || "N/A"}</Text>
                </View>
            </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

// Helpers
const InfoItem = ({ icon, text }) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon} size={16} color="#fff" />
    <Text style={styles.infoText}>{text || "N/A"}</Text>
  </View>
);

const InfoRow = ({ label, value, icon }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={16} color="#444" />
    <Text style={styles.cardText}> {label}: {value || "N/A"}</Text>
  </View>
);

const PreferenceItem = ({ icon, label, value, color, withProgress = false, progress = "0%" }) => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceHeader}>
        <Ionicons name={icon} size={18} color={color} />
        <Text style={styles.preferenceLabel}>{label}:</Text>
      </View>
      <Text style={styles.preferenceValue} numberOfLines={1} ellipsizeMode="tail">{value || "N/A"}</Text>
      {withProgress && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { backgroundColor: color, width: progress }]} />
        </View>
      )}
    </View>
  );
  
  const getCleanlinessPercentage = (level) => {
    switch (level) {
      case 'Very Clean': return '100%';
      case 'Clean': return '75%';
      case 'Moderate': return '50%';
      case 'Relaxed': return '25%';
      case 'Messy': return '10%';
      default: return '0%';
    }
  };
  
  const getNoisePercentage = (level) => {
    switch (level) {
      case 'Very Quiet': return '10%';
      case 'Quiet': return '25%';
      case 'Moderate Noise': return '50%';
      case 'Loud Environment': return '100%';
      case 'Very Loud': return '100%';
      default: return '0%';
    }
  };
  

const styles = StyleSheet.create({
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
        headerContent: {
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
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
        headerTitle: {
          fontSize: 22,
          fontWeight: "bold",
          color: "#fff",
          flex: 1,
          textShadowColor: 'rgba(0, 0, 0, 0.25)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 4,
        },
  safeArea: { flex: 1, backgroundColor: colors.background },
  gradient: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: "#fff", fontSize: 16, marginTop: 12 },
  scrollContent: { padding: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 6,
  },
  cardHeader: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  profileImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.primary },
  headerInfo: { marginLeft: 12 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  basicInfo: { flexDirection: 'row', marginTop: 8 },
  infoItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12 },
  infoText: { marginLeft: 4, color: '#fff', fontSize: 14 },
  cardBody: { backgroundColor: "#fff", padding: 16 },
  cardFooter: {
    padding: 8,
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: 'rgba(69, 170, 242, 0.05)',
    borderTopWidth: 1,
    borderTopColor: colors.border.card,
    marginTop: 'auto',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardText: { fontSize: 16, marginLeft: 8, color: "#333" },
  bioSection: { marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 6, color: "#333" },
  bioText: { fontSize: 15, lineHeight: 20, color: "#555" },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  tag: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 16, marginRight: 8, marginBottom: 8 },
  tagText: { fontSize: 14, color: "#fff" },
  tagAccent0: { backgroundColor: colors.primary },
  tagAccent1: { backgroundColor: colors.accent1 },
  tagAccent2: { backgroundColor: colors.accent2 },
  tagAccent3: { backgroundColor: colors.accent3 },
  tagAccent4: { backgroundColor: colors.accent4 },
  hobbiesText: { fontSize: 15, color: "#555" },
  preferencesTitle: {
    fontSize: RFPercentage(1.8),
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 6,
  },
  preferencesContainer: {
    marginBottom: 0,
    paddingBottom: 80,
  },  
  preferenceItem: {
    width: '48%',
    flexDirection: 'column',
    marginBottom: 8,
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1,
    borderColor: colors.border.card,
  },
  preferenceValue: {
    fontSize: RFPercentage(1.5),
    color: colors.text.primary,
    fontWeight: '500',
    marginLeft: 18,
    marginTop: 1,
    marginBottom: 1,
  },
  progressBarContainer: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 2,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressPrimary: {
    backgroundColor: colors.primary,
  },
  progressAccent1: {
    backgroundColor: colors.accent1,
  },
  progressAccent2: {
    backgroundColor: colors.accent2,
  },
  progressAccent3: {
    backgroundColor: colors.accent3,
  },
  progressAccent4: {
    backgroundColor: colors.accent4,
  },
});

export default ProfileScreen;
