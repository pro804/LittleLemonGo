import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch,
  Animated, 
  Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { FONTS } from '../utils/fonts';
import { getRegisteredUsers, updateUser, deleteAccount, } from '../utils/auth';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'Profile'>;

// Define the UserData type
type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string;
};

// Define the NotificationPreferences type
type NotificationPreferences = {
  orderStatuses: boolean;
  passwordChanges: boolean;
  specialOffers: boolean;
  newsLetter: boolean;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { logout: contextLogout } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    orderStatuses: true,
    passwordChanges: true,
    specialOffers: true,
    newsLetter: true
  });

  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Load user data and preferences
  const loadData = useCallback(async () => {
    const userArray = await getRegisteredUsers();
    if (userArray && userArray.length > 0) {
      setUserData(userArray[0]);
    }
    
    try {
      const storedPrefs = await AsyncStorage.getItem('notificationPreferences');
      if (storedPrefs) {
        setPreferences(JSON.parse(storedPrefs));
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }, []);

  // Load data
    useEffect(() => {
      loadData();
    }, [loadData]);

    // Reload data for focus changes
    useFocusEffect(
      useCallback(() => {
        loadData();
      }, [loadData])
    );

  // Handle update of user profile
  const handleUpdate = async () => {
    if (!userData) return;
    
    // Validation
    if (!userData.firstName || !userData.lastName || !userData.email) {
      showFeedback('Please fill all required fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      showFeedback('Please enter a valid email');
      return;
    }
    
    try {
      const success = await updateUser(userData);
      if (success) {
        showFeedback('Profile updated successfully');
        setIsEditing(false);
      } else {
        showFeedback('Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      showFeedback('Error updating profile');
    }
  };

  // Save notification preferences
  const savePreferences = useCallback(async (newPreferences: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
      showFeedback('Preferences saved');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      showFeedback('Failed to save preferences');
    }
  }, []);

  // Show animated feedback
  const showFeedback = useCallback((message: string) => {
    setFeedbackMessage(message);
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        delay: 1500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim]);

  // Handle preference changes
  const handlePreferenceChange = useCallback((preference: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [preference]: value };
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Handle account deletion
  const handleDeleteAccount = useCallback(() => {
    if (!userData) return;
    
    Alert.alert(
      'Delete Account',
      'Are you sure? This will permanently remove your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteAccount(userData.email);
              if (success) {
                await contextLogout();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Welcome' }],
                });
              } else {
                showFeedback('Failed to delete account');
              }
            } catch (error) {
              console.error('Delete error:', error);
              showFeedback('Error deleting account');
            }
          }
        },
      ]
    );
  }, [userData, contextLogout, navigation, showFeedback]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await contextLogout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (e) {
      console.error('Logout error:', e);
    }
  }, [contextLogout, navigation]);

  if (!userData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navbar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.navButton}>
          <MaterialIcons name="arrow-back" size={28} color="#495E57" />
        </Pressable>
        
        <Image 
          source={require('../assets/branding/Logo.png')} 
          style={styles.logo} 
        />
        
        <Pressable onPress={() => navigation.navigate('Profile')} style={styles.navButton}>
          <Image 
            source={require('../assets/images/Profile.png')} 
            style={styles.profileIcon} 
          />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Personal Information</Text>
          
          <View style={styles.profileSection}>
            <Image 
              source={require('../assets/images/Profile.png')}
              style={styles.profileImage} 
            />
            
            <View style={styles.imageActions}>
              <Pressable 
                style={({ pressed }) => [
                  styles.imageButton,
                  { backgroundColor: pressed ? '#F4CE14' : '#495E57' }
                ]}
                onPress={() => console.log('Change image')}
              >
                <Text style={styles.buttonText}>Change</Text>
              </Pressable>
              
              <Pressable 
                style={({ pressed }) => [
                  styles.imageButton,
                  { backgroundColor: pressed ? '#FF6B6B' : '#EE9972' }
                ]}
                onPress={() => console.log('Remove image')}
              >
                <Text style={styles.buttonText}>Remove</Text>
              </Pressable>
            </View>
          </View>
          
          {/* Form section */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  isEditing ? styles.editingInput : styles.staticInput
                ]}
                value={userData.firstName}
                onChangeText={(text) => setUserData({...userData,firstName: text})}
                editable={isEditing}
                placeholder="Enter first name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  isEditing ? styles.editingInput : styles.staticInput
                ]}
                value={userData.lastName}
                onChangeText={(text) => setUserData({...userData, lastName: text})}
                editable={isEditing}
                placeholder="Enter last name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.disabledInput
                ]}
                value={userData.email}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={[
                  styles.input,
                  isEditing ? styles.editingInput : styles.staticInput
                ]}
                value={userData.phone || ''}
                onChangeText={(text) => setUserData({...userData, phone: text})}
                keyboardType="phone-pad"
                editable={isEditing}
                placeholder="Enter phone number"
              />
            </View>

            {isEditing && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Change Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      isEditing ? styles.editingInput : styles.staticInput
                    ]}
                    value={userData.password}
                    onChangeText={(text) => setUserData({...userData, password: text})}
                    secureTextEntry={!showPassword}
                    editable={isEditing}
                    placeholder="Enter new password"
                  />
                  <Pressable
                    style={styles.toggleButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.toggleText}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </Pressable>
                </View>
                <Text style={styles.passwordHint}>
                  {userData.password ? 'Password will be updated' : 'Leave blank to keep current password'}
                </Text>
              </View>
            )}

            <View style={styles.buttonGroup}>
              <Pressable
                style={({ pressed }) => [
                  styles.editButton,
                  { 
                    backgroundColor: pressed ? '#F4CE14' : isEditing ? '#495E57' : '#EDEFEE',
                    marginRight: 10
                  }
                ]}
                onPress={() => isEditing ? handleUpdate() : setIsEditing(true)}
              >
                <Text style={[styles.buttonText, isEditing ? {color: 'white'} : {color: '#333'}]}>
                  {isEditing ? 'Save Changes' : 'Edit Information'}
                </Text>
              </Pressable>
              
              {isEditing && (
                <Pressable
                  style={({ pressed }) => [
                    styles.editButton,
                    { backgroundColor: pressed ? '#FF6B6B' : '#EE9972' }
                  ]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        <View style={styles.notificationSection}>
          <Text style={styles.sectionHeader}>Email notifications</Text>
          
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Order statuses</Text>
            <Switch
              value={preferences.orderStatuses}
              onValueChange={(value) => handlePreferenceChange('orderStatuses', value)}
              trackColor={{ false: '#767577', true: '#495E57' }}
              thumbColor={preferences.orderStatuses ? '#F4CE14' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Password changes</Text>
            <Switch
              value={preferences.passwordChanges}
              onValueChange={(value) => handlePreferenceChange('passwordChanges', value)}
              trackColor={{ false: '#767577', true: '#495E57' }}
              thumbColor={preferences.passwordChanges ? '#F4CE14' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Special offers</Text>
            <Switch
              value={preferences.specialOffers}
              onValueChange={(value) => handlePreferenceChange('specialOffers', value)}
              trackColor={{ false: '#767577', true: '#495E57' }}
              thumbColor={preferences.specialOffers ? '#F4CE14' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Newsletter</Text>
            <Switch
              value={preferences.newsLetter}
              onValueChange={(value) => handlePreferenceChange('newsLetter', value)}
              trackColor={{ false: '#767577', true: '#495E57' }}
              thumbColor={preferences.newsLetter ? '#F4CE14' : '#f4f3f4'}
            />
          </View>
          
          <Animated.Text style={[styles.feedbackText, { opacity: fadeAnim }]}>
            {feedbackMessage}
          </Animated.Text>
        </View>
        
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            { backgroundColor: pressed ? '#FF6B6B' : '#EE9972' }
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
        
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            { backgroundColor: pressed ? '#B00020' : '#FF5252' }
          ]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.buttonText}>Delete Account</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EDEFEE',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONTS.karlaRegular,
    fontSize: 18,
    color: '#495E57',
  },
  navbar: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 40,
    resizeMode: 'contain',
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    fontSize: 24,
    fontFamily: FONTS.karlaBold,
    color: '#333',
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  imageActions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    width: '48%',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  form: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontFamily: FONTS.karlaBold,
    fontSize: 16,
    color: '#495E57',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: FONTS.karlaRegular,
    backgroundColor: '#FAFAFA',
  },
  staticInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingLeft: 0,
    color: '#333',
  },
  editingInput: {
    backgroundColor: '#FFF',
    borderColor: '#495E57',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  toggleButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#EDEFEE',
  },
  toggleText: {
    fontFamily: FONTS.karlaBold,
    fontSize: 14,
    color: '#495E57',
  },
  passwordHint: {
    fontFamily: FONTS.karlaRegular,
    fontSize: 12,
    color: '#777',
    marginTop: 5,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  notificationSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 20,
    fontFamily: FONTS.karlaBold,
    color: '#333',
    marginBottom: 15,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  preferenceLabel: {
    fontFamily: FONTS.karlaRegular,
    fontSize: 16,
    color: '#333',
  },
  feedbackText: {
    marginTop: 10,
    fontFamily: FONTS.karlaRegular,
    fontSize: 14,
    color: '#495E57',
    textAlign: 'center',
  },
  logoutButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: FONTS.karlaBold,
  },
});

export default ProfileScreen;