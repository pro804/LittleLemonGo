import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { FONTS } from "../utils/fonts";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from "../types/navigation";
import { useAuth } from "../context/AuthContext"; // Add this
import { useFocusEffect } from '@react-navigation/native'; // Add this
import { useEffect, useState } from "react"; // Add this

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { isAuthenticated } = useAuth(); // Get auth status
  const [loading, setLoading] = useState(true); // Loading state

  // Check authentication status on focus
  useFocusEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        // Redirect to Welcome screen if not authenticated
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  });

  // Show loading indicator while checking auth status
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#495E57" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Image source={require('../assets/branding/Logo.png')} style={styles.logo} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Little Lemon</Text>
        
        <Pressable
          onPress={() => navigation.navigate('Profile')}
          style={({ pressed }) => [
            styles.heroContainer,
            { opacity: pressed ? 0.8 : 1 }
          ]}
        >
          <Image 
            source={require('../assets/images/Profile.png')} 
            style={styles.heroImage} 
          />
          <Text style={styles.heroText}>View Your Profile</Text>
        </Pressable>
        
        <Text style={styles.subtitle}>Today's Specials</Text>
        {/* Add menu items here later */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  navbar: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  logo: {
    width: 180,
    height: 56,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontFamily: 'MarkaziText-Medium',
    color: '#495E57',
    marginBottom: 20,
  },
  heroContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  heroText: {
    fontSize: 20,
    fontFamily: 'Karla-Bold',
    color: '#495E57',
  },
  subtitle: {
    fontSize: 30,
    fontFamily: 'MarkaziText-Regular',
    color: '#333',
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEFEE',
  },
});

export default HomeScreen;