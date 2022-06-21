import React from 'react'
import { useNavigation } from '@react-navigation/core'
import { View, StyleSheet, Text, ImageBackground, TextInput, Alert } from 'react-native'
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, sendEmailVerification, updateEmail, updatePassword, updateProfile } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../../firebase'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { TouchableOpacity } from 'react-native-gesture-handler'
import * as Database from 'firebase/database'
import * as ImagePicker from 'expo-image-picker'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FormButton from '../../components/FormButton'

//TODO: Change username under image at the same time as i change it in textinput. It's in the video playlist
  const EditProfileScreen = () => {
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const storage = getStorage(app)
    const database = Database.getDatabase(app)
    const navigation = useNavigation()
    const [image, setImage] = React.useState(null)
    const [hasGalleryPermission, setHasGalleryPermission] = React.useState(null)
    var [email, setEmail] = React.useState(null)
    var [password, setPassword] = React.useState(null)
    var [currentpassword, setCurrentPassword] = React.useState(null)
    var [username, setUsername] = React.useState(null)
    var [aboutme, setAboutMe] = React.useState(null)

      React.useEffect(() => {
        (async () => {
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

      await editUsername()

      await editProfilePicture()

      await editAboutMe()

      await editEmail()

      await editPassword()

      if ((email != auth.currentUser.email && email != null) || (password != '' && password != null)) {
        Alert.alert('Email changed', 'Your email/password was changed. Please re-login into the app.')
        auth.signOut().then(() => {
          navigation.navigate('Login')
        })
      } else {
        Alert.alert('Profile Updated!', 'Your Profile was updated successfully!')
        navigation.goBack()
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
          updateEmail(auth.currentUser, email).catch(error => {
            Alert.alert('Error!', error.message)
          })
        }).catch(error => {
          Alert.alert('Error!', error.message)
        })
      }
    }

    const editPassword = async () => {
      if (password != '' && password != null) {
        const credentialsforPassword = EmailAuthProvider.credential(auth.currentUser.email, currentpassword)

        await reauthenticateWithCredential(auth.currentUser, credentialsforPassword).then(() => {
          updatePassword(auth.currentUser, password).catch(error => {
            Alert.alert('Error!', error.message)
          })
        }).catch(error => {
          Alert.alert('Error!', error.message)
        })  
      }
    }

    return (
      <View style={styles.container}>
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
            <Text style={{marginTop: 10, fontSize: 18, fontWeight: 'bold'}}>
                  { auth.currentUser.displayName != null ? auth.currentUser.displayName : 'Username' }
            </Text>
          </View>
  
          <View style={styles.action}>
            <Ionicons name="person-outline" color="#333333" size={20} style={{marginLeft: 5, marginBottom: 10}} />
            <TextInput
              placeholder="Change Username"
              placeholderTextColor="#666666"
              autoCorrect={false}
              defaultValue= { auth.currentUser.displayName != null ? auth.currentUser.displayName : username}
              onChangeText={text => setUsername(text)}
              style={styles.textInput}
            />
          </View>
          <View style={styles.action}>
            <Ionicons name="mail-outline" color="#333333" size={20} style={{marginLeft: 5, marginBottom: 10}} />
            <TextInput
              placeholder="Change Email"
              placeholderTextColor="#666666"
              defaultValue={auth.currentUser.email}
              onChangeText={text => setEmail(text)}
              autoCorrect={false}
              style={styles.textInput}
              keyboardType='email-address'
            />
          </View>
          <View style={styles.action}>
            <Ionicons name="key-outline" color="#333333" size={20} style={{marginLeft: 5, marginBottom: 10}} />
            <TextInput
              placeholder="Current Password (Needed to change Email/Password)"
              placeholderTextColor="#666666"
              defaultValue=''
              onChangeText={text => setCurrentPassword(text)}
              autoCorrect={false}
              style={styles.textInput}
              secureTextEntry
            />
          </View>
          <View style={styles.action}>
            <Ionicons name="key-outline" color="#333333" size={20} style={{marginLeft: 5, marginBottom: 10}} />
            <TextInput
              placeholder="New Password"
              placeholderTextColor="#666666"
              defaultValue=''
              onChangeText={text => setPassword(text)}
              autoCorrect={false}
              style={styles.textInput}
              secureTextEntry
            />
          </View>
          <View style={styles.action}>
            <Ionicons name="ios-clipboard-outline" color="#333333" size={20} style={{marginLeft: 5, marginBottom: 10}} />
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="About Me"
              placeholderTextColor="#666666"
              defaultValue={ aboutme == 'Go to the Edit Profile Page to change this text :)' ? '' : aboutme}
              onChangeText={text => setAboutMe(text)}
              autoCorrect={true}
              style={[styles.textInput, {height: 40}]}
            />
          </View>
          <FormButton buttonTitle="Update" onPress={editProfile} />
      </View>
    )
  }
  
  export default EditProfileScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    commandButton: {
      padding: 15,
      borderRadius: 10,
      backgroundColor: '#FF6347',
      alignItems: 'center',
      marginTop: 10,
    },
    panel: {
      padding: 20,
      backgroundColor: '#FFFFFF',
      paddingTop: 20,
      width: '100%',
    },
    header: {
      backgroundColor: '#FFFFFF',
      shadowColor: '#333333',
      shadowOffset: {width: -1, height: -3},
      shadowRadius: 2,
      shadowOpacity: 0.4,
      paddingTop: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    panelHeader: {
      alignItems: 'center',
    },
    panelHandle: {
      width: 40,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#00000040',
      marginBottom: 10,
    },
    panelTitle: {
      fontSize: 27,
      height: 35,
    },
    panelSubtitle: {
      fontSize: 14,
      color: 'gray',
      height: 30,
      marginBottom: 10,
    },
    panelButton: {
      padding: 13,
      borderRadius: 10,
      backgroundColor: '#2e64e5',
      alignItems: 'center',
      marginVertical: 7,
    },
    panelButtonTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: 'white',
    },
    action: {
      flexDirection: 'row',
      marginTop: 10,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#f2f2f2',
      paddingBottom: 5,
    },
    actionError: {
      flexDirection: 'row',
      marginTop: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#FF0000',
      paddingBottom: 5,
    },
    textInput: {
      flex: 1,
      marginTop: -12,
      paddingLeft: 10,
      color: '#333333',
    },
  })