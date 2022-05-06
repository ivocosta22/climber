import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/core'
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../../firebase'

const LoginScreen = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
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
        const user = userCredentials.user
        console.log('Registered in with:', user.email)
      })
      .catch(error => alert(error.message))
    }

    const handleLogin = () => {
      signInWithEmailAndPassword(auth, email, password)
      .then(userCredentials => {
        const user = userCredentials.user
        console.log('Logged in with:', user.email)
      })
      .catch(error => alert(error.message))
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
            <View style={styles.inputContainer}>
                <TextInput placeholder='Email' value={email} onChangeText={text => setEmail(text)} style={styles.input}/>
                <TextInput placeholder='Password' value={password} onChangeText={text => setPassword(text)} style={styles.input} secureTextEntry/>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleLogin} style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleSignUp} style={[styles.button, styles.buttonOutline]}>
                    <Text style={styles.buttonOutlineText}>Register</Text>
                </TouchableOpacity> 
            </View>
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