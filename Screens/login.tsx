import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { loginUser } from '../utils/auth';


type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [loginHover, setLoginHover] = useState(false);
  const [errorAnim] = useState(new Animated.Value(0));
  const [errorMessage, setErrorMessage] = useState('');

  const [showPassword, setShowPassword] = useState(false); // State to track password visibility

  const [loginError, setLoginError] = useState<string | null>(null);
  const shakeAnimation = useRef(new Animated.Value(0)).current;



  // Validation schema
  const loginSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  });

  // Animation for error messages
  const animateError = () => {
    Animated.sequence([
      Animated.timing(errorAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(errorAnim, { toValue: 0, duration: 300, useNativeDriver: true, delay: 2000 })
    ]).start();
  };

  const errorStyle = {
    opacity: errorAnim,
    transform: [{
      translateX: errorAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [-10, 5, 0]
      })
    }]
  };

  // Create shake animation function
  const animateLoginError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };


  

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Image source={require('../assets/branding/Logo.png')} style={styles.logo} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Login</Text>
          <Text style={styles.subtitle}>Welcome back</Text>
        </View>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={ async (values) => {
            try{
            setLoginError(null); // Reset error message
            const success = await loginUser(values.email, values.password);
            if (success){
              navigation.reset({
                index: 0,
                routes: [{name:'Home'}],
              });
            } else {
              animateLoginError();
              setLoginError('Invalid email or password');
            }
          } catch (e:any){
            animateLoginError();
            if (e.message === 'Email not registered') {
              setLoginError('Email not found. Please sign up first.');
            } else if (e.message === 'Incorrect password') {
              setLoginError('Incorrect password. Please try again.');
            } else {
              setLoginError('Login failed. Please try again.');
                    }
          }}
        }
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <Animated.View 
                style={[
                  styles.form, 
                  { transform: [{ translateX: shakeAnimation }] }
                ]}
              >

             {/* Email field */}
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input,
                    loginError && styles.inputError]
                  }

                  placeholder="Email"
                  keyboardType="email-address"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                />
                {touched.email && errors.email && (
                  <Text style={styles.error}>{errors.email}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={[
                    styles.input,
                    loginError && styles.inputError
                  ]}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.toggleText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
                {touched.password && errors.password && (
                  <Text style={styles.error}>{errors.password}</Text>
                )}
              </View>

              {/* Login error message */}
              {loginError && (
                <Text style={styles.loginError}>{loginError}</Text>
              )}

              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  loginError && styles.submitButtonError
                ]} 
                onPress={() => {handleSubmit()}}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Formik>

        <TouchableOpacity
          onPress={() => navigation.navigate('Onboarding')}
          onPressIn={() => setLoginHover(true)}
          onPressOut={() => setLoginHover(false)}
          style={[styles.signupLink, loginHover && styles.loginHover]}
        >
          <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 64,
    fontFamily: 'MarkaziText-Medium',
    color: '#333',
  },
  subtitle: {
    fontSize: 40,
    fontFamily: 'MarkaziText-Regular',
    color: '#495E57',
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    fontFamily: 'Karla-Regular',
  },
   inputError: {
    borderColor: 'red',
    backgroundColor: '#FFF0F0',
  },
  loginError: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Karla-Bold',
  },
  error: {
    color: 'red',
    marginTop: 5,
    fontFamily: 'Karla-Italic',
  },
  submitButton: {
    backgroundColor: '#495E57',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonError: {
  backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Karla-Bold',
  },
  signupLink: {
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
  },
  loginHover: {
    backgroundColor: '#F0F0F0',
  },
  signupText: {
    color: '#495E57',
    fontSize: 16,
    fontFamily: 'Karla-Bold',
  },
  passwordToggle: {
  position: 'absolute',
  right: 15,
  top: 15,
  },
  toggleText: {
    color: '#495E57',
    fontFamily: 'Karla-Bold',
  },
});

export default LoginScreen;