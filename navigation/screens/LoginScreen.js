import React from 'react'
import { useNavigation } from '@react-navigation/core'
import { KeyboardAvoidingView, StyleSheet, Text, View, TouchableOpacity, Image, Alert } from 'react-native'
import { TextInput } from 'react-native-paper'
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../../firebase'
import AppLoader from '../../components/AppLoader'

const LoginScreen = () => {
    var [email, setEmail] = React.useState('')
    var [password, setPassword] = React.useState('')
    const [passwordVisible, setPasswordVisible] = React.useState(true)
    const [loading, setLoading] = React.useState(false)
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const navigation = useNavigation()

    emailTextInput = React.createRef()
    passwordTextInput = React.createRef()

    React.useEffect(() => {
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

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
        {loading ? <AppLoader/> : null}
        <Image style={styles.tinyLogo} source={require('../../assets/icon.png')}/>
            <View style={styles.inputContainer}>
                <TextInput placeholder='Email' value={email} selectionColor='#0782F9' activeUnderlineColor='#0782F9' onChangeText={text => setEmail(text)} style={styles.input} ref={emailTextInput} />
                <TextInput placeholder='Password' value={password} selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setPassword(text)} style={styles.input} ref={passwordTextInput} secureTextEntry={passwordVisible} right={<TextInput.Icon name={passwordVisible ? "eye" : "eye-off"} onPress={() => setPasswordVisible(!passwordVisible)} />}/>
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
    inputContainer: {
      width: '80%'
    },
    input: {
      backgroundColor: 'white',
      paddingHorizontal: 15,
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
      alignSelf: 'center'
    },
    tinyLogo: {
      height: 200,
      width: 200,
      marginBottom: 60,
      alignItems: 'center',
    }
})