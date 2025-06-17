import { 
  View, 
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  Dimensions,
  ScrollView
} from "react-native";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { FONTS } from "../utils/fonts";
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from "../types/navigation";
import { useAuth } from "../context/AuthContext";
import { useFocusEffect } from '@react-navigation/native';
import { getRegisteredUsers } from "../utils/auth";
import { filterMenuItemsByCategory, saveMenuItems, createTable } from "../database";
import { MenuItemDisplay, } from "../types";
import { fetch } from 'expo/fetch';


type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

const categories = ['Starters', 'Mains', 'Desserts', 'Drinks', 'Specials'];

// Local image mapping for menu items API from the course was not Working :/
const LOCAL_IMAGES: Record<string, any> = {
  "Greek Salad": require('../assets/images/Greek salad.png'),
  "Bruschetta": require('../assets/images/Bruschetta.jpg'),
  "Grilled Fish": require('../assets/images/Grilled fish.png'),
  "Pasta": require('../assets/images/Pasta.png'),
  "Lemon Dessert": require('../assets/images/Lemon dessert.png'),
  
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [searchText, setSearchText] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemDisplay[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);
  
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadData = useCallback(async () => {
    const userArray = await getRegisteredUsers();
    const firstName = userArray?.[0]?.firstName || '';
    const lastName = userArray?.[0]?.lastName || '';
    setUsername(`${firstName} ${lastName}`);
  }, []);
  
  const fetchMenuData = useCallback(async () => {
    try {
      setRefreshing(true);
      await createTable();
      
      const response = await fetch(
        'https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json',
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const menuItems = data.menu.map((item: any) => ({
        title: item.name,
        price: item.price,
        description: item.description, 
        image: item.image,
        category: item.category
      }));
      
      await saveMenuItems(menuItems);
      return menuItems;
    } catch (error) {
      console.error('Error fetching menu data:', error);
      return [];
    } finally {
      if (isMounted.current) {
        setRefreshing(false);
      }
    }
  }, []);

  // Fixed database query with proper transaction handling
  const loadMenuItems = useCallback(async () => {
    try {
      setLoadingMenu(true);
      const filteredItems = await filterMenuItemsByCategory(searchText, activeCategories);
      if (isMounted.current) {
        // Create unique keys to prevent duplication
        const uniqueItems = filteredItems.map((item, index) => ({
          ...item,
          key: `${item.title}-${index}`,
        }));
        setMenuItems(uniqueItems);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      if (isMounted.current) {
        setLoadingMenu(false);
      }
    }
  }, [searchText, activeCategories]);

  // Optimized initial loading
  useEffect(() => {
    let isActive = true;
    
    const init = async () => {
      await loadData();
      await fetchMenuData();
      if (isActive) {
        await loadMenuItems();
      }
    };
    
    init();
    
    return () => {
      isActive = false;
    };
  }, []);

// Debounced search
  useEffect(() => {
    let isActive = true;
    const timer = setTimeout(() => {
      if (isActive) {
        loadMenuItems();
      }
    }, 300);
    
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [searchText, activeCategories]);

  const handleRefresh = useCallback(async () => {
    await fetchMenuData();
    await loadMenuItems();
  }, [fetchMenuData, loadMenuItems]);

  const toggleCategory = (category: string) => {
    setActiveCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  useFocusEffect(
    useCallback(() => {
      const checkAuth = async () => {
        if (!isAuthenticated) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });
        } else {
          setLoading(false);
        }
      };

      checkAuth();
    }, [isAuthenticated, navigation])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#495E57" />
      </View>
    );
  }

  const MenuItem = ({ item }: { item: MenuItemDisplay }) => {
    // Use local image if available, otherwise use fallback
    const imageSource = LOCAL_IMAGES[item.title] || require('../assets/images/Grilled fish.png');
     
    return (
      <Pressable 
        style={styles.menuItem}
        onPress={() => navigation.navigate('MenuItemDetails', { menuItem: item })}
      >
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuItemTitle}>{item.title}</Text>
          <Text style={styles.menuItemDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.menuItemPrice}>${item.price}</Text>
        </View>
        <Image
          source={imageSource}
          style={styles.menuItemImage}
        />
      </Pressable>
    );
  };

  const MemoizedMenuItem = React.memo(MenuItem);

  return (
    <View style={styles.container}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/branding/Logo.png')} 
            style={styles.logo}
          />
        </View>
        <Pressable 
          style={styles.profileContainer}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.avatarText}>{username}</Text>
          <Image 
            source={require('../assets/images/Profile.png')} 
            style={styles.profileImage} 
          />
        </Pressable>
      </View>

      {/* Hero Section with Search Bar */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>Little Lemon</Text>
            <Text style={styles.heroSubtitle}>Chicago</Text>
            <Text style={styles.heroDescription}>
              We are a family owned Mediterranean restaurant, focused on traditional 
              recipes served with a modern twist.
            </Text>
          </View>
          <Image 
            source={require('../assets/images/Hero image.png')} 
            style={styles.heroImage} 
          />
        </View>
        
        {/* Search Bar inside Hero Section */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search menu..."
            placeholderTextColor="#6E6E6E"
            value={searchText}
            onChangeText={setSearchText}
          />
          <Image 
            source={require('../assets/images/icon.png')} 
            style={styles.searchIcon} 
          />
        </View>
      </View>

      <View style = {styles.contentContainer}>

      {/* Order Section */}
      <Text style={styles.orderTitle}>ORDER FOR DELIVERY!</Text>
      
      {/* Category Filters */}
      <View style = {styles.categoryWraper}>
     
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map(category => (
          <Pressable
            key={category}
            style={[
              styles.categoryButton,
              activeCategories.includes(category) && styles.activeCategory
            ]}
            onPress={() => toggleCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              activeCategories.includes(category) && styles.activeCategoryText
            ]}>
              {category}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      </View>

      {/* Menu List */}
      {loadingMenu ? (
        <ActivityIndicator size="large" color="#495E57" style={styles.menuLoader} />
      ) : (
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.key || item.title}
          renderItem={({ item }) => <MemoizedMenuItem item={item} />}
          contentContainerStyle={styles.menuList}
          style={styles.menuContainer}
        />       
      )}
    </View>
  </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  navbar: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingTop: 20,
  },
  logoContainer: {
    paddingTop: 20,
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 56,
    resizeMode: 'contain',
  },
  profileContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 18,
    marginTop: 4,
  },
  avatarText: {
    fontSize: 12,
    fontFamily: FONTS.karlaRegular,
    color: '#495E57',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  heroSection: {
    backgroundColor: '#495E57',
    padding: 20,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: 20,
  },
  heroTitle: {
    fontSize: 48,
    fontFamily: FONTS.markaziTextMedium,
    color: '#F4CE14',
    lineHeight: 48,
  },
  heroSubtitle: {
    fontSize: 32,
    fontFamily: FONTS.markaziTextRegular,
    color: '#EDEFEE',
    lineHeight: 32,
    marginTop: -5,
    marginBottom: 15,
  },
  heroDescription: {
    fontSize: 16,
    fontFamily: FONTS.karlaRegular,
    color: '#EDEFEE',
    lineHeight: 22,
  },
  heroImage: {
    width: width * 0.3,
    height: width * 0.3 * 1.2,
    resizeMode: 'cover',
    borderRadius: 12,
  },
  searchContainer: {
    backgroundColor: '#EDEFEE',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.karlaRegular,
    color: '#333',
    height: '100%',
  },
  searchIcon: {
    width: 24,
    height: 24,
    tintColor: '#495E57',
  },
  contentContainer: {
    flex:1,
    paddingBottom:20
  },
  orderTitle: {
    fontSize: 22,
    fontFamily: FONTS.karlaBold,
    color: '#333',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  categoryWraper: {
    maxHeight:50,
    marginBottom:20
  },
  categoriesContainer: {
    paddingHorizontal: 15,
    paddingVertical:5
  },
  categoryButton: {
    backgroundColor: '#EDEFEE',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EDEFEE',
    height:40,
    justifyContent:'center'
  },
  activeCategory: {
    backgroundColor: '#495E57',
    borderColor: '#495E57',
  },
  categoryText: {
    fontSize: 16,
    fontFamily: FONTS.karlaMedium,
    color: '#495E57',
  },
  activeCategoryText: {
    color: '#FFF',
  },
  menuContainer: {
    flex: 1,
  },
  menuList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEFEE',
  },
  menuTextContainer: {
    flex: 1,
    paddingRight: 15,
  },
  menuItemTitle: {
    fontSize: 18,
    fontFamily: FONTS.karlaBold,
    color: '#333',
    marginBottom: 5,
  },
  menuItemDescription: {
    fontSize: 16,
    fontFamily: FONTS.karlaRegular,
    color: '#6E6E6E',
    marginBottom: 10,
    lineHeight: 20,
  },
  menuItemPrice: {
    fontSize: 18,
    fontFamily: FONTS.karlaBold,
    color: '#495E57',
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDEFEE',
  },
  menuLoader: {
    marginVertical: 30,
  },
});

export default HomeScreen;
