import React from 'react'
import { View, Animated } from 'react-native'
import { globalStyles } from './../styles/global'

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