import React from 'react'
import { useNavigation } from '@react-navigation/core'
import { KeyboardAvoidingView, StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native'
import { TextInput } from 'react-native-paper'
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../../firebase'
import { Restart } from 'fiction-expo-restart'
import { en, pt } from './../../localizations'
import AppLoader from '../../components/AppLoader'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AsyncStorage from "@react-native-async-storage/async-storage"
import i18n from 'i18n-js'

const LoginScreen = () => {
    let [locale, setLocale] = React.useState('en')
    i18n.fallbacks = true
    i18n.translations = {en, pt}
    i18n.locale = locale
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

      AsyncStorage.getItem('currentLanguage').then(value => {
        if (value == null) {
          AsyncStorage.setItem('currentLanguage', 'en')
          setLocale('en')
        } else if (value == 'en') {
          setLocale('en')
        } else if (value == 'pt') {
          setLocale('pt')
        }
      })

      const unlisten = auth.onAuthStateChanged(user => {
        if (user) {
          if (user.emailVerified) {
            navigation.navigate('AppStack')
          } else {
            Alert.alert(i18n.t('emailVerification'), i18n.t('emailVerificationMessage'))
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
          Alert.alert(i18n.t('emailVerification'), i18n.t('emailVerificationMessage'))
          setLoading(false)
        }
      }).catch((error) => {
          Alert.alert(i18n.t('error'), error.message)
          setLoading(false)
      })
    }

    const resetPassword = () => {
      setLoading(true)
      email = email.replace(/\s/g,'')
      sendPasswordResetEmail(auth, email).then(() => {
        emailTextInput.current.clear()
        passwordTextInput.current.clear()
        Alert.alert(i18n.t('passwordReset'), i18n.t('passwordResetMessage'))
        setLoading(false)
      }).catch((error) => {
        Alert.alert(i18n.t('error'), error.message)
        setLoading(false)
      })
    }

    const handleTheme = () => {
      Alert.alert(i18n.t('warning'), 
      i18n.t('themeMessage'),
        [
          {
            text: i18n.t('cancel'),
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: i18n.t('ok'),
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

    const handleLanguage = () => {
      AsyncStorage.getItem('currentLanguage').then(value => {
        if (value == null) {
          AsyncStorage.setItem('currentLanguage', 'en')
          setLocale('en')
        } else if (value == 'en') {
          AsyncStorage.setItem('currentLanguage', 'pt')
          setLocale('pt')
        } else if (value == 'pt') {
          AsyncStorage.setItem('currentLanguage', 'en')
          setLocale('en')
        }
    })}
    
    return (
        <KeyboardAvoidingView style={theme == 'light' ? styles.container : styles.containerDark} behavior="padding">
        {loading ? <AppLoader/> : null}
        <Image style={styles.tinyLogo} source={require('../../assets/icon.png')}/>
            <View style={styles.inputContainer}>
            {theme == "light" ?
            <>
              <TextInput placeholder={i18n.t('email')} value={email} selectionColor='#0782F9' activeUnderlineColor='#0782F9' onChangeText={text => setEmail(text)} style={styles.input} ref={emailTextInput} />
              <TextInput placeholder={i18n.t('password')} value={password} selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setPassword(text)} style={styles.input} ref={passwordTextInput} secureTextEntry={passwordVisible} right={<TextInput.Icon name={passwordVisible ? "eye" : "eye-off"} onPress={() => setPasswordVisible(!passwordVisible)} />}/>
            </>: 
            <>
              <TextInput placeholder={i18n.t('email')} theme={{colors: {text: 'white'}}} value={email} placeholderTextColor='#fff' selectionColor='#0782F9' activeUnderlineColor='#0782F9' onChangeText={text => setEmail(text)} style={styles.inputDark} ref={emailTextInput} />
              <TextInput placeholder={i18n.t('password')} theme={{colors: {text: 'white'}}} value={password} placeholderTextColor='#fff' selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setPassword(text)} style={styles.inputDark} ref={passwordTextInput} secureTextEntry={passwordVisible} right={<TextInput.Icon name={passwordVisible ? "eye" : "eye-off"} color={'white'} onPress={() => setPasswordVisible(!passwordVisible)} />}/>
            </>}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleLogin} style={styles.button}>
                    <Text style={styles.buttonText}>{i18n.t('login')}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {navigation.navigate('Register')}} style={[styles.button, styles.buttonOutline]}>
                    <Text style={styles.buttonOutlineText}>{i18n.t('register')}</Text>
                </TouchableOpacity> 
                
                <TouchableOpacity onPress={resetPassword}>
                    <Text style={[styles.buttonOutlineText]}>{i18n.t('forgotpassword')}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.iconContainer}>
                <TouchableOpacity style={styles.ionicon} onPress={handleTheme}>
                  {theme == 'light' ? <Ionicons name="moon" size={25} color="black"/> : <Ionicons name="sunny" size={25} color="white"/>}
                </TouchableOpacity> 

                <TouchableOpacity style={styles.ionicon} onPress={handleLanguage}>
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