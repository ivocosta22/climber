import React from 'react'
import { View, Animated } from 'react-native'
import { globalStyles } from './../styles/global'

//This file represents the placeholder image that will be loaded in the PostCard.js | HomeScreen.js files.
//This is mainly used to handle slow internet connections or if my database is having low response speeds.
//For more info about my database refer to ./firebase.js
//As soon as the real post image loads, the placeholder image will dissapear and the real image is shown.
class ProgressiveImage extends React.Component {

    defaultImageAnimated = new Animated.Value(0)
    imageAnimated = new Animated.Value(0)

    handleDefaultImageLoad = () => {
        Animated.timing(this.defaultImageAnimated, {
            toValue: 1,
            useNativeDriver: true
        }).start()
    }

    handleImageLoad = () => {
        Animated.timing(this.imageAnimated, {
          toValue: 1,
          useNativeDriver: true,
        }).start()
      }

    render() {
        const { defaultImageSource, source, style, ...props} = this.props
        return (
            <View style={globalStyles.containerProgressiveImage}>
                <Animated.Image 
                {...props}
                source={defaultImageSource} 
                style={[style, { opacity: this.defaultImageAnimated }]}
                onLoad={this.handleDefaultImageLoad}
                blurRadius={1}
                />
                <Animated.Image
                {...props}
                source={source} 
                style={[style, { opacity: this.defaultImageAnimated }, globalStyles.imageOverlay]}
                onLoad={this.handleImageLoad}
                blurRadius={1}
                />
            </View>
        )
    }
}

export default ProgressiveImage