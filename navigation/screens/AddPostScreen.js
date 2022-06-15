import React from 'react'
import { View, StyleSheet, Button, Alert, ActivityIndicator, Text } from 'react-native'
import { InputField, InputWrapper, AddImage, SubmitBtn, SubmitBtnText, StatusWrapper } from '../../styles/AddPost'
import { Camera } from 'expo-camera'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { firebaseConfig } from '../../firebase'
import { getStorage, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage'
import ActionButton from 'react-native-action-button'
import Icon from 'react-native-vector-icons/Ionicons'
import * as ImagePicker from 'expo-image-picker'

const AddPostScreen = () => {

    const [hasCameraPermission, setHasCameraPermission] = React.useState(null)
    const [hasGalleryPermission, setHasGalleryPermission] = React.useState(null)
    const [camera, setCamera] = React.useState(null)
    const [image, setImage] = React.useState(null)
    const [type, setType] = React.useState(Camera.Constants.Type.back)
    const [isInCameraView, setIsInCameraView] = React.useState(false)
    const [uploading, setUploading] = React.useState(false)
    const [transferred, setTransferred] = React.useState(0)
    const app = initializeApp(firebaseConfig)
    const storage = getStorage(app)
    const auth = getAuth(app)

    React.useEffect(() => {
        (async () => {
            const cameraPermission = await Camera.requestCameraPermissionsAsync()
            const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync()
            setHasCameraPermission(cameraPermission.status === 'granted')
            setHasGalleryPermission(galleryStatus.status === 'granted')
        })()
    },[])

    const takePicture = async () => {
        if (hasCameraPermission === false) {
            return <Text>Please give camera permissions to the application.</Text>
        } else if (hasGalleryPermission === false) {
            return <Text>Please give storage permissions to the application</Text>
        }
        if (camera) {
            const data = await camera.takePictureAsync(null)
            setIsInCameraView(false)
            setImage(data.uri)
        }
    }

    const useCamera = async () => {
        setIsInCameraView(true)
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        })
        if (!result.cancelled) {
            setImage(result.uri)
        }
    }

    const exitCamera = async () => {
        setIsInCameraView(false)
    }

    const submitPost = async () => {
        const userid = auth.currentUser.uid
        let filename = image.substring(image.lastIndexOf('/') + 1)
        const extension = filename.split('.').pop()
        const name = filename.split('.').slice(0,-1).join('.')
        filename = name + Date.now() + '.' + extension

        const storageRef = ref(storage, `posts/${userid}/${filename}`)
        const response = await fetch(image)
        const blob = await response.blob()
        setUploading(true)
        setTransferred(0)

        const task = uploadBytesResumable(storageRef, blob)

        task.on('state_changed', taskSnapshot => {
            setTransferred(
                Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) * 100
            )
        })

        try {
                await task
                setUploading(false)
                Alert.alert('Image Uploaded!', 'Your Image has been uploaded') 
            } catch(e) {
                console.log(e)
            }
        setImage(null)
    }

    return(
        <View style={styles.container}>
            
                <InputWrapper>
                    {image != null ? <AddImage source={{uri: image}} /> : null}
                    <InputField
                        placeholder = "What goal did you achieve?"
                        multiline
                        numberOfLines={4}
                    />
                    {uploading ? (
                        <StatusWrapper>
                            <Text>{transferred} % Completed!</Text>
                            <ActivityIndicator size="large" color='#9b59b6' />
                        </StatusWrapper>
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

                {isInCameraView === true && (
                <View>
                    <View style={styles.cameraContainer}>
                        <Camera ref={ref => setCamera(ref)}
                        style={styles.fixedRatio}
                        type={type}
                        ratio={'1:1'}/>
                    </View>
                    <Button title="Take Picture" onPress={() => takePicture()}></Button>
                    <Button title="Flip Camera" onPress={() => {
                        setType(type === Camera.Constants.Type.back ? Camera.Constants.Type.front:Camera.Constants.Type.back)
                    }}></Button>
                    <Button title="Exit" onPress={() => exitCamera()}></Button>
                </View>
                )}

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