import React from 'react'
import { Image, StyleSheet, Button, View } from 'react-native'
import Onboarding from 'react-native-onboarding-swiper'

const OnboardingScreen = ({navigation}) => {
    return (
        <Onboarding onSkip={() => navigation.replace('LoginScreen')} onDone={() => navigation.replace('LoginScreen')} pages={[
            {
                backgroundColor: '#2986CC',
                image: <Image style={styles.tinyLogo} source={require('../../assets/icon.png')} />,
                title: 'Welcome to Climber!',
                subtitle: 'The App made for gamers to interact and play together.',
            },
            {
                backgroundColor: '#45335F',
                image: <Image style={styles.wideTinyLogo} source={require('../../assets/climb.png')} />,
                title: 'Meet up!',
                subtitle: 'Meet other gamers like you, with the same rank, playing the same game!',
            },
            {
                backgroundColor: 'tomato',
                image: <Image style={styles.mediumLogo} source={require('../../assets/meetup.png')} />,
                title: 'Climb Together!',
                subtitle: 'Play with your new teammates, and climb through the ranks together!',
            },
        ]}
        />
    )
}

export default OnboardingScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tinyLogo: {
        height: 200,
        width: 200,
        alignItems: 'center',
    },
    mediumLogo: {
        height: 300,
        width: 300,
        marginTop: -100,
        alignItems: 'center',
    },
    wideTinyLogo: {
        height: 180,
        width: 400,
        marginBottom: 20,
        alignItems: 'center',
    }
})