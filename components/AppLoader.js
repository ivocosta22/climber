import React from 'react'
import { View, StyleSheet } from 'react-native'
import { globalStyles } from './../styles/global'
import LottieView from 'lottie-react-native'

//This is an Apploader that will run every time I use the setLoading/setUploading states to true in the app code
//It will show as a loading circle that fills the middle screen of the app and prevents the user from interacting until the code has done it's tasks.
//This UI's styles are located in a global styles file (./styles/global.js)
const AppLoader = () => {
    return (
        <View style={[StyleSheet.absoluteFillObject, globalStyles.appLoaderContainer]}>
            <LottieView source={require('../assets/loader.json')} autoPlay loop />
        </View>
    )
}

export default AppLoader