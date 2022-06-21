import React from 'react'
import { View, StyleSheet, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/core'
import { InputField, InputWrapper, AddImage, SubmitBtn, SubmitBtnText } from '../../styles/AddPost'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'
import { firebaseConfig } from '../../firebase'
import ActionButton from 'react-native-action-button'
import Icon from 'react-native-vector-icons/Ionicons'
import AppLoader from '../../components/AppLoader'
import * as ImagePicker from 'expo-image-picker'
import * as Database from 'firebase/database'

const AddPostScreen = () => {
    const [hasCameraPermission, setHasCameraPermission] = React.useState(null)
    const [hasGalleryPermission, setHasGalleryPermission] = React.useState(null)
    const [image, setImage] = React.useState(null)
    const [loading, setLoading] = React.useState(false)
    const [post, setPost] = React.useState(null)
    const navigation = useNavigation()
    const app = initializeApp(firebaseConfig)
    const storage = getStorage(app)
    const auth = getAuth(app)
    const db = getFirestore(app)
    const database = Database.getDatabase(app)

    //TODO: Do not allow empty posts
    React.useEffect(() => {
        (async () => {
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()
            const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
            setHasCameraPermission(cameraPermission.status === 'granted')
            setHasGalleryPermission(galleryStatus.status === 'granted')
        })()
    },[])

    const pickImage = async () => {
        if (hasGalleryPermission === false) {
            Alert.alert('Error!', 'Please give storage permissions to the application.')
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
        if (hasCameraPermission === false) {
            Alert.alert('Error!', 'Please give camera permissions to the application.')
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
    //TODO: search for ; in the project
    const submitPost = async () => {
        const imageUrl = await uploadImage()
        try {
            Database.get(Database.child(Database.ref(database), `users/${auth.currentUser.uid}/`)).then((snapshot) => {
                let username = snapshot.child('username').toJSON()
                let photoURL = snapshot.child('photoURL').toJSON()
                const docRef = addDoc(collection(db, 'posts'), {
                    userId: auth.currentUser.uid,
                    userName: username,
                    userImg: photoURL,
                    post: post,
                    postImg: imageUrl,
                    postTime: Timestamp.fromDate(new Date()),
                    likes: '0',
                    comments: '0'
                })
                Alert.alert('Post Published!', 'Your Post has been published successfully!')
            }).catch((error) => {
                Alert.alert('Error!', error.message)
            })
            setPost(null)
            setImage(null)
            navigation.goBack()
        } catch (e) {
            console.log(e)
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
                Alert.alert('Error!', error.message)
                return null
            }
    }

    return(
        <View style={styles.container}> 
                <InputWrapper>
                    {image != null ? <AddImage source={{uri: image}} /> : null}
                    <InputField
                        placeholder = "What's on your mind?"
                        multiline
                        numberOfLines={4}
                        value={post}
                        onChangeText={(content) => setPost(content)}
                    />
                    {loading ? (
                        <AppLoader/>
                    ) : (
                        <SubmitBtn onPress={submitPost}>
                            <SubmitBtnText>Post</SubmitBtnText>
                        </SubmitBtn>
                    )}    
                </InputWrapper>
                <ActionButton buttonColor='rgba(7, 130, 249, 1)'>
                    <ActionButton.Item
                        buttonColor="#9b59b6"
                        title="Take Photo"
                        onPress={useCamera}>
                        <Icon name="camera-outline" style={styles.actionButtonIcon} />
                    </ActionButton.Item>
                    <ActionButton.Item
                        buttonColor="#e84d3c"
                        title="Choose Photo"
                        onPress={pickImage}>
                        <Icon name="md-images-outline" style={styles.actionButtonIcon} />
                    </ActionButton.Item>
                </ActionButton>
        </View>        
    )
}

export default AddPostScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
    cameraContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    fixedRatio: {
        flex: 0,
        aspectRatio: 1
    },
})