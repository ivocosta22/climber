import React from 'react'
import { useNavigation } from '@react-navigation/core'
import { KeyboardAvoidingView, Text, View, TouchableOpacity, ImageBackground, Alert } from 'react-native'
import { TextInput } from 'react-native-paper'
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../../firebase'
import { en, pt } from './../../localizations'
import { globalStyles } from './../../styles/global'
import * as Database from 'firebase/database'
import * as Storage from 'firebase/storage'
import * as ImagePicker from 'expo-image-picker'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AppLoader from '../../components/AppLoader'
import AsyncStorage from "@react-native-async-storage/async-storage"
import i18n from 'i18n-js'

const RegisterScreen = () => {
    let [locale, setLocale] = React.useState('en')
    i18n.fallbacks = true
    i18n.translations = {en, pt}
    i18n.locale = locale
    var [username, setRegisteredUsername] = React.useState('')
    var [email, setRegisteredEmail] = React.useState('')
    var [password, setRegisteredPassword] = React.useState('')
    var [passwordcheck, setRegisteredPasswordCheck] = React.useState('')
    const [passwordVisible, setPasswordVisible] = React.useState(true)
    const [hasGalleryPermission, setHasGalleryPermission] = React.useState(null)
    const [image, setImage] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [theme, setTheme] = React.useState(null)
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const storage = Storage.getStorage(app)
    const db = Database.getDatabase(app)
    const navigation = useNavigation()

  //This file is using React's useEffect, which means that everything inside this function will be ran as soon as this file loads.
  //Inside this useEffect I will get the current setting in AsyncStorage for the value of isDarkMode (Which defines if the user is in Dark Mode or not).
  //AsyncStorage will also get the currentLanguage value to check what language the user has saved (Refer to ./navigation/screens/LoginScreen.js for more info).
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
  },[])

  //The handleSignUp function will sign the user up to the Database(*)
  //First, it will load up the AppLoader (./components/AppLoader.js)
  //Then, it will remove any unnecessary spaces from the username and email. As stated in the LoginScreen (Line 109), it might create errors.
  //Afterwards, an if statement will run checking the password and the repeat password inputs, in case the user didn't match them. It will throw an error if they didn't.
  //Then, it will get all the current user's usernames from the Database, and check if the username the user provided already exists, if so, it throws an error, if not
  //It proceeds to create the user with email and password using the Database method, it uploads the image the user provided(if they provided any) and creates an object
  //of default info to the database so that it can be handled in the future
  //This default object that is being created is composed by a username, profile image, a default bio text, an empty array/object of liked posts to be handled later,
  //and another 2 objects of list of followers/following, with the own user inside. This will not be taken into account when checking the number of followers.
  //As it stands, the user will always be following 0 users and will have 0 followers.
  //After all that is done, the code will send a verification email to the provided email and alert the user to verify it in order to login.
  //Finally, the user is navigated to the login page.
  //If for any reason any Database connections throw an error, it will be handled as an alert.
  //(*)More info about the database in ./firebase.js
  const handleSignUp = async () => {
    setLoading(true)
    email = email.replace(/\s/g,'')
    username = username.replace(/\s/g,'')
    let doesUserNameExist = false

    if (password != passwordcheck) {
      setLoading(false)
      Alert.alert(i18n.t('error'), i18n.t('passwordsMatchError'))
    } else {
      let usernamesSnapshot = await Database.get(Database.ref(db)).catch((error) => {
        Alert.alert(i18n.t('error'), error.message)
      })
      usernamesSnapshot.forEach(childsnapshot => {
        childsnapshot.forEach(value => {
          if (username == value.child('username').val()) {
            doesUserNameExist = true
          }
        })
      })
      if (doesUserNameExist) {
        setLoading(false)
        Alert.alert(i18n.t('error'), i18n.t('usernameErrorAlreadyExists'))
      } else {
        createUserWithEmailAndPassword(auth, email, password)
        .then(async userCredentials => {
          const userid = userCredentials.user.uid
          const imageUrl = await uploadImage(userid)
          updateProfile(userCredentials.user, {displayName: username, photoURL: imageUrl} ).catch((error => {
            setLoading(false)
            Alert.alert(i18n.t('error'), error.message)
          }))
          saveProfileInfo({
              followers:{
                [userid]: {
                  username: username,
                  photoURL: imageUrl
                },
              },
              following: {
                [userid]: {
                  username: username,
                  photoURL: imageUrl
                },
              },
              likedPosts:['0'],
              photoURL: imageUrl,
              useraboutme: 'Go to the Edit Profile Page to change this text :)',
              username: username
          }, userid)
          sendEmailVerification(userCredentials.user).then(() => {
            setLoading(false)
            navigation.navigate('Login')
          }).catch((error => {
            setLoading(false)
            Alert.alert(i18n.t('error'), error.message) 
          }))
          
        }).catch(error => { 
          setLoading(false)
          Alert.alert(i18n.t('error'), error.message)
        })
      }    
    } 
  }

  //The saveProfileInfo function is run when the user is registering, saving default info into it so that it can be handled by Database methods later.
  //it gets 2 arguments, 'info' and 'user'.
  //Then, it sends an update request with the corresponding data. If there's an error, it gets thrown through an alert.
  const saveProfileInfo = async (info, user) => {
    const data = info
    const updates = {}
    updates['/users/' + user + '/'] = data
    Database.update(Database.ref(db), updates).catch((error) => {
      setLoading(false)
      Alert.alert(i18n.t('error'), error.message)
    })
  }

    //The pickImage function will check if the user has granted permissions for the App to access the library.
    //If so, then it will open the library using the Operating System and allow the user to pick an image.
    //After the user picks an image, I use the setImage(React useState) to set my image for later use in the App.
    const pickImage = async () => {
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
      setHasGalleryPermission(galleryStatus.status === 'granted')

      if (hasGalleryPermission === false) {
        setLoading(false)
        Alert.alert(i18n.t('error'), i18n.t('permissionsErrorStorage'))
      }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        })
        if (!result.cancelled) {
            setImage(result.uri)
        }
    }

    //The uploadImage function will check if the user is publishing a post with an image, if so, then it will upload the image to the Database(*)
    //It will first get the image locally buy getting it's path and the proper extension. It will give it a name and then it will add a date/time to it's name.
    //Afterwards, It will upload the image as a blob to the path provided inside the storage of firebase(*), containing a path with the userid inside the folder 'pictures'.
    //After the task is done, the code will get the URL of the image that was just uploaded and return it from the function to be used later. 
    //If for some reason there's an error, the function will return null.
    //(*)For more info about my database refer to ./firebase.js
    const uploadImage = async (user) => {
      if (image == null) {
          return null
      }
      let filename = image.substring(image.lastIndexOf('/') + 1)
      const extension = filename.split('.').pop()
      const name = filename.split('.').slice(0,-1).join('.')
      filename = name + Date.now() + '.' + extension
  
      const storageRef = Storage.ref(storage, `pictures/${user}/profilepic/${filename}`)
      const response = await fetch(image)
      const blob = await response.blob()
  
      const task = Storage.uploadBytesResumable(storageRef, blob)
  
      try {
            await task
            const url = await Storage.getDownloadURL(storageRef)
            return url
      } catch(error) {
            Alert.alert(i18n.t('error'), error.message)
            return null
      }
    }

    //This UI is being handled by the DarkTheme (Refer to ./navigation/screens/LoginScreen.js for more info)
    //This UI's styles are located in a global styles file (./styles/global.js)
    return (
        <KeyboardAvoidingView style={theme == 'light' ? [globalStyles.container, {backgroundColor: '#EEE'}] : [globalStyles.container, {backgroundColor: '#000'}]} behavior="padding">
        {loading ? <AppLoader/> : null}
        <TouchableOpacity onPress={pickImage}>
              <View>
                {image != null ? (
                  <ImageBackground source={{ uri: image}}
                  style={[globalStyles.tinyLogo, {marginBottom: 60}]}
                  imageStyle={{borderRadius: 15}}>
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Ionicons
                      name="camera"
                      size={60}
                      color="#fff"
                      style={{
                        opacity: 0.7,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#fff',
                        borderRadius: 10,
                      }}
                    />
                  </View>
                </ImageBackground>
                ) : <ImageBackground source={require('../../assets/users/question-mark.png')}
                  style={[globalStyles.tinyLogo, {marginBottom: 60}]}
                  imageStyle={{borderRadius: 15}}>
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Ionicons
                      name="camera"
                      size={60}
                      color="#fff"
                      style={{
                        opacity: 0.7,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#fff',
                        borderRadius: 10,
                      }}
                    />
                  </View>
                </ImageBackground>}
              </View>
            </TouchableOpacity>
            <View style={globalStyles.inputContainer}>
            {theme == 'light' ?
            <>
                <TextInput placeholder={i18n.t('username')} value={username} selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setRegisteredUsername(text)} style={[globalStyles.input, {backgroundColor: 'white'}]}/>
                <TextInput placeholder={i18n.t('email')} value={email} selectionColor='#0782F9' activeUnderlineColor='#0782F9' onChangeText={text => setRegisteredEmail(text)} style={[globalStyles.input, {backgroundColor: 'white'}]}/>
                <TextInput placeholder={i18n.t('password')} value={password} selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setRegisteredPassword(text)} style={[globalStyles.input, {backgroundColor: 'white'}]} secureTextEntry={passwordVisible} right={<TextInput.Icon name={passwordVisible ? "eye" : "eye-off"} onPress={() => setPasswordVisible(!passwordVisible)} />}/>
                <TextInput placeholder={i18n.t('repeatpassword')} value={passwordcheck} selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setRegisteredPasswordCheck(text)} style={[globalStyles.input, {backgroundColor: 'white'}]} secureTextEntry={passwordVisible} right={<TextInput.Icon name={passwordVisible ? "eye" : "eye-off"} onPress={() => setPasswordVisible(!passwordVisible)} />}/>
            </> :
            <>
                <TextInput placeholder={i18n.t('username')} theme={{colors: {text: 'white'}}} placeholderTextColor='#fff' value={username} selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setRegisteredUsername(text)} style={[globalStyles.input, {backgroundColor: 'black'}]}/>
                <TextInput placeholder={i18n.t('email')} theme={{colors: {text: 'white'}}} placeholderTextColor='#fff' value={email} selectionColor='#0782F9' activeUnderlineColor='#0782F9' onChangeText={text => setRegisteredEmail(text)} style={[globalStyles.input, {backgroundColor: 'black'}]}/>
                <TextInput placeholder={i18n.t('password')} theme={{colors: {text: 'white'}}} placeholderTextColor='#fff' value={password} selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setRegisteredPassword(text)} style={[globalStyles.input, {backgroundColor: 'black'}]} secureTextEntry={passwordVisible} right={<TextInput.Icon name={passwordVisible ? "eye" : "eye-off"} color={'white'}  onPress={() => setPasswordVisible(!passwordVisible)} />}/>
                <TextInput placeholder={i18n.t('repeatpassword')} theme={{colors: {text: 'white'}}} placeholderTextColor='#fff' value={passwordcheck} selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setRegisteredPasswordCheck(text)} style={[globalStyles.input, {backgroundColor: 'black'}]} secureTextEntry={passwordVisible} right={<TextInput.Icon name={passwordVisible ? "eye" : "eye-off"} color={'white'}  onPress={() => setPasswordVisible(!passwordVisible)} />}/>
            </>}
            </View>
            <View style={globalStyles.buttonContainer}>
                <TouchableOpacity onPress={handleSignUp} style={globalStyles.button}>
                    <Text style={globalStyles.buttonText}>{i18n.t('register')}</Text>
                </TouchableOpacity> 
                <TouchableOpacity onPress={() => {navigation.navigate('Login')}} style={[globalStyles.button, globalStyles.buttonOutline]}>
                    <Text style={globalStyles.buttonOutlineText}>{i18n.t('login')}</Text>
                </TouchableOpacity> 
            </View>
        </KeyboardAvoidingView>
    )
}

export default RegisterScreen