import React from 'react'
import { View, StyleSheet, Button, SafeAreaView } from 'react-native'
import { InputField, InputWrapper, AddImage } from '../../styles/AddPost'
import ActionButton from 'react-native-action-button'
import Icon from 'react-native-vector-icons/Ionicons'
import * as ImagePicker from 'expo-image-picker'
import { Camera } from 'expo-camera'

const AddPostScreen = () => {

    const [hasCameraPermission, setHasCameraPermission] = React.useState(null)
    const [hasGalleryPermission, setHasGalleryPermission] = React.useState(null)
    const [camera, setCamera] = React.useState(null)
    const [image, setImage] = React.useState(null)
    const [type, setType] = React.useState(Camera.Constants.Type.back)
    const [isInCameraView, setIsInCameraView] = React.useState(false)

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
        console.log(result)
        if (!result.cancelled) {
            setImage(result.uri)
        }
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
                    <Button title="Flip Camera" onPress={() => {
                        setType(type === Camera.Constants.Type.back ? Camera.Constants.Type.front:Camera.Constants.Type.back)
                    }}></Button>
                    <Button title="Take Picture" onPress={() => takePicture()}></Button>
                    {image && <AddImage source={{uri: image}} style={{flex:1}} />}
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
    }
})