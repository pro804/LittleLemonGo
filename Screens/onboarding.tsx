import React, { useState} from "react";
import { View,Text,TextInput,TouchableOpacity,StyleSheet,Image,Animated } from "react-native";
import {Formik} from 'formik';
import * as yup from 'yup';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import { RootStackParamList } from "../types/navigation";
import { completeOnboarding } from "../utils/auth";

type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const  OnboardingScreen : React.FC<OnboardingScreenProps> = ({navigation}) =>{

  const [loginHover, setLoginHover]= useState(false);
  const [errorAnim] = useState(new Animated.Value(0)); 
  const [errorMessage, setErrorMessage] = useState('');


 // Create animated error style
  const errorStyle = {
    opacity: errorAnim,
    transform: [{
      translateX: errorAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [-10, 5, 0]
      })
    }]
  };

   // Corrected validation schema
  const signupSchema = yup.object().shape({

    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    phone: yup.string().matches(/^[0-9]{10}$/, 'Invalid phone number').nullable(),
});

   const animateError = () => {
    Animated.sequence([
      Animated.timing(errorAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(errorAnim, { toValue: 0, duration: 300, useNativeDriver: true, delay: 2000 })
    ]).start();
  };

  
  return(
    <View style={styles.container}>
      {/*Navbar */}
      <View style={styles.navbar}>
        <Image source={require('../assets/branding/Logo.png')} style={styles.logo}/>
      </View>

      {/*Content Section */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign Up</Text>
        </View>


      {/*Slogan with background */}

      <View style={styles.sloganContainer}>

        <Text style={styles.slogan}>
          Join our familly table for exclusive offers, seasonal feasts with Mediterranean flavors.
        </Text>

        <Image source={require('../assets/images/Hero image.png')}style={styles.sloganImage}/>

      </View>

      {/*Signup Form */}

       <Formik
          initialValues={{ 
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            phone: ''}}

          validationSchema={signupSchema}
          onSubmit={async (values) => {
            try {
              const userData = {  
                ...values,
                password:'demoPassword' //  Adding password for demo purpose
              }
              await completeOnboarding(values);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            } catch (e) {
              console.error('Onboarding error:', e);
              animateError();
              setErrorMessage('Failed to create account. Please try again.');          
            }
          }}
        >
          

          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="First Name*"
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  value={values.firstName}
                />
                {touched.firstName && errors.firstName && (
                  <Animated.Text style={[styles.error, errorStyle]}>
                    {errors.firstName}
                  </Animated.Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Last Name*"
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  value = {values.lastName}
                />
                {touched.lastName && errors.lastName && (
                  <Animated.Text style={[styles.error, errorStyle]}>
                    {errors.lastName}
                  </Animated.Text>
                )}
              </View>
              
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Email*"
                  keyboardType="email-address"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                />
                {touched.email && errors.email && (
                  <Animated.Text style={[styles.error, errorStyle]}>
                    {errors.email}
                  </Animated.Text>
                )}
              </View>

               <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Password*"
                  secureTextEntry
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                />
                {touched.password && errors.password && (
                  <Animated.Text style={[styles.error, errorStyle]}>
                    {errors.password}
                  </Animated.Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="Phone (optional)"
                  keyboardType="phone-pad"
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  value={values.phone}
                />
                {touched.phone && errors.phone && (
                  <Animated.Text style={[styles.error, errorStyle]}>
                    {errors.phone}
                  </Animated.Text>
                )}
              </View>


              {/* Add form-level error message */}
              {errorMessage ? (
                <Animated.Text style={[styles.error, styles.formError, errorStyle]}>
                  {errorMessage}
                </Animated.Text>
              ) : null}

              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  if (Object.keys(errors).length > 0) animateError();
                  handleSubmit();
                }}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}

       </Formik>

       <TouchableOpacity
        onPress={()=> navigation.navigate('Login')}
        onPressIn={()=> setLoginHover(true)}
        onPressOut={()=> setLoginHover(false)}
        style={[styles.loginLink, loginHover && styles.loginHover]}
        >
          <Text style={styles.loginText}>Already have an account? Login</Text>
        
        </TouchableOpacity>
        
      </View>
    </View>
  )
};







const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEFEE',
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
    marginBottom: 5,
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
  sloganContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4CE14',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
    alignItems: 'center',
  },
  slogan: {
    fontSize: 18,
    fontFamily: 'Karla-Bold',
    color: '#333',
    flex: 1,
  },
  sloganImage: {
    width: 150,
    height: 170,
    marginLeft: 10,
  },
  form: {
    marginBottom: 20,
  },
  formError: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
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
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Karla-Bold',
  },
  loginLink: {
    alignSelf: 'center',
    padding: 10,
    borderRadius: 8,
  },
  loginHover: {
    backgroundColor: '#F0F0F0',
  },
  loginText: {
    color: '#495E57',
    fontSize: 16,
    fontFamily: 'Karla-Bold',
  },
});

export default OnboardingScreen