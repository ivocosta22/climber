import React from 'react'
import { useNavigation } from '@react-navigation/core'
import { KeyboardAvoidingView, Text, View, TouchableOpacity, Image, Alert } from 'react-native'
import { TextInput } from 'react-native-paper'
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../../firebase'
import { Restart } from 'fiction-expo-restart'
import { en, pt } from './../../localizations'
import { globalStyles } from './../../styles/global'
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



    //This file is using React's useEffect, which means that everything inside this function will be ran as soon as this file loads.
    //Inside this useEffect I will get the current setting in AsyncStorage for the value of isDarkMode (Which defines if the user is in Dark Mode or not).
    //AsyncStorage will also get the currentLanguage value to check what language the user has saved.

    //AsyncStorage:
    //AsyncStorage is a library that will save a setting to the user's device. There's 2 settings I'm saving here, isDarkMode and currentLanguage.
    //These variables are always using React's UseState Hook, and are set inside this screen, when the user clicks the Ionicons in the bottom (Lines 250 and 254)
    //For this reason there is an unsolved bug in the app currently which is related to the OnboardingScreen. Since this screen is rendered and shown before the LoginScreen,
    //the user will always see the text shown there in English. I've checked the library's documentation, and they do not provide a method for me to set a custom button anywhere.
    //If it would be possible, I would've added a button there that would change the language temporarily without using AsyncStorage.
    //The only alternative here is to have a screen before the OnboardingScreen that asks the user the language and T
    //heme that they want to use, which is something that I'll implement in the future.
    //More info about the Onboarding Swipper library here https://github.com/jfilter/react-native-onboarding-swiper#readme

    //DarkTheme:
    //Currently, I'm setting the UI myself to set a dark mode on 90% of the App. I use AsyncStorage in every screen that I need to check what theme the
    //user is on, and changing the UI colors accordingly. However, in ./App.js, I'm using a 3rd party library to set OS elements to dark mode. Refer to that file for more info.
    //The logic is simple. If the user is inDarkmode (theme != light) then any background that are white turn black, and text that is black turns white.

    //App Translation:
    //I'm currently using the 3rd party library called 'i18n' to set languages in the app. All my translations/strings are located in ./localizations.js
    //In every screen that I need translations on, I will use a useState variable called 'locale' which gets it's default value from AsyncStorage and return either 'pt' or 'en'
    //Depending on that result, the i18n then gets that value and uses it to turn every text to the corresponding value of the JSON objects located in ./localizations.js
    //I recommend checking that file for better understanding.
    //Every time an error is thrown for example, in the code it's written "i18n.t('error')". Every Alert/Informational String follows this format also.
    //This means the i18n library is translating that string that will be located in ./localizations.js.
    //Unfortunately, I'm only translating the App to English and Portuguese, for the purpose that this whole project is aimed at my graduation's final project. Due to my lack of time,
    //I decided to only translate to these 2 languages. More could be added in the future.

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

      //The useEffect hook will check if a user was already logged in the last time the app was oppened. If so,
      //It will skip the login process entirely and enter the app.
      //In case the user's email is not verified yet, it will throw an error.
      //If the user however was recently logged out or never logged in, then the contents of the textinputs will clear.
      //This prevents a new user to see the credentials of a recently logged out user.
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

    //The handleLogin function will be run when the user presses the login button.
    //It will load the AppLoader (./components/AppLoader.js) and will take unnecessary spaces off the email variable
    //I did this as for Android at least, when the user autofills an email, the keyboard adds a space after it, creating an error if this wouldn't be handled.
    //Afterwards, my Database(*) will sign the user in using the email and password provided, it will check if they match, and if so, it will log the user in,
    //Navigating to the App's Home Page. The TextInputs are cleared for the same purposes as said above(Prevent another user to login using the past user's credentials).
    //If the user hasn't verified their email, the App throws an Error, telling the user to verify the email.\
    //If for some reason some connection error is thrown, it will be shown as an alert.
    //After everything inside this function is done, the AppLoader dissapears.
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

    //The resetPassword function runs whenever the user clicks the 'I forgot my Password' Text.
    //It will load the AppLoader (./components/AppLoader.js) and will take unnecessary spaces off the email variable
    //I did this as for Android at least, when the user autofills an email, the keyboard adds a space after it, creating an error if this wouldn't be handled.
    //Afterwards, my Database(*) will send a password reset email to the provided email in the TextView, and will clear the inputs, following that up with an alert,
    //telling the user to check the email for a password reset.
    //If for some reason some connection error is thrown, it will be shown as an alert.
    //After everything inside this function is done, the AppLoader dissapears.
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

    //The handleTheme function is run whenever the user clicks the Sunny/Moon Ionicon
    //It will show the user an alert, saying that the app needs to be restarted in order for the DarkMode change to be applied.
    //This is necessary because if a restart does not happen, then whatever change was made in ./App.js for the darktheme won't update,
    //and the app will have a mix of both themes, breaking the UI. This is better explained in the ./App.js file.
    //Restarting the app solves the problem.
    //When pressing ok to restart, AsyncStorage gets in, saving the current setting to the user's device storage.
    //If for some reason the user decides not to change Theme and presses cancel, nothing happens and the alert disappears.
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

    //The handleLanguage function is run whenever the user presses the Language Ionicon
    //It will call AsyncStorage to save the current setting for the language, changing it between 'en' and 'pt'.
    //This will apply for the whole app.
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
    
    //This UI is being handled by the DarkTheme (Refer to line 49 for more info)
    //This UI's styles are located in a global styles file (./styles/global.js)
    return (
        <KeyboardAvoidingView style={theme == 'light' ? [globalStyles.container, {backgroundColor: '#EEE'}] : [globalStyles.container, {backgroundColor: '#000'}]} behavior="padding">
        {loading ? <AppLoader/> : null}
        <Image style={[globalStyles.tinyLogo, {marginBottom: 60,}]} source={require('../../assets/icon.png')}/>
            <View style={globalStyles.inputContainer}>
            {theme == "light" ?
            <>
              <TextInput placeholder={i18n.t('email')} value={email} keyboardType='email-address' selectionColor='#0782F9' activeUnderlineColor='#0782F9' onChangeText={text => setEmail(text)} style={[globalStyles.input, {backgroundColor: 'white'}]} ref={emailTextInput} />
              <TextInput placeholder={i18n.t('password')} value={password} selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setPassword(text)} style={[globalStyles.input, {backgroundColor: 'white'}]} ref={passwordTextInput} secureTextEntry={passwordVisible} right={<TextInput.Icon name={passwordVisible ? "eye" : "eye-off"} onPress={() => setPasswordVisible(!passwordVisible)} />}/>
            </>: 
            <>
              <TextInput placeholder={i18n.t('email')} theme={{colors: {text: 'white'}}} value={email} keyboardType='email-address' placeholderTextColor='#fff' selectionColor='#0782F9' activeUnderlineColor='#0782F9' onChangeText={text => setEmail(text)} style={[globalStyles.input, {backgroundColor: 'black'}]} ref={emailTextInput} />
              <TextInput placeholder={i18n.t('password')} theme={{colors: {text: 'white'}}} value={password} placeholderTextColor='#fff' selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setPassword(text)} style={[globalStyles.input, {backgroundColor: 'black'}]} ref={passwordTextInput} secureTextEntry={passwordVisible} right={<TextInput.Icon name={passwordVisible ? "eye" : "eye-off"} color={'white'} onPress={() => setPasswordVisible(!passwordVisible)} />}/>
            </>}
            </View>

            <View style={globalStyles.buttonContainer}>
                <TouchableOpacity onPress={handleLogin} style={globalStyles.button}>
                    <Text style={globalStyles.buttonText}>{i18n.t('login')}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {navigation.navigate('Register')}} style={[globalStyles.button, globalStyles.buttonOutline]}>
                    <Text style={globalStyles.buttonOutlineText}>{i18n.t('register')}</Text>
                </TouchableOpacity> 
                
                <TouchableOpacity onPress={resetPassword}>
                    <Text style={globalStyles.buttonOutlineText}>{i18n.t('forgotpassword')}</Text>
                </TouchableOpacity>
            </View>

            <View style={globalStyles.iconContainer}>
                <TouchableOpacity style={globalStyles.ionicon} onPress={handleTheme}>
                  {theme == 'light' ? <Ionicons name="moon" size={25} color="black"/> : <Ionicons name="sunny" size={25} color="white"/>}
                </TouchableOpacity> 

                <TouchableOpacity style={globalStyles.ionicon} onPress={handleLanguage}>
                  {theme == 'light' ? <Ionicons name="language" size={25} color="black"/> : <Ionicons name="language" size={25} color="white"/>}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

export default LoginScreen