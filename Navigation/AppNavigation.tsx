
import {createStackNavigator} from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import WelcomeScreen from '../Screens/welcome';
import homeScreen from '../Screens/home';
import OnboardingScreen from '../Screens/onboarding';
import LoginScreen from '../Screens/login';
import ProfileScreen from '../Screens/profile';

import { isLoggedIn, hasCompletedOnboarding } from '../utils/auth';
import { useEffect, useState } from 'react';
import { RootStackParamList } from '../types/navigation';

const stack = createStackNavigator<RootStackParamList>();


export default function AppNavigator() {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const checkAuthStatus = async () =>{
        const onboarded = await hasCompletedOnboarding();

        const loggedIn = await isLoggedIn();

        setIsAuthenticated(loggedIn || onboarded);
        setLoading(false);
     };
     checkAuthStatus();
  },[]);

  if (loading){
    return null;
  }



    return (
        <NavigationContainer>
            <stack.Navigator 
            screenOptions={{headerShown: false}}
            initialRouteName={isAuthenticated ? 'Home':'Welcome'}
            >
                <stack.Screen name='Welcome' component={WelcomeScreen}/>
                <stack.Screen name='Onboarding' component={OnboardingScreen}/>
                <stack.Screen name='Login' component={LoginScreen}/>
                <stack.Screen name='Home' component={homeScreen}/>
                <stack.Screen name='Profile' component={ProfileScreen}/>
            </stack.Navigator>
        </NavigationContainer>
    );
}