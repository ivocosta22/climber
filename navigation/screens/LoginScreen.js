import React from 'react'
import { useNavigation } from '@react-navigation/core'
import { KeyboardAvoidingView, StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native'
import { TextInput } from 'react-native-paper'
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../../firebase'
import AppLoader from '../../components/AppLoader'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Restart } from 'fiction-expo-restart'

const LoginScreen = () => {
    var [email, setEmail] = React.useState('')
    var [password, setPassword] = React.useState('')
    const [passwordVisible, setPasswordVisible] = React.useState(true)
    const [loading, setLoading] = React.useState(false)
    const [theme, setTheme] = React.useState(null)
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const navigation = useNavigation()

    emailTextInput = React.createRef()
    passwordTextInput = React.createRef()

    React.useEffect(() => {

      AsyncStorage.getItem('isDarkMode').then(value => {
        if (value == null) {
          AsyncStorage.setItem('isDarkMode', 'light')
          setTheme('light')
        } else if (value == 'light') {
          setTheme('light')
        } else if (value == 'dark') {
          setTheme('dark')
        }
      })

      const unlisten = auth.onAuthStateChanged(user => {
        if (user) {
          if (user.emailVerified) {
            navigation.navigate('AppStack')
          } else {
            Alert.alert('Email Verification', 'Please verify your email in order to login.')
          }     
        } else {
          emailTextInput.current.clear()
          passwordTextInput.current.clear()
        }
      })
      return unlisten
    }, [])

    const handleLogin = () => {
      setLoading(true)
      email = email.replace(/\s/g,'')
      signInWithEmailAndPassword(auth, email, password)
      .then(userCredentials => {
        emailTextInput.current.clear()
        passwordTextInput.current.clear()
        if (userCredentials.user.emailVerified) {
          setLoading(false)
          navigation.navigate('AppStack')
        } else {
          Alert.alert('Email Verification', 'Please verify your email in order to login.')
          setLoading(false)
        }
      }).catch((error) => {
          Alert.alert('Error!', error.message)
          setLoading(false)
      })
    }

    const resetPassword = () => {
      setLoading(true)
      email = email.replace(/\s/g,'')
      sendPasswordResetEmail(auth, email).then(() => {
        emailTextInput.current.clear()
        passwordTextInput.current.clear()
        Alert.alert('Password Reset', 'Please check your email in order to reset your password.')
        setLoading(false)
      }).catch((error) => {
        Alert.alert('Error!', error.message)
        setLoading(false)
      })
    }

    const handleTheme = () => {
      Alert.alert('Warning!', 
      'In order to change theme, the app must be restarted. Press OK to Restart.',
        [
          {
            text: "Cancel",
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: "OK",
            onPress: () => {
              AsyncStorage.getItem('isDarkMode').then(value => {
              if (value == null) {
                AsyncStorage.setItem('isDarkMode', 'light')
                setTheme('light')
                Restart()
              } else if (value == 'light') {
                AsyncStorage.setItem('isDarkMode', 'dark')
                setTheme('dark')
                Restart()
              } else if (value == 'dark') {
                AsyncStorage.setItem('isDarkMode', 'light')
                setTheme('light')
                Restart()
              }
            })}
          }
        ],
        {
          cancelable: true,
          onDismiss: () => {}
        }
      )
    }
    
    return (
        <KeyboardAvoidingView style={theme == 'light' ? styles.container : styles.containerDark} behavior="padding">
        {loading ? <AppLoader/> : null}
        <Image style={styles.tinyLogo} source={require('../../assets/icon.png')}/>
            <View style={styles.inputContainer}>
            {theme == "light" ?
            <>
              <TextInput placeholder='Email' value={email} selectionColor='#0782F9' activeUnderlineColor='#0782F9' onChangeText={text => setEmail(text)} style={styles.input} ref={emailTextInput} />
              <TextInput placeholder='Password' value={password} selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setPassword(text)} style={styles.input} ref={passwordTextInput} secureTextEntry={passwordVisible} right={<TextInput.Icon name={passwordVisible ? "eye" : "eye-off"} onPress={() => setPasswordVisible(!passwordVisible)} />}/>
            </>: 
            <>
              <TextInput placeholder='Email' theme={{colors: {text: 'white'}}} value={email} placeholderTextColor='#fff' selectionColor='#0782F9' activeUnderlineColor='#0782F9' onChangeText={text => setEmail(text)} style={styles.inputDark} ref={emailTextInput} />
              <TextInput placeholder='Password' theme={{colors: {text: 'white'}}} value={password} placeholderTextColor='#fff' selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setPassword(text)} style={styles.inputDark} ref={passwordTextInput} secureTextEntry={passwordVisible} right={<TextInput.Icon name={passwordVisible ? "eye" : "eye-off"} color={'white'} onPress={() => setPasswordVisible(!passwordVisible)} />}/>
            </>}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleLogin} style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {navigation.navigate('Register')}} style={[styles.button, styles.buttonOutline]}>
                    <Text style={styles.buttonOutlineText}>Register</Text>
                </TouchableOpacity> 
                
                <TouchableOpacity onPress={resetPassword}>
                    <Text style={[styles.buttonOutlineText]}>I Forgot my Password</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.iconContainer}>
                <TouchableOpacity style={styles.ionicon} onPress={handleTheme}>
                  {theme == 'light' ? <Ionicons name="moon" size={25} color="black"/> : <Ionicons name="sunny" size={25} color="white"/>}
                </TouchableOpacity> 

                <TouchableOpacity style={styles.ionicon}>
                  {theme == 'light' ? <Ionicons name="language" size={25} color="black"/> : <Ionicons name="language" size={25} color="white"/>}
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
      backgroundColor: '#EEEEEE',
    },
    containerDark: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000',
    },
    inputContainer: {
      width: '80%'
    },
    input: {
      backgroundColor: 'white',
      paddingHorizontal: 15,
      borderRadius: 10,
      marginTop: 5,
    },
    inputDark: {
      backgroundColor: 'black',
      paddingHorizontal: 15,
      borderRadius: 10,
      marginTop: 5,
    },
    buttonContainer: {
      width: '60%',
      justifyContent: 'center',
      marginTop: 40,
    },
    iconContainer: {
      flexDirection: 'row',
      marginHorizontal: 30,
      paddingTop: 30
    },
    ionicon: {
      marginLeft: 15,
      marginRight: 15
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
      alignSelf: 'center'
    },
    tinyLogo: {
      height: 200,
      width: 200,
      marginBottom: 60,
      alignItems: 'center',
    }
})