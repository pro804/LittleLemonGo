import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image,
  Pressable,
  ScrollView,
  TextInput,
  Switch,
  Animated, 
  Alert } from 'react-native';
import ProfileStyles from '../Styles/ProfileStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
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
      <SafeAreaView style={ProfileStyles.safeArea}>
        <View style={ProfileStyles.loadingContainer}>
          <Text style={ProfileStyles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={ProfileStyles.safeArea}>
      <View style={ProfileStyles.navbar}>
        <Pressable onPress={() => navigation.goBack()} style={ProfileStyles.navButton}>
          <AntDesign name="leftcircle" size={32} color="#495E57" />
        </Pressable>
        
        <Image 
          source={require('../assets/branding/Logo.png')} 
          style={ProfileStyles.logo} 
        />
        
        <Pressable onPress={() => navigation.navigate('Profile')} style={ProfileStyles.navButton}>
          <Image 
            source={require('../assets/images/Profile.png')} 
            style={ProfileStyles.profileIcon} 
          />
        </Pressable>
      </View>

      <ScrollView 
        style={ProfileStyles.scrollContainer}
        contentContainerStyle={ProfileStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={ProfileStyles.card}>
          <Text style={ProfileStyles.cardHeader}>Personal Information</Text>
          
          <View style={ProfileStyles.profileSection}>
            <Image 
              source={require('../assets/images/Profile.png')}
              style={ProfileStyles.profileImage} 
            />
            
            <View style={ProfileStyles.imageActions}>
              <Pressable 
                style={({ pressed }) => [
                  ProfileStyles.imageButton,
                  { backgroundColor: pressed ? '#F4CE14' : '#495E57' }
                ]}
                onPress={() => console.log('Change image')}
              >
                <Text style={ProfileStyles.buttonText}>Change</Text>
              </Pressable>
              
              <Pressable 
                style={({ pressed }) => [
                  ProfileStyles.imageButton,
                  { backgroundColor: pressed ? '#FF6B6B' : '#EE9972' }
                ]}
                onPress={() => console.log('Remove image')}
              >
                <Text style={ProfileStyles.buttonText}>Remove</Text>
              </Pressable>
            </View>
          </View>
          
          {/* Form section */}
          <View style={ProfileStyles.form}>
            <View style={ProfileStyles.inputGroup}>
              <Text style={ProfileStyles.inputLabel}>First Name *</Text>
              <TextInput
                style={[
                  ProfileStyles.input,
                  isEditing ? ProfileStyles.editingInput : ProfileStyles.staticInput
                ]}
                value={userData.firstName}
                onChangeText={(text) => setUserData({...userData,firstName: text})}
                editable={isEditing}
                placeholder="Enter first name"
              />
            </View>

            <View style={ProfileStyles.inputGroup}>
              <Text style={ProfileStyles.inputLabel}>Last Name *</Text>
              <TextInput
                style={[
                  ProfileStyles.input,
                  isEditing ? ProfileStyles.editingInput : ProfileStyles.staticInput
                ]}
                value={userData.lastName}
                onChangeText={(text) => setUserData({...userData, lastName: text})}
                editable={isEditing}
                placeholder="Enter last name"
              />
            </View>

            <View style={ProfileStyles.inputGroup}>
              <Text style={ProfileStyles.inputLabel}>Email *</Text>
              <TextInput
                style={[
                  ProfileStyles.input,
                  ProfileStyles.disabledInput
                ]}
                value={userData.email}
                editable={false}
              />
            </View>

            <View style={ProfileStyles.inputGroup}>
              <Text style={ProfileStyles.inputLabel}>Phone Number</Text>
              <TextInput
                style={[
                  ProfileStyles.input,
                  isEditing ? ProfileStyles.editingInput : ProfileStyles.staticInput
                ]}
                value={userData.phone || ''}
                onChangeText={(text) => setUserData({...userData, phone: text})}
                keyboardType="phone-pad"
                editable={isEditing}
                placeholder="Enter phone number"
              />
            </View>

            {isEditing && (
              <View style={ProfileStyles.inputGroup}>
                <Text style={ProfileStyles.inputLabel}>Change Password</Text>
                <View style={ProfileStyles.passwordContainer}>
                  <TextInput
                    style={[
                      ProfileStyles.input,
                      ProfileStyles.passwordInput,
                      isEditing ? ProfileStyles.editingInput : ProfileStyles.staticInput
                    ]}
                    value={userData.password}
                    onChangeText={(text) => setUserData({...userData, password: text})}
                    secureTextEntry={!showPassword}
                    editable={isEditing}
                    placeholder="Enter new password"
                  />
                  <Pressable
                    style={ProfileStyles.toggleButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={ProfileStyles.toggleText}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </Pressable>
                </View>
                <Text style={ProfileStyles.passwordHint}>
                  {userData.password ? 'Password will be updated' : 'Leave blank to keep current password'}
                </Text>
              </View>
            )}

            <View style={ProfileStyles.buttonGroup}>
              <Pressable
                style={({ pressed }) => [
                  ProfileStyles.editButton,
                  { 
                    backgroundColor: pressed ? '#F4CE14' : isEditing ? '#495E57' : '#EDEFEE',
                    marginRight: 10
                  }
                ]}
                onPress={() => isEditing ? handleUpdate() : setIsEditing(true)}
              >
                <Text style={[ProfileStyles.buttonText, isEditing ? {color: 'white'} : {color: '#333'}]}>
                  {isEditing ? 'Save Changes' : 'Edit Information'}
                </Text>
              </Pressable>
              
              {isEditing && (
                <Pressable
                  style={({ pressed }) => [
                    ProfileStyles.editButton,
                    { backgroundColor: pressed ? '#FF6B6B' : '#EE9972' }
                  ]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={ProfileStyles.buttonText}>Cancel</Text>
                </Pressable>
              )}
            </View>
            
            <Animated.Text style={[ProfileStyles.feedbackText, { opacity: fadeAnim }]}>
            {feedbackMessage}
            </Animated.Text>

          </View>
        </View>

        <View style={ProfileStyles.notificationSection}>
          <Text style={ProfileStyles.sectionHeader}>Email notifications</Text>
          
          <View style={ProfileStyles.preferenceRow}>
            <Text style={ProfileStyles.preferenceLabel}>Order statuses</Text>
            <Switch
              value={preferences.orderStatuses}
              onValueChange={(value) => handlePreferenceChange('orderStatuses', value)}
              trackColor={{ false: '#767577', true: '#495E57' }}
              thumbColor={preferences.orderStatuses ? '#F4CE14' : '#f4f3f4'}
            />
          </View>
          
          <View style={ProfileStyles.preferenceRow}>
            <Text style={ProfileStyles.preferenceLabel}>Password changes</Text>
            <Switch
              value={preferences.passwordChanges}
              onValueChange={(value) => handlePreferenceChange('passwordChanges', value)}
              trackColor={{ false: '#767577', true: '#495E57' }}
              thumbColor={preferences.passwordChanges ? '#F4CE14' : '#f4f3f4'}
            />
          </View>
          
          <View style={ProfileStyles.preferenceRow}>
            <Text style={ProfileStyles.preferenceLabel}>Special offers</Text>
            <Switch
              value={preferences.specialOffers}
              onValueChange={(value) => handlePreferenceChange('specialOffers', value)}
              trackColor={{ false: '#767577', true: '#495E57' }}
              thumbColor={preferences.specialOffers ? '#F4CE14' : '#f4f3f4'}
            />
          </View>
          
          <View style={ProfileStyles.preferenceRow}>
            <Text style={ProfileStyles.preferenceLabel}>Newsletter</Text>
            <Switch
              value={preferences.newsLetter}
              onValueChange={(value) => handlePreferenceChange('newsLetter', value)}
              trackColor={{ false: '#767577', true: '#495E57' }}
              thumbColor={preferences.newsLetter ? '#F4CE14' : '#f4f3f4'}
            />
          </View>
          
          <Animated.Text style={[ProfileStyles.feedbackText, { opacity: fadeAnim }]}>
            {feedbackMessage}
          </Animated.Text>
        </View>
        
        <Pressable
          style={({ pressed }) => [
            ProfileStyles.logoutButton,
            { backgroundColor: pressed ? '#FF6B6B' : '#EE9972' }
          ]}
          onPress={handleLogout}
        >
          <Text style={ProfileStyles.buttonText}>Logout</Text>
        </Pressable>
        
        <Pressable
          style={({ pressed }) => [
            ProfileStyles.deleteButton,
            { backgroundColor: pressed ? '#B00020' : '#FF5252' }
          ]}
          onPress={handleDeleteAccount}
        >
          <Text style={ProfileStyles.buttonText}>Delete Account</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};



export default ProfileScreen;