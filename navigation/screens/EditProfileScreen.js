import React from 'react'
import { useNavigation } from '@react-navigation/core'
import { View, StyleSheet, Text, ImageBackground, TextInput, Alert } from 'react-native'
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword, updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../../firebase'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { TouchableOpacity } from 'react-native-gesture-handler'
import * as Database from 'firebase/database'
import * as ImagePicker from 'expo-image-picker'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FormButton from '../../components/FormButton'
import AppLoader from '../../components/AppLoader'
import AsyncStorage from "@react-native-async-storage/async-storage"

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
    var [email, setEmail] = React.useState(null)
    var [password, setPassword] = React.useState(null)
    var [currentpassword, setCurrentPassword] = React.useState(null)
    var [username, setUsername] = React.useState(null)
    var [aboutme, setAboutMe] = React.useState(null)

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
          
            const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
            setHasGalleryPermission(galleryStatus.status === 'granted')
            await getAboutme()
        })()
    },[])

    const pickImage = async () => {
      if (hasGalleryPermission === false) {
        Alert.alert('Error!', 'Please give storage permissions to the application.')
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
            Alert.alert('Error!', error.message)
            return null
      }
    }

    const getAboutme = async () => {
        Database.get(Database.child(Database.ref(database), `users/${auth.currentUser.uid}/`)).then((snapshot) => {
        const json = snapshot.child('useraboutme').toJSON()
        setAboutMe(json)
        }).catch((error) => {
          Alert.alert('Error!', error.message)
        }) 
    }

    const editProfile = async () => {
      setLoading(true)
      var didChangeEmail = ''
      var didChangePassword = ''
      await editUsername()
      await editProfilePicture()
      await editAboutMe()
      didChangeEmail = await editEmail()
      didChangePassword = await editPassword()

      switch (true) {
        // Changed both Email and Password successfully
        case (didChangeEmail == 'Success' && didChangePassword == 'Success'):
          setLoading(false)
          Alert.alert('Account Changed', 'Both your Email and Password were changed. Please verify your new Email and re-login using your new Email and Password into the app.')
          auth.signOut().then(() => {
            navigation.navigate('Login')
          })
          break
        // Changed Email successfully
        case (didChangeEmail == 'Success' && didChangePassword == 'Failed'):
          setLoading(false)
          Alert.alert('Account Changed', 'Your Email was changed. Please verify your new Email and re-login using your new Email into the app.')
          auth.signOut().then(() => {
            navigation.navigate('Login')
          })
          break
        // Changed Password successfully
        case (didChangeEmail == 'Failed' && didChangePassword == 'Success'):
          setLoading(false)
          Alert.alert('Account Changed', 'Your Password was changed. Please re-login into the app using your new Password.')
          auth.signOut().then(() => {
            navigation.navigate('Login')
          })
          break
        // Error changing Email
        case (didChangeEmail != 'Success' && didChangeEmail != 'Failed' && didChangePassword == 'Failed'):
          setLoading(false)
          Alert.alert('Error!', didChangeEmail)
          break
        // Error changing Password
        case (didChangeEmail == 'Failed' && didChangePassword != 'Success' && didChangePassword != 'Failed'):
          setLoading(false)
          Alert.alert('Error!', didChangePassword)
          break
        // Error changing Email but Password was changed
        case (didChangeEmail != 'Success' && didChangeEmail != 'Failed' && didChangePassword == 'Success'):
          setLoading(false)
          Alert.alert('Account Changed (ERROR!)', 'Your Password was changed. But there was an error changing your Email. Please re-login into the app using your new Password. (ERROR: ' + didChangeEmail + ')')
          auth.signOut().then(() => {
            navigation.navigate('Login')
          })
          break
        // Error changing Password but Email was changed
        case (didChangeEmail == 'Success' && didChangePassword != 'Success' && didChangePassword != 'Failed'):
          setLoading(false)
          Alert.alert('Account Changed (ERROR!)', 'Your Email was changed. But there was an error changing your Password. Please verify your new Email and re-login into the app. (ERROR: ' + didChangePassword + ')')
          auth.signOut().then(() => {
            navigation.navigate('Login')
          })
          break
        // Error changing Email and Error changing Password
        case (didChangeEmail != 'Success' && didChangeEmail != 'Failed' && didChangePassword != 'Success' && didChangePassword != 'Failed'):
          setLoading(false)
          Alert.alert('Error!', 'There was an error changing both your Email and Password. (EMAIL ERROR: ' + didChangeEmail + ')' + ' (PASSWORD ERROR: ' + didChangePassword + ')')
          break
        // Didn't change anything
        case (didChangeEmail == 'Failed' && didChangePassword == 'Failed'):
          setLoading(false)
          Alert.alert('Profile Updated!', 'Your Profile was updated successfully!')
          break
      }
    }

    const updateProfileInfo = async (path, info) => {
      const data = info
      const updates = {}
      updates['/users/' + auth.currentUser.uid + `/${path}/`] = data
      Database.update(Database.ref(database), updates)
    }

    const editUsername = async () => {
      if (username != auth.currentUser.displayName && username != null) {
        await updateProfile(auth.currentUser, {displayName: username}).catch(error => {
          Alert.alert('Error!', error.message)
        })
        await updateProfileInfo('username', username).catch(error => {
          Alert.alert('Error!', error.message)
        })
      }
    }

    const editProfilePicture = async () => {
      const imageUrl = await uploadImage()
      if (imageUrl != auth.currentUser.photoURL && imageUrl != null) {
        await updateProfile(auth.currentUser, {photoURL: imageUrl}).catch(error => {
          Alert.alert('Error!', error.message)
        })
        await updateProfileInfo('photoURL', imageUrl).catch(error => {
          Alert.alert('Error!', error.message)
        })
      }
    }

    const editAboutMe = async () => {
      if (aboutme != null ) {
        await updateProfileInfo('useraboutme', aboutme).catch(error => {
          Alert.alert('Error!', error.message)
        })
      }
    }

    const editEmail = async () => {
      if (email != auth.currentUser.email && email != null) {
        const credentialsforEmail = EmailAuthProvider.credential(auth.currentUser.email, currentpassword)

        await reauthenticateWithCredential(auth.currentUser, credentialsforEmail).then(() => {
          verifyBeforeUpdateEmail(auth.currentUser, email).then(() => {
            return 'Success'
          }).catch(error => {
            return error.message
          })
        }).catch(error => {
          return error.message
        })
      }
      return 'Failed'
    }

    const editPassword = async () => {
      if (password != '' && password != null) {
        const credentialsforPassword = EmailAuthProvider.credential(auth.currentUser.email, currentpassword)

        await reauthenticateWithCredential(auth.currentUser, credentialsforPassword).then(() => {
          updatePassword(auth.currentUser, password).then(() => {
            return 'Success'
          }).catch(error => {
            return error.message
          })
        }).catch(error => {
          return error.message
        })  
      }
      return 'Failed'
    }

    return (
      <View style={theme == 'light' ? styles.container : styles.containerDark}>
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
            <Text style={theme == 'light' ? styles.userText : styles.userTextDark}>
                  { auth.currentUser.displayName != null ? auth.currentUser.displayName : 'Username' }
            </Text>
          </View>
  
          <View style={styles.action}>
            <Ionicons name="person-outline" size={20} style={theme == 'light' ? styles.ionicon : styles.ioniconDark} />
            {theme == 'light' ? 
            <TextInput
              placeholder="Change Username"
              placeholderTextColor="#666"
              autoCorrect={false}
              defaultValue= { auth.currentUser.displayName != null ? auth.currentUser.displayName : username}
              onChangeText={text => setUsername(text)}
              style={styles.textInput}
            /> :
            <TextInput
              placeholder="Change Username"
              placeholderTextColor="#fff"
              autoCorrect={false}
              defaultValue= { auth.currentUser.displayName != null ? auth.currentUser.displayName : username}
              onChangeText={text => setUsername(text)}
              style={styles.textInputDark}
            />}
          </View>
          <View style={styles.action}>
            <Ionicons name="mail-outline" size={20} style={theme == 'light' ? styles.ionicon : styles.ioniconDark} />
            {theme == 'light' ?
            <TextInput
              placeholder="Change Email"
              placeholderTextColor="#666"
              defaultValue={auth.currentUser.email}
              onChangeText={text => setEmail(text)}
              autoCorrect={false}
              style={styles.textInput}
              keyboardType='email-address'
            /> :
            <TextInput
              placeholder="Change Email"
              placeholderTextColor="#fff"
              defaultValue={auth.currentUser.email}
              onChangeText={text => setEmail(text)}
              autoCorrect={false}
              style={styles.textInputDark}
              keyboardType='email-address'
            />}
          </View>
          <View style={styles.action}>
            <Ionicons name="key-outline" size={20} style={theme == 'light' ? styles.ionicon : styles.ioniconDark} />
            {theme == 'light' ?
            <TextInput
              placeholder="Current Password (Needed to change Email/Password)"
              placeholderTextColor="#666"
              defaultValue=''
              onChangeText={text => setCurrentPassword(text)}
              autoCorrect={false}
              style={styles.textInput}
              secureTextEntry
            /> :
            <TextInput
              placeholder="Current Password (Needed to change Email/Password)"
              placeholderTextColor="#fff"
              defaultValue=''
              onChangeText={text => setCurrentPassword(text)}
              autoCorrect={false}
              style={styles.textInputDark}
              secureTextEntry
            />}
          </View>
          <View style={styles.action}>
            <Ionicons name="key-outline" size={20} style={theme == 'light' ? styles.ionicon : styles.ioniconDark} />
            {theme == 'light' ?
            <TextInput
              placeholder="New Password"
              placeholderTextColor="#666"
              defaultValue=''
              onChangeText={text => setPassword(text)}
              autoCorrect={false}
              style={styles.textInput}
              secureTextEntry
            /> :
            <TextInput
              placeholder="New Password"
              placeholderTextColor="#fff"
              defaultValue=''
              onChangeText={text => setPassword(text)}
              autoCorrect={false}
              style={styles.textInputDark}
              secureTextEntry
            />}
          </View>
          <View style={styles.action}>
            <Ionicons name="ios-clipboard-outline" size={20} style={theme == 'light' ? styles.ionicon : styles.ioniconDark} />
            {theme == 'light' ?
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="About Me"
              placeholderTextColor="#666"
              defaultValue={ aboutme == 'Go to the Edit Profile Page to change this text :)' ? '' : aboutme}
              onChangeText={text => setAboutMe(text)}
              autoCorrect={true}
              style={[styles.textInput, {height: 40}]}
            /> :
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="About Me"
              placeholderTextColor="#fff"
              defaultValue={ aboutme == 'Go to the Edit Profile Page to change this text :)' ? '' : aboutme}
              onChangeText={text => setAboutMe(text)}
              autoCorrect={true}
              style={[styles.textInputDark, {height: 40}]}
            />}
          </View>
          <FormButton buttonTitle="Update" onPress={editProfile} />
      </View>
    )
  }
  
  export default EditProfileScreen
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    containerDark: {
      flex: 1,
      backgroundColor: '#000',
    },
    action: {
      flexDirection: 'row',
      marginTop: 10,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#f2f2f2',
      paddingBottom: 5,
    },
    textInput: {
      flex: 1,
      marginTop: -12,
      paddingLeft: 10,
      color: '#333',
    },
    textInputDark: {
      flex: 1,
      marginTop: -12,
      paddingLeft: 10,
      color: '#fff',
    },
    userText: {
      marginTop: 10, 
      fontSize: 18, 
      fontWeight: 'bold',
    },
    userTextDark: {
      marginTop: 10, 
      fontSize: 18, 
      fontWeight: 'bold',
      color: '#fff'
    },
    ionicon: {
      marginLeft: 5, 
      marginBottom: 10
    },
    ioniconDark: {
      marginLeft: 5, 
      marginBottom: 10,
      color: '#fff'
    }
  })