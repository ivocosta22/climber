import React from 'react'
import { Image } from 'react-native'
import { globalStyles } from './../../styles/global'
import Onboarding from 'react-native-onboarding-swiper'


const OnboardingScreen = ({navigation}) => {
    return (
        <Onboarding onSkip={() => navigation.replace('LoginScreen')} onDone={() => navigation.replace('LoginScreen')} pages={[
            {
                backgroundColor: '#2986CC',
                image: <Image style={globalStyles.tinyLogo} source={require('../../assets/icon.png')} />,
                title: 'Welcome to Climber!',
                subtitle: 'The App made for gamers to interact and play together.',
            },
            {
                backgroundColor: '#45335F',
                image: <Image style={globalStyles.wideTinyLogo} source={require('../../assets/climb.png')} />,
                title: 'Meet up!',
                subtitle: 'Meet other gamers like you, with the same rank, playing the same game!',
            },
            {
                backgroundColor: 'tomato',
                image: <Image style={globalStyles.mediumLogo} source={require('../../assets/meetup.png')} />,
                title: 'Climb Together!',
                subtitle: 'Play with your new teammates, and climb through the ranks together!',
            },
        ]}
        />
    )
}

export default OnboardingScreen