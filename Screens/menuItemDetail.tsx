import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { FONTS } from '../utils/fonts';
import { MenuItemDisplay } from '../types'; 

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type MenuItemDetailsProps = NativeStackScreenProps<RootStackParamList, 'MenuItemDetails'>;

const MenuItemDetailsScreen: React.FC<MenuItemDetailsProps> = ({  route}) => {
  const { menuItem} = route.params;

  const getImageSource = () => {
    switch(menuItem.image) {
      case 'greekSalad.jpg':
        return require('../assets/images/Greek salad.png');
      case 'bruschetta.jpg':
        return require('../assets/images/Bruschetta.jpg');
      case 'grilledFish.jpg':
        return require('../assets/images/Grilled fish.png');
      case 'pasta.jpg':
        return require('../assets/images/Pasta.png');
      case 'lemonDessert.jpg':
        return require('../assets/images/Lemon dessert.png');
      default:
        return require('../assets/images/Pasta.png');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={getImageSource()}
        style={styles.image}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{menuItem.title}</Text>
          <Text style={styles.price}>${menuItem.price}</Text>
        </View>
        
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{menuItem.category}</Text>
        </View>
        
        <Text style={styles.description}>{menuItem.description}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 25,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.markaziTextMedium,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  price: {
    fontSize: 28,
    fontFamily: FONTS.markaziTextMedium,
    color: '#495E57',
  },
  categoryContainer: {
    backgroundColor: '#495E57',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
    marginBottom: 25,
  },
  category: {
    fontSize: 18,
    fontFamily: FONTS.karlaBold,
    color: '#F4CE14',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 18,
    fontFamily: FONTS.karlaRegular,
    color: '#333',
    lineHeight: 26,
  },
});

export default MenuItemDetailsScreen;