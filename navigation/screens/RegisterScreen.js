import React from 'react'
import { useNavigation } from '@react-navigation/core'
import { KeyboardAvoidingView, StyleSheet, Text, View, TouchableOpacity, ImageBackground, Alert } from 'react-native'
import { TextInput } from 'react-native-paper'
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../../firebase'
import * as Database from 'firebase/database'
import * as Storage from 'firebase/storage'
import * as ImagePicker from 'expo-image-picker'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AppLoader from '../../components/AppLoader'

const RegisterScreen = () => {
    var [username, setRegisteredUsername] = React.useState('')
    var [email, setRegisteredEmail] = React.useState('')
    var [password, setRegisteredPassword] = React.useState('')
    var [passwordcheck, setRegisteredPasswordCheck] = React.useState('')
    const [passwordVisible, setPasswordVisible] = React.useState(true)
    const [hasGalleryPermission, setHasGalleryPermission] = React.useState(null)
    const [image, setImage] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const storage = Storage.getStorage(app)
    const db = Database.getDatabase(app)
    const navigation = useNavigation()

    React.useEffect(() => {
      (async () => {
          const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
          setHasGalleryPermission(galleryStatus.status === 'granted')
      })()
  },[])

  const handleSignUp = async () => {
    setLoading(true)
    email = email.replace(/\s/g,'')
    username = username.replace(/\s/g,'')
    const usernamesref = Database.ref(db)
    let doesUserNameExist = false

    if (password != passwordcheck) {
      setLoading(false)
      Alert.alert('Error!', 'Passwords do not match.')
    } else {
      Database.get(usernamesref).then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
          if (username === childSnapshot.val()) {
            doesUserNameExist = true
          }
        })
      }).catch(error => {
        setLoading(false)
        Alert.alert('Error!', error.message)
    })

      if (doesUserNameExist) {
        setLoading(false)
        Alert.alert('Error!', 'Username already exists.')
      } else {
        createUserWithEmailAndPassword(auth, email, password)
        .then(async userCredentials => {
          const userid = userCredentials.user.uid
          const imageUrl = await uploadImage(userid)
          updateProfile(userCredentials.user, {displayName: username, photoURL: imageUrl} ).catch((error => {
            setLoading(false)
            Alert.alert('Error!', error.message)
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
            Alert.alert('Error!', error.message) 
          }))
          
        }).catch(error => { 
          setLoading(false)
          Alert.alert('Error!', error.message)
        })
      }    
    } 
  }

  const saveProfileInfo = async (info, user) => {
    const data = info
    const updates = {}
    updates['/users/' + user + '/'] = data
    Database.update(Database.ref(db), updates).catch((error) => {
      setLoading(false)
      Alert.alert('Error!', error.message)
    })
  }

    const pickImage = async () => {
      if (hasGalleryPermission === false) {
        setLoading(false)
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
            Alert.alert('Error!', error.message)
            return null
      }
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding">
        {loading ? <AppLoader/> : null}
        <TouchableOpacity onPress={pickImage}>
              <View>
                {image != null ? (
                  <ImageBackground source={{ uri: image}}
                  style={styles.tinyLogo}
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
                  style={styles.tinyLogo}
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
            <View style={styles.inputContainer}>
                <TextInput placeholder='Username' value={username} selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setRegisteredUsername(text)} style={styles.input}/>
                <TextInput placeholder='Email' value={email} selectionColor='#0782F9' activeUnderlineColor='#0782F9' onChangeText={text => setRegisteredEmail(text)} style={styles.input}/>
                <TextInput placeholder='Password' value={password} selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setRegisteredPassword(text)} style={styles.input} secureTextEntry={passwordVisible} right={<TextInput.Icon name={passwordVisible ? "eye" : "eye-off"} onPress={() => setPasswordVisible(!passwordVisible)} />}/>
                <TextInput placeholder='Repeat Password' value={passwordcheck} selectionColor='#0782F9' activeUnderlineColor='#0782F9' autoCorrect={false} onChangeText={text => setRegisteredPasswordCheck(text)} style={styles.input} secureTextEntry={passwordVisible} right={<TextInput.Icon name={passwordVisible ? "eye" : "eye-off"} onPress={() => setPasswordVisible(!passwordVisible)} />}/>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleSignUp} style={[styles.button]}>
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity> 
                <TouchableOpacity onPress={() => {navigation.navigate('Login')}} style={[styles.button, styles.buttonOutline]}>
                    <Text style={styles.buttonOutlineText}>Login</Text>
                </TouchableOpacity> 
            </View>
        </KeyboardAvoidingView>
    )
}

export default RegisterScreen

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
    },
    tinyLogo: {
      height: 200,
      width: 200,
      marginBottom: 60,
      alignItems: 'center',
    }
})