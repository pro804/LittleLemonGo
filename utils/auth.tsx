import AsyncStorage from '@react-native-async-storage/async-storage';

// Define a User type for better type safety
type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password?: string; // Add password for login
};

// Check if user is logged in
export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return token !== null;
  } catch (e) {
    console.error('Login check error:',e);
    return false;
  }
};

// Login function with password verification
export const loginUser = async (email: string, password: string): Promise<boolean> => {
  try {
     // Get all registered users
    const usersJSON = await AsyncStorage.getItem('registeredUsers');
    if (!usersJSON) {
    throw new Error('No registered users found');
    }

    const registeredUsers: UserData[] = JSON.parse(usersJSON);

    // Find user by email
    const user = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Verify password (case-sensitive)
    if (!user) {
      throw new Error('Email not registered');
    }
    
    if (user.password !== password) {
      throw new Error('Incorrect password');
    }
    
    await AsyncStorage.setItem('userToken', 'dummy_token');
    return true;
  } catch (e) {
    console.error('Login error:', e);
    throw e; // Re-throw the error
  }
};
    
   

// Complete onboarding (Sign up)
export const completeOnboarding = async (userData: UserData): Promise<void> => {
   try {
    // Get existing users
    const usersJSON = await AsyncStorage.getItem('registeredUsers');
    const existingUsers: UserData[] = usersJSON ? JSON.parse(usersJSON) : [];
    
    // Check if email already exists
    if (existingUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('Email already registered');
    }
    
    // Add new user
    const updatedUsers = [...existingUsers, userData];
    
    // Save all users
    await AsyncStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    // Set current session token
    await AsyncStorage.setItem('userToken', 'dummy_token');
  } catch (e) {
    console.error('Onboarding storage error:', e);
    throw e;
  }
};

export const hasCompletedOnboarding = async (): Promise<boolean> => {
    try {
        const userData = await AsyncStorage.getItem('userData');
        return userData !== null;
    } catch (e) {
        console.error('Onboarding check error:', e);
        return false;
    }
    };


// Logout function
export const logoutUser = async (): Promise<void> => {
    try {
        // Only remove token, keep user data
        await AsyncStorage.removeItem('userToken');
    } catch (e) {
        console.error('Logout error:', e);
        throw new Error('Logout failed');
    }
    };

export const getUserData = async (): Promise<UserData | null> => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (e) {
    console.error('Get user data error:', e);
    return null;
  }
};

// Get registered users (for debugging)
export const getRegisteredUsers = async (): Promise<UserData[]> => {
  try {
    const usersJSON = await AsyncStorage.getItem('registeredUsers');
    return usersJSON ? JSON.parse(usersJSON) : [];
  } catch (e) {
    console.error('Get users error:', e);
    return [];
  }
};

export default {
  loginUser,
  logoutUser,
  completeOnboarding,
  hasCompletedOnboarding,
  isLoggedIn,
  getUserData,
  getRegisteredUsers
};