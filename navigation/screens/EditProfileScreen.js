import React from 'react'
import { useNavigation } from '@react-navigation/core'
import { View, Text, ImageBackground, TextInput, Alert } from 'react-native'
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword, updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../../firebase'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { en, pt } from './../../localizations'
import { globalStyles } from './../../styles/global'
import * as Database from 'firebase/database'
import * as ImagePicker from 'expo-image-picker'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FormButton from '../../components/FormButton'
import AppLoader from '../../components/AppLoader'
import AsyncStorage from "@react-native-async-storage/async-storage"
import i18n from 'i18n-js'

  const EditProfileScreen = () => {
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const storage = getStorage(app)
    const database = Database.getDatabase(app)
    const navigation = useNavigation()
    const [image, setImage] = React.useState(null)
    const [hasGalleryPermission, setHasGalleryPermission] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [theme, setTheme] = React.useState(null)
    let [locale, setLocale] = React.useState('en')
    var [email, setEmail] = React.useState(null)
    var [password, setPassword] = React.useState(null)
    var [currentpassword, setCurrentPassword] = React.useState(null)
    var [username, setUsername] = React.useState(null)
    var [aboutme, setAboutMe] = React.useState(null)
    i18n.fallbacks = true
    i18n.translations = {en, pt}
    i18n.locale = locale

      //This file is using React's useEffect, which means that everything inside this function will be ran as soon as this file loads.
      //Inside this useEffect I will get the current setting in AsyncStorage for the value of isDarkMode (Which defines if the user is in Dark Mode or not).
      //AsyncStorage will also get the currentLanguage value to check what language the user has saved (Refer to ./navigation/screens/LoginScreen.js for more info).
      React.useEffect(() => {
        (async () => {
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
          
            const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
            setHasGalleryPermission(galleryStatus.status === 'granted')
            await getAboutme()
        })()
    },[])

    //The pickImage function will check if the user has granted permissions for the App to access the library.
    //If so, then it will open the library using the Operating System and allow the user to pick an image.
    //After the user picks an image, I use the setImage(React useState) to set my image for later use in the App.
    const pickImage = async () => {
      if (hasGalleryPermission === false) {
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
    const uploadImage = async () => {
      if (image == null) {
          return null
      }
      let filename = image.substring(image.lastIndexOf('/') + 1)
      const extension = filename.split('.').pop()
      const name = filename.split('.').slice(0,-1).join('.')
      filename = name + Date.now() + '.' + extension

      const storageRef = ref(storage, `pictures/${auth.currentUser.uid}/profilepic/${filename}`)
      const response = await fetch(image)
      const blob = await response.blob()

      const task = uploadBytesResumable(storageRef, blob)

      try {
            await task
            const url = await getDownloadURL(storageRef)
            return url
      } catch(error) {
            Alert.alert(i18n.t('error'), error.message)
            return null
      }
    }

    //The getAboutme function will connect to the Database(*) and get the current profile bio of the user and set it to the aboutme variable(used by React SetState)
    //If there's an error during the connection to the database, it will throw an alert.
    //(Handled by translations(Refer to ./navigation/screens/LoginScreen.js for more info on Translations))
    //(*)More info about the database in ./firebase.js
    const getAboutme = async () => {
        Database.get(Database.child(Database.ref(database), `users/${auth.currentUser.uid}/`)).then((snapshot) => {
        const json = snapshot.child('useraboutme').toJSON()
        setAboutMe(json)
        }).catch((error) => {
          Alert.alert(i18n.t('error'), error.message)
        }) 
    }

    //The editProfile function will set the loading state to true(Triggering the AppLoader (./components/AppLoader.js for more info))
    //This function will run when the user clicks the Update Profile button (./components/FormButton.js) in the UI (line 460)
    //It will do lots of tasks, but one at a time. I want to remind here that this is an asynchronous function, and that I'm using await in every function
    //that I'm running, so that every single update to the database(*) runs smoothly.
    //Firstly, the AppLoader will load(./components/AppLoader.js). 
    //Then, I will get the result from the editUsername function into the 'didChangeUsername' variable.
    //Afterwards, 2 more await functions will run, editProfilePicture and editAboutMe
    //Another 2 variables are going to be declared and will save the result of both editEmail and editPassword.
    //(All the functions ran here are explained in their respective places throughout the code).
    //After all the database functions are ran, a switch is ran.
    //Inside this switch, I will go through all the possible cases of a change in username, email, or password
    //It's important that this switch runs because it will check if the user made changes in the username, so that the code can check if the user already exists,
    //if it's empty, or if the email/password were changed.
    //There's 10 possible cases here, all of them are handled inside the switch and are properly commented.
    //The username is only handled in case neither the email or password are changed, so for example, if the username is left empty and the password is changed,
    //the user will be logged out and the username won't be changed.
    //Everytime the user changes either the email or password, the user will be logged out and required to relog.
    //In case the user changed their email, they will get an alert to verify their new email and relogin to the app
    //(*)More info about the database in ./firebase.js
    const editProfile = async () => {
      setLoading(true)

      var didChangeUsername = await editUsername()
      await editProfilePicture()
      await editAboutMe()
      var didChangeEmail = await editEmail()
      var didChangePassword = await editPassword()

      switch (true) {
        // Changed both Email and Password successfully
        // The user gets an alert saying they will need to verify their new email and relogin into the app using their new email/password
        case (didChangeEmail == 'Success' && didChangePassword == 'Success'):
          setLoading(false)
          Alert.alert(i18n.t('accountChanged'), i18n.t('emailAndPasswordChanged'))
          auth.signOut().then(() => {
            navigation.navigate('Login')
          })
          break
        // Changed Email successfully
        // The user gets an alert saying they will need to verify their new email and relogin into the app using their new email
        case (didChangeEmail == 'Success' && didChangePassword == 'Failed'):
          setLoading(false)
          Alert.alert(i18n.t('accountChanged'), i18n.t('emailChanged'))
          auth.signOut().then(() => {
            navigation.navigate('Login')
          })
          break
        // Changed Password successfully
        // The user gets an alert saying they will need relogin into the app using their new password
        case (didChangeEmail == 'Failed' && didChangePassword == 'Success'):
          setLoading(false)
          Alert.alert(i18n.t('accountChanged'), i18n.t('passwordChanged'))
          auth.signOut().then(() => {
            navigation.navigate('Login')
          })
          break
        // Error changing Email
        // The user gets an alert saying there was an error changing the email
        case (didChangeEmail != 'Success' && didChangeEmail != 'Failed' && didChangePassword == 'Failed'):
          setLoading(false)
          Alert.alert(i18n.t('error'), didChangeEmail)
          break
        // Error changing Password
        // The user gets an alert saying there was an error changing the password
        case (didChangeEmail == 'Failed' && didChangePassword != 'Success' && didChangePassword != 'Failed'):
          setLoading(false)
          Alert.alert(i18n.t('error'), didChangePassword)
          break
        // Error changing Email but Password was changed
        // The user gets an alert saying there was an error changing the email but the password was changed. They will need to relogin into the app using their new password.
        case (didChangeEmail != 'Success' && didChangeEmail != 'Failed' && didChangePassword == 'Success'):
          setLoading(false)
          Alert.alert(i18n.t('accountChangedError'), i18n.t('passwordChangedEmailError') + didChangeEmail)
          auth.signOut().then(() => {
            navigation.navigate('Login')
          })
          break
        // Error changing Password but Email was changed
        // The user gets an alert saying there was an error changing the password but the email was changed. They will need to relogin into the app after verifying their new email.
        case (didChangeEmail == 'Success' && didChangePassword != 'Success' && didChangePassword != 'Failed'):
          setLoading(false)
          Alert.alert(i18n.t('accountChangedError'), i18n.t('emailChangedPasswordError') + didChangePassword)
          auth.signOut().then(() => {
            navigation.navigate('Login')
          })
          break
        // Error changing Email and Error changing Password
        // The user gets an alert saying there was an error changing both the password and email
        case (didChangeEmail != 'Success' && didChangeEmail != 'Failed' && didChangePassword != 'Success' && didChangePassword != 'Failed'):
          setLoading(false)
          Alert.alert(i18n.t('error'), i18n.t('emailAndPasswordError') + i18n.t('emailError') + didChangeEmail + i18n.t('passwordError') + didChangePassword)
          break
        // Didn't change anything
        // Nothing was changed, so the username will be handled
        // If the didChangeUsername variable is 'ErrorEmptyUsername', the user will get an error, saying the Username is empty in the TextInput
        // If the didChangeUsername variable returns 'Failed', that means the username wasn't changed. The user gets an alert saying the profile was updated.
        // If the didChangeUsername variable returns 'Success', that means the username was successfully changed.
        // If the didChangeUsername variable returns 'ErrorSameUsername', the user will get an error, saying the Username already exists.
        case (didChangeEmail == 'Failed' && didChangePassword == 'Failed'):
          if (didChangeUsername != 'Failed') {
            if (didChangeUsername == 'ErrorEmptyUsername') {
              setLoading(false)
              Alert.alert(i18n.t('error'), i18n.t('usernameErrorEmpty'))
              break
            } else if (didChangeUsername == 'ErrorSameUsername') {
              setLoading(false)
              Alert.alert(i18n.t('error'), i18n.t('usernameErrorAlreadyExists'))
              break
            } else if (didChangeUsername != 'Error' && didChangeUsername != 'Success') {
              setLoading(false)
              Alert.alert(i18n.t('error'), didChangeUsername)
              break
            } else if (didChangeUsername == 'Success') {
              setLoading(false)
              Alert.alert(i18n.t('profileUpdated'), i18n.t('profileUpdatedMessage'))
              break
            }
          } else {
            setLoading(false)
            Alert.alert(i18n.t('profileUpdated'), i18n.t('profileUpdatedMessage'))
            break
          }
      }
    }

    //The updateProfileInfo function will run everytime any update to the Database(*) is handled.
    //It takes path and info as arguments where path will be used to check what is going to be updated and info
    //which is the data that will be sent as the update.
    //(*)More info about the database in ./firebase.js
    const updateProfileInfo = async (path, info) => {
      const data = info
      const updates = {}
      updates['/users/' + auth.currentUser.uid + `/${path}/`] = data
      Database.update(Database.ref(database), updates)
    }

    //The editUsername function will run whenever the username is about to be checked for a Database(*) change.
    //First, the username variable(that is being fetched from the TextInput) will be checked for the null value or if it's the same as
    //the one the user has currently. If it isn't then it will check if it's empty, as there's a chance the user might type something and then leaving it empty.
    //If this returns false too, then the database will update the username by first checking if the username already exists, returning an Error if it does,
    //if not, it will be updating it in the Firebase user parameters, and then in the Database I created(*)
    //Afterwards, the function will return
    //(*)More info about the database in ./firebase.js
    const editUsername = async () => {
      if (username != auth.currentUser.displayName && username != null) {
        if (username == '') {
          return 'ErrorEmptyUsername'
        } else {
          let doesUserNameExist = false
          let usernamesSnapshot = await Database.get(Database.ref(database)).catch((error) => {
            return error.message
          })
          usernamesSnapshot.forEach(childsnapshot => {
            childsnapshot.forEach(value => {
              if (username == value.child('username').val()) {
                doesUserNameExist = true
              }
            })
          })
          if (doesUserNameExist) {
            return 'ErrorSameUsername'
          }
          await updateProfile(auth.currentUser, {displayName: username}).catch((error) => {
            return error.message
          })
          await updateProfileInfo('username', username).catch((error) => {
            return error.message
          })
          return 'Success'
        }
      }
      return 'Failed'
    }

    //The editProfilePicture function will run whenever the profile picture is about to be checked for a Database(*) change.
    //First, the image variable(that is being fetched from the TextInput) will be checked for the null value inside the uploadImage function. Refer to that function for more info.
    //It will afterwards check if the imageURL is different. as the one the user has now and if it's different than null. If this is true, it will update it inside the firebase
    //user parameters and the Database(*)
    //(*)More info about the database in ./firebase.js
    const editProfilePicture = async () => {
      const imageUrl = await uploadImage()
      if (imageUrl != auth.currentUser.photoURL && imageUrl != null) {
        await updateProfile(auth.currentUser, {photoURL: imageUrl}).catch(error => {
          Alert.alert(i18n.t('error'), error.message)
        })
        await updateProfileInfo('photoURL', imageUrl).catch(error => {
          Alert.alert(i18n.t('error'), error.message)
        })
      }
    }

    //The editAboutMe function will run whenever the user's bio is about to be checked for a Database(*) change.
    //If it's different than null(indicating a change), then it will update the new profile bio in the Database.
    //(*)More info about the database in ./firebase.js
    const editAboutMe = async () => {
      if (aboutme != null ) {
        await updateProfileInfo('useraboutme', aboutme).catch(error => {
          Alert.alert(i18n.t('error'), error.message)
        })
      }
    }

    //The editEmail function will run whenever the user's email is about to be checked for a Database(*) change.
    //First, the email variable(that is being fetched from the TextInput) will be checked for the null value or if it's the same as
    //the one the user has currently.
    //If this returns false, then the database will update the email by reauthing the user with their current email and the password written in the password TextInput
    //(The user must insert the password as indicated in the TextInput Placeholder).
    //If an update happens successfully, the function returns 'Success'. It will return an error if it falls into the catch while attempting to update, and it will return
    //'Failed' if the user ended up not changing the email.
    //(*)More info about the database in ./firebase.js
    const editEmail = async () => {
      if (email != auth.currentUser.email && email != null) {
        const credentialsforEmail = EmailAuthProvider.credential(auth.currentUser.email, currentpassword)
        await reauthenticateWithCredential(auth.currentUser, credentialsforEmail).catch((error) => {
          return error.message
        })
        await verifyBeforeUpdateEmail(auth.currentUser, email).catch((error) => {
          return error.message
        })
        return 'Success'
      }
      return 'Failed'
    }

    //The editPassword function will run whenever the user's password is about to be checked for a Database(*) change.
    //First, the password variable(that is being fetched from the TextInput) will be checked for the null value or if it's empty.
    //If this returns false, then the database will update the password by reauthing the user with their current email and the password written in the password TextInput
    //(The user must insert the password as indicated in the TextInput Placeholder).
    //If an update happens successfully, the function returns 'Success'. It will return an error if it falls into the catch while attempting to update, and it will return
    //'Failed' if the user ended up not changing the password.
    //(*)More info about the database in ./firebase.js
    const editPassword = async () => {
      if (password != '' && password != null) {
        const credentialsforPassword = EmailAuthProvider.credential(auth.currentUser.email, currentpassword)

        await reauthenticateWithCredential(auth.currentUser, credentialsforPassword).catch((error) => {
          return error.message
        })
        await updatePassword(auth.currentUser, password).catch((error) => {
          return error.message
        })
        return 'Success'
      }
      return 'Failed'
    }


    //This UI is being handled by the DarkTheme (Refer to ./navigation/screens/LoginScreen.js for more info)
    //When this UI is rendered, the current photoURL of the user, username and email will be fetched from the Database(*)
    //And will be updated in the UI.
    //(*)More info about the database in ./firebase.js
    return (
      <View style={theme == 'light' ? [{flex:1, backgroundColor: '#fff'}] : [{flex:1, backgroundColor: '#000'}]}>
      {loading ? <AppLoader/> : null}
          <View style={{alignItems: 'center', paddingTop: 30}}>
            <TouchableOpacity onPress={pickImage}>
              <View style={{height: 100, width: 100, borderRadius: 15, justifyContent: 'center', alignItems: 'center',
                }}>
                {image != null ? (
                  <ImageBackground source={{ uri: image}}
                  style={{height: 100, width: 100}}
                  imageStyle={{borderRadius: 15}}>
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Ionicons
                      name="camera"
                      size={35}
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
                ) : <ImageBackground source={ auth.currentUser.photoURL != null ? {uri: auth.currentUser.photoURL} : require('../../assets/users/question-mark.png')}
                  style={{height: 100, width: 100}}
                  imageStyle={{borderRadius: 15}}>
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Ionicons
                      name="camera"
                      size={35}
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
            <Text style={theme == 'light' ? globalStyles.userText : [globalStyles.userText,{color: '#fff'}]}>
                  { auth.currentUser.displayName != null ? auth.currentUser.displayName : 'Username' }
            </Text>
          </View>
  
          <View style={globalStyles.action}>
            <Ionicons name="person-outline" size={20} style={theme == 'light' ? globalStyles.ioniconEditProfile : [globalStyles.ioniconEditProfile,{color: '#fff'}]} />
            {theme == 'light' ? 
            <TextInput
              placeholder={i18n.t('changeUsername')}
              placeholderTextColor="#666"
              autoCorrect={false}
              defaultValue= { auth.currentUser.displayName != null ? auth.currentUser.displayName : username}
              onChangeText={text => setUsername(text)}
              style={[globalStyles.textInput, {color: '#333'}]}
            /> :
            <TextInput
              placeholder={i18n.t('changeUsername')}
              placeholderTextColor="#fff"
              autoCorrect={false}
              defaultValue= { auth.currentUser.displayName != null ? auth.currentUser.displayName : username}
              onChangeText={text => setUsername(text)}
              style={[globalStyles.textInput, {color: '#fff'}]}
            />}
          </View>
          <View style={globalStyles.action}>
            <Ionicons name="mail-outline" size={20} style={theme == 'light' ? globalStyles.ioniconEditProfile : [globalStyles.ioniconEditProfile,{color: '#fff'}]} />
            {theme == 'light' ?
            <TextInput
              placeholder={i18n.t('changeEmail')}
              placeholderTextColor="#666"
              defaultValue={auth.currentUser.email}
              onChangeText={text => setEmail(text)}
              autoCorrect={false}
              style={[globalStyles.textInput, {color: '#333'}]}
              keyboardType='email-address'
            /> :
            <TextInput
              placeholder={i18n.t('changeEmail')}
              placeholderTextColor="#fff"
              defaultValue={auth.currentUser.email}
              onChangeText={text => setEmail(text)}
              autoCorrect={false}
              style={[globalStyles.textInput, {color: '#fff'}]}
              keyboardType='email-address'
            />}
          </View>
          <View style={globalStyles.action}>
            <Ionicons name="key-outline" size={20} style={theme == 'light' ? globalStyles.ioniconEditProfile : [globalStyles.ioniconEditProfile,{color: '#fff'}]} />
            {theme == 'light' ?
            <TextInput
              placeholder={i18n.t('changePasswordCurrent')}
              placeholderTextColor="#666"
              defaultValue=''
              onChangeText={text => setCurrentPassword(text)}
              autoCorrect={false}
              style={[globalStyles.textInput, {color: '#333'}]}
              secureTextEntry
            /> :
            <TextInput
              placeholder={i18n.t('changePasswordCurrent')}
              placeholderTextColor="#fff"
              defaultValue=''
              onChangeText={text => setCurrentPassword(text)}
              autoCorrect={false}
              style={[globalStyles.textInput, {color: '#fff'}]}
              secureTextEntry
            />}
          </View>
          <View style={globalStyles.action}>
            <Ionicons name="key-outline" size={20} style={theme == 'light' ? globalStyles.ioniconEditProfile : [globalStyles.ioniconEditProfile,{color: '#fff'}]} />
            {theme == 'light' ?
            <TextInput
              placeholder={i18n.t('changePasswordNew')}
              placeholderTextColor="#666"
              defaultValue=''
              onChangeText={text => setPassword(text)}
              autoCorrect={false}
              style={[globalStyles.textInput, {color: '#333'}]}
              secureTextEntry
            /> :
            <TextInput
              placeholder={i18n.t('changePasswordNew')}
              placeholderTextColor="#fff"
              defaultValue=''
              onChangeText={text => setPassword(text)}
              autoCorrect={false}
              style={[globalStyles.textInput, {color: '#fff'}]}
              secureTextEntry
            />}
          </View>
          <View style={globalStyles.action}>
            <Ionicons name="ios-clipboard-outline" size={20} style={theme == 'light' ? globalStyles.ioniconEditProfile : [globalStyles.ioniconEditProfile,{color: '#fff'}]} />
            {theme == 'light' ?
            <TextInput
              multiline
              numberOfLines={3}
              placeholder={i18n.t('changeAboutme')}
              placeholderTextColor="#666"
              defaultValue={ aboutme == 'Go to the Edit Profile Page to change this text :)' ? '' : aboutme}
              onChangeText={text => setAboutMe(text)}
              autoCorrect={true}
              style={[globalStyles.textInput, {height: 40, color: '#333'}]}
            /> :
            <TextInput
              multiline
              numberOfLines={3}
              placeholder={i18n.t('changeAboutme')}
              placeholderTextColor="#fff"
              defaultValue={ aboutme == 'Go to the Edit Profile Page to change this text :)' ? '' : aboutme}
              onChangeText={text => setAboutMe(text)}
              autoCorrect={true}
              style={[globalStyles.textInput, {height: 40, color: '#fff'}]}
            />}
          </View>
          <FormButton buttonTitle={i18n.t('update')} onPress={editProfile} />
      </View>
    )
  }
  
  export default EditProfileScreen