import React from 'react'
import { Image } from 'react-native'
import { globalStyles } from './../../styles/global'
import Onboarding from 'react-native-onboarding-swiper'

//The OnboardingScreen is a Screen that is only shown in case the user is running the App for the first time,
//showing an introduction to the concept.
//There's currently a bug with this Screen. There's no String Translations done. This is explained in Line 42 of ./navigation/screens/LoginScreen.js
//The onboarding-swiper from react native gives some slider screens to the user for some better user experience, I currently have 3 pages of information
//providing an intro to the app.
const OnboardingScreen = ({navigation}) => {
    //This UI's styles are located in a global styles file (./styles/global.js)
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