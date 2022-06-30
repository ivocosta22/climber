import React from 'react'
import { View, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/core'
import { InputField, InputWrapper, AddImage, SubmitBtn, SubmitBtnText, InputWrapperDark, SubmitBtnTextDark, SubmitBtnDark } from '../../styles/AddPost'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'
import { firebaseConfig } from '../../firebase'
import { en, pt } from './../../localizations'
import { globalStyles } from './../../styles/global'
import ActionButton from 'react-native-action-button'
import Icon from 'react-native-vector-icons/Ionicons'
import AppLoader from '../../components/AppLoader'
import i18n from 'i18n-js'
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as ImagePicker from 'expo-image-picker'
import * as Database from 'firebase/database'

//The AddPostScreen is the screen the user will use to publish posts to the database, and then to the App.
const AddPostScreen = () => {
    const [hasCameraPermission, setHasCameraPermission] = React.useState(null)
    const [hasGalleryPermission, setHasGalleryPermission] = React.useState(null)
    const [image, setImage] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [post, setPost] = React.useState(null)
    const [theme, setTheme] = React.useState(null)
    const navigation = useNavigation()
    const app = initializeApp(firebaseConfig)
    const storage = getStorage(app)
    const auth = getAuth(app)
    const db = getFirestore(app)
    const database = Database.getDatabase(app)
    let [locale, setLocale] = React.useState('en')
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
            
              const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()
              setHasCameraPermission(cameraPermission.status === 'granted')
              const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
              setHasGalleryPermission(galleryStatus.status === 'granted')
          })()
    },[])

    //The pickImage function will check if the user has granted permissions for the App to access the library.
    //If so, then it will open the library using the Operating System and allow the user to pick an image.
    //After the user picks an image, I use the setImage(React useState) to set my image for later use in the App.
    const pickImage = async () => {
        if (hasGalleryPermission === false) {
            Alert.alert(i18n.t('error'), i18n.t('permissionsErrorStorage'))
        } else {
            let libraryresult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            })
            if (!libraryresult.cancelled) {
                setImage(libraryresult.uri)
            } 
        }
    }

    //The useCamera function will check if the user has granted permissions for the App to access the camera.
    //If so, then it will open the camera using the Operating System and allow the user to take a picture.
    //After the user takes a picture, I use the setImage(React useState) to set my image for later use in the App.
    const useCamera = async () => {
        if (hasCameraPermission === false) {
            Alert.alert(i18n.t('error'), i18n.t('permissionsErrorCamera'))
        } else {
            let cameraresult = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            })
            if (!cameraresult.cancelled) {
                setImage(cameraresult.uri)
            }
        }
    }
    
    //The submitPost function will post the content in the variable 'post'(Defined by the setPost(React useState)) and 'image'(Defined by the setImage(React useState))
    //It will run the uploadImage function first and the asynchronous function will wait for that to finish.
    //There's an if statement that is checking the following:
    //if 'post' is null and 'image' is null, that means the user didn't put any text and image in the post, 
    //this will throw an error because I don't want the database to get an empty post.
    //However, users will be able to publish a post with only an image, or with only text.
    //After returning true from the if statement, the code will run a try/catch statement, where it will attempt to connect to the database(*) and send the content of
    //the post to it, this includes the following variables: User ID(To check afterwards who published the post), post text, post image(If it exists), time of the post
    //and likes and comments of the post. Keep in mind that the likes and comments of the post will ALWAYS be sent as 0(Integer), so that it can be incremented later if
    //for example another user likes the post.
    //As soon as the request completes and is successfull, the App throws an Alert saying that the post has successfully been posted 
    //(Handled by translations(Refer to ./navigation/screens/LoginScreen.js for more info on Translations))
    //If something goes wrong with the request, then that's why I did this code inside a try/catch statement, that way, it will throw an Alert with the error message.
    //(*)For more info about my database refer to ./firebase.js
    const submitPost = async () => {
        const imageUrl = await uploadImage()
        if ((post == null && image == null) || (post == '' && image == null)) {
            Alert.alert(i18n.t('error'), i18n.t('errorPostEmpty'))
        } else {
            try {
                const docRef = addDoc(collection(db, 'posts'), {
                    userId: auth.currentUser.uid,
                    post: post,
                    postImg: imageUrl,
                    postTime: Timestamp.fromDate(new Date()),
                    likes: 0,
                    comments: 0
                })
                Alert.alert(i18n.t('postPublishedTitle'), i18n.t('postPublishedMessage'))
                setPost(null)
                setImage(null)
                navigation.goBack()
            } catch (error) {
                Alert.alert(i18n.t('error'), error.message)
            }
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

        const storageRef = ref(storage, `pictures/${auth.currentUser.uid}/${filename}`)
        const response = await fetch(image)
        const blob = await response.blob()
        setLoading(true)

        const task = uploadBytesResumable(storageRef, blob)

        try {
                await task
                const url = await getDownloadURL(storageRef)
                setLoading(false)
                return url
            } catch(error) {
                Alert.alert(i18n.t('error'), error.message)
                return null
            }
    }

    //This UI is being handled by the DarkTheme (Refer to ./navigation/screens/LoginScreen.js for more info).
    //This UI includes an AppLoader that I created (Refer to ./components/AppLoader.js for more info).
    //This UI is being handled by 'styled'. A library that I imported so that I could use css in some styles of my UI (Refer to ./styles/info.md)
    //This UI's styles are located in a global styles file (./styles/global.js)
    //There's an if statement inside this UI, which checks for the current state of the image(React useState) and loading(React useState).
    //If an image exists, then it will be shown in the UI. If the loading state is true, then that means the app is currently using the AppLoader.
    //Inside respective buttons, they will run their respective functions onPress.
    return(
        <View style={globalStyles.container}>
            {theme == 'light' ?
            <>
                <InputWrapper>
                    {image != null ? <AddImage source={{uri: image}} /> : null}
                    <InputField
                        placeholder={i18n.t('addPost')}
                        multiline
                        numberOfLines={4}
                        value={post}
                        onChangeText={(content) => setPost(content)}
                    />
                    {loading ? (
                        <AppLoader/>
                    ) : (
                        <SubmitBtn onPress={submitPost}>
                            <SubmitBtnText>{i18n.t('post')}</SubmitBtnText>
                        </SubmitBtn>
                    )}
                </InputWrapper>
                <ActionButton buttonColor='rgba(7, 130, 249, 1)'>
                    <ActionButton.Item
                        buttonColor="#9b59b6"
                        title={i18n.t('takePhoto')}
                        onPress={useCamera}>
                        <Icon name="camera-outline" style={globalStyles.actionButtonIcon} />
                    </ActionButton.Item>
                    <ActionButton.Item
                        buttonColor="#e84d3c"
                        title={i18n.t('choosePhoto')}
                        onPress={pickImage}>
                        <Icon name="md-images-outline" style={globalStyles.actionButtonIcon} />
                    </ActionButton.Item>
                </ActionButton>
            </> : 
            <>
                <InputWrapperDark>
                    {image != null ? <AddImage source={{uri: image}} /> : null}
                    <InputField 
                        style={{color: '#fff'}}
                        placeholderTextColor="#fff"
                        placeholder={i18n.t('addPost')}
                        multiline
                        numberOfLines={4}
                        value={post}
                        onChangeText={(content) => setPost(content)}
                    />
                    {loading ? (
                        <AppLoader/>
                    ) : (
                        <SubmitBtnDark onPress={submitPost}>
                            <SubmitBtnTextDark>{i18n.t('post')}</SubmitBtnTextDark>
                        </SubmitBtnDark>
                    )}
                </InputWrapperDark>
                <ActionButton buttonColor='rgba(7, 130, 249, 1)'>
                    <ActionButton.Item
                        buttonColor="#9b59b6"
                        title={i18n.t('takePhoto')}
                        onPress={useCamera}>
                        <Icon name="camera-outline" style={globalStyles.actionButtonIcon} />
                    </ActionButton.Item>
                    <ActionButton.Item
                        buttonColor="#e84d3c"
                        title={i18n.t('choosePhoto')}
                        onPress={pickImage}>
                        <Icon name="md-images-outline" style={globalStyles.actionButtonIcon} />
                    </ActionButton.Item>
                </ActionButton>
            </>}
        </View>        
    )
}

export default AddPostScreen