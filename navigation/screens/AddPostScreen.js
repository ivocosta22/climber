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

    const pickImage = async () => {
        const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
        setHasGalleryPermission(galleryStatus.status === 'granted')

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

    const useCamera = async () => {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()
        setHasCameraPermission(cameraPermission.status === 'granted')

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