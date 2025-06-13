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
    console.error('Login check error:', e);
    return false;
  }
};

// Login function with password verification
export const loginUser = async (email: string, password: string): Promise<boolean> => {
  
  try {
    const usersJSON = await AsyncStorage.getItem('registeredUsers');
    if (!usersJSON) throw new Error('No registered users found');
    
    const registeredUsers: UserData[] = JSON.parse(usersJSON);
    const user = registeredUsers.find(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (!user) throw new Error('Email not registered');
    if (user.password !== password) throw new Error('Incorrect password');
    
    // Store token and current user (without password)
    await AsyncStorage.setItem('userToken', 'dummy_token');
    
    // Save current user without password
    const { password: _, ...safeUser } = user;
    await AsyncStorage.setItem('currentUser', JSON.stringify(safeUser));
    
    return true;
  } catch (e) {
    console.error('Login error:', e);
    throw e;
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
    
    // Set current session token and mark onboarding as complete
    await AsyncStorage.setItem('userToken', 'dummy_token');
    await AsyncStorage.setItem('onboarded', 'true'); // Add this
    
    // Save current user without password
    const { password, ...safeUser } = userData;
    await AsyncStorage.setItem('currentUser', JSON.stringify(safeUser));
  } catch (e) {
    console.error('Onboarding storage error:', e);
    throw e;
  }
};

export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    // Check if user has completed onboarding
    const onboarded = await AsyncStorage.getItem('onboarded');
    return onboarded === 'true';
  } catch (e) {
    console.error('Onboarding check error:', e);
    return false;
  }
};

// Logout function
export const logoutUser = async (): Promise<void> => {
  try {
    // Remove all auth-related data
    await AsyncStorage.multiRemove([
      'userToken',
      'currentUser'
    ]);
  } catch (e) {
    console.error('Logout error:', e);
    throw new Error('Logout failed');
  }
};

// Get user data
export const getUserData = async (): Promise<UserData | null> => {
  try {
    const userData = await AsyncStorage.getItem('currentUser');
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

// To get the current user
export const getCurrentUser = async (): Promise<UserData | null> => {
  try {
    const userData = await AsyncStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  } catch (e) {
    console.error('Get current user error:', e);
    return null;
  }
};

// Update user data
export const updateUser = async (updatedData: UserData): Promise<boolean> => {
  try {
    // Get current user email to find them in registered users
    const currentUser = await getCurrentUser();
    if (!currentUser) return false;
    
    // Update current user
    await AsyncStorage.setItem('currentUser', JSON.stringify(updatedData));
    
    // Update in registered users list
    const usersJSON = await AsyncStorage.getItem('registeredUsers');
    if (!usersJSON) return false;
    
    const users: UserData[] = JSON.parse(usersJSON);
    const updatedUsers = users.map(user => 
      user.email.toLowerCase() === currentUser.email.toLowerCase() 
        ? {...user, ...updatedData} 
        : user
    );
    
    await AsyncStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    return true;
  } catch (e) {
    console.error('Update user error:', e);
    return false;
  }
};

// Delete account
export const deleteAccount = async (email: string): Promise<boolean> => {
  try {
    // Get registered users
    const usersJSON = await AsyncStorage.getItem('registeredUsers');
    if (!usersJSON) return false;
    
    // Filter out deleted user
    const users: UserData[] = JSON.parse(usersJSON);
    const updatedUsers = users.filter(user => 
      user.email.toLowerCase() !== email.toLowerCase()
    );
    
    // Save updated list
    await AsyncStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    // Clear all auth-related data
    await AsyncStorage.multiRemove([
      'userToken',
      'currentUser',
      'onboarded'
    ]);
    
    return true;
  } catch (e) {
    console.error('Delete account error:', e);
    return false;
  }
};

export default {
  loginUser,
  logoutUser,
  completeOnboarding,
  hasCompletedOnboarding,
  isLoggedIn,
  getUserData,
  getRegisteredUsers,
  getCurrentUser,
  updateUser,
  deleteAccount
};