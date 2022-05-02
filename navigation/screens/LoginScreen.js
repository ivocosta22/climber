import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/core'
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator} from 'react-native'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../../firebase'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as Google from 'expo-google-app-auth'
import googleServicesFile from "../../google_config/google-services.json"



const LoginScreen = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [googleSubmitting, setGoogleSubmitting] = useState(false)

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const navigation = useNavigation()

    useEffect(() => {
      const unlisten = auth.onAuthStateChanged(user => {
        if (user) {
          navigation.navigate("MainContainer")
        }
      })
      
      return unlisten
    }, [])

    const handleSignUp = () => {
      //TODO: When autofilling email, it adds a space. Handle that.
      createUserWithEmailAndPassword(auth, email, password)
      .then(userCredentials => {
        const user = userCredentials.user;
        console.log('Registered in with:', user.email);
      })
      .catch(error => alert(error.message))
    }

    const handleLogin = () => {
      signInWithEmailAndPassword(auth, email, password)
      .then(userCredentials => {
        const user = userCredentials.user;
        console.log('Logged in with:', user.email);
      })
      .catch(error => alert(error.message))
    }

    const handleGoogleSignIn = () => {
      setGoogleSubmitting(true);
      const config = {
        iosClientID: '806149464222-1va0ggce9mfm69bml0up6kjru0cehajp.apps.googleusercontent.com',
        androidClientID: googleServicesFile.client[0].oauth_client[0].client_id,
        scopes: ['profile', 'email']
      };
      Google
      .logInAsync(config)
      .then((result) => {
        const {type, user} = result;

        if (type == 'success') {
          const {email, name, photoUrl} = user
          handleMessage('Google signin successful', 'SUCCESS');
          setTimeout(() => navigation.navigate('MainContainer', {email, name, photoUrl}), 1000);
        } else {
          handleMessage('Google signin was cancelled');
        }
        setGoogleSubmitting(false);
      })
      .catch (error => {
        console.log(error);
        handleMessage('An error occurred. Check your network and try again');
        setGoogleSubmitting(false);
      })
    }

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior="padding"
        >
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='Email'
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={styles.input}
                />
                <TextInput
                    placeholder='Password'
                    value={password}
                    onChangeText={text => setPassword(text)}
                    style={styles.input}
                    secureTextEntry
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleLogin} style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSignUp} style={[styles.button, styles.buttonOutline]}>
                    <Text style={styles.buttonOutlineText}>Register</Text>
                </TouchableOpacity>        
            </View>

            {!googleSubmitting && (
              <FontAwesome.Button name="google" backgroundColor="#4285F4" style={{fontFamily: "Roboto"}} onPress={handleGoogleSignIn}>
                Login with Google
              </FontAwesome.Button>
            )}
  
            {googleSubmitting && (
              <FontAwesome.Button disabled={true} name="google" backgroundColor="#4285F4" style={{fontFamily: "Roboto"}} onPress={handleGoogleSignIn}>
                <ActivityIndicator size="large" color='white'/>
              </FontAwesome.Button>
            )}

        </KeyboardAvoidingView>
    )
}

export default LoginScreen

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'black',
    },
    inputContainer: {
      width: '80%'
    },
    input: {
      backgroundColor: 'white',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 10,
      marginTop: 5,
    },
    buttonContainer: {
      width: '60%',
      justifyContent: 'center',
      marginTop: 40,
    },
    button: {
      backgroundColor: '#0782F9',
      width: '100%',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonOutline: {
      backgroundColor: 'white',
      marginTop: 10,
      marginBottom: 20,
      borderColor: '#0782F9',
      borderWidth: 2,
    },
    buttonText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 16,
    },
    buttonOutlineText: {
      color: '#0782F9',
      fontWeight: '700',
      fontSize: 16,
    },
})