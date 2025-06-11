import React from 'react';
import Fontloader from './components/FondLoader';
import { StyleSheet, Text, View } from 'react-native';
import WelcomeScreen from './Screens/welcome';

export default function App() {
  return (
    <Fontloader>
      <WelcomeScreen/>
    </Fontloader>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
});