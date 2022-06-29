import React from 'react'
import { Card, UserInfo, UserImg, UserName, UserInfoText, PostTime, PostText, InteractionWrapper, Interaction, InteractionText, PostDivider, CardDark, UserNameDark, PostTimeDark, PostTextDark, InteractionTextDark } from '../styles/FeedStyles'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { firebaseConfig } from '../firebase'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { en, pt } from './../localizations'
import Ionicons from 'react-native-vector-icons/Ionicons'
import moment from 'moment'
import 'moment/locale/pt'
import ProgressiveImage from './ProgressiveImage'
import AsyncStorage from "@react-native-async-storage/async-storage"
import i18n from 'i18n-js'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

//The PostCard is the file that will render and handle the posts shown in the Home Screen.
//Some arguments are being passed down to this file, that will come from ./navigation/screens/HomeScreen.js
//These arguments will be used here for the UI Handles, mainly onPress
//An important argument being passed here is 'item', which is passing the information of the post coming from my database.
//More info about the database in ./firebase.js
const PostCard = ({item, onDelete, onLike, onComment, onPress}) => {

    const [theme, setTheme] = React.useState(null)
    let [locale, setLocale] = React.useState('en')
    i18n.fallbacks = true
    i18n.translations = {en, pt}
    i18n.locale = locale
    
    //This file is using React's useEffect, which means that everything inside this function will be ran as soon as this file loads.
    //Inside this useEffect I will get the current setting in AsyncStorage for the value of isDarkMode (Which defines if the user is in Dark Mode or not).
    //AsyncStorage will also get the currentLanguage value to check what language the user has saved (Refer to ./navigation/screens/LoginScreen.js for more info).
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

    //Here, I'm declaring 3 variables that will be used to change the Like Icon depending on the liked state of the user
    //If the post is liked, then it shows the icon filled with blue, if not, it will show an outline of the icon with the color depending on the current theme(isDarkMode) of the user.
    //It will also change the text based on how many likes it has. If it has no likes, the text will only show 'Like'. If it has 1 like, it will show '1 Like' 
    //and then it will add the letter 's' to the end once it has more than 1 like.
    //The same thing will happen with the comments, although that functionality hasn't been done yet. The text will be prepared to be shown whenever the feature is complete however.
    //Translation for both likes and comments are being handled inside the if statements.
    let likeIcon = item.liked ? 'heart' : 'heart-outline'
    let likeIconColor = item.liked ? '#0782F9' : '#333'
    let likeIconColorDark = item.liked ? '#0782F9' : '#fff'

    if (item.likes == 1) {
        if (locale == 'en') {
            likeText = '1 Like'
        } else if (locale == 'pt') {
            likeText == '1 Gosto'
        } else {
            likeText = '1 Like'
        }
    } else if (item.likes > 1) {
        if (locale == 'en') {
            likeText = item.likes + ' Likes'
        } else if (locale == 'pt') {
            likeText = item.likes + ' Gostos'
        } 
    } else {
        if (locale == 'en') {
            likeText = 'Like'
        } else if (locale == 'pt') {
            likeText = 'Gostar'
        } else {
            likeText = 'Like'
        }
        
    }

    if (item.comments == 1) {
        if (locale == 'en') {
            commentText = '1 Comment'
        } else if (locale == 'pt') {
            commentText = '1 Comentário'
        } else {
            commentText = '1 Comment'
        }
    } else if (item.comments > 1) {
        if (locale == 'en') {
            commentText = item.comments + ' Comments'
        } else if (locale == 'pt') {
            commentText = item.comments + ' Comentários'
        } else {
            commentText = item.comments + ' Comments'
        }
    } else {
        if (locale == 'en') {
            commentText = 'Comment'
        } else if (locale == 'pt') {
            commentText = 'Comentar'
        } else {
            commentText = 'Comment'
        }
    }
    //This UI is being handled by the DarkTheme (Refer to ./navigation/screens/LoginScreen.js for more info).
    //This UI is being handled by 'styled'. A library that I imported so that I could use css in some styles of my UI (Refer to ./styles/info.md).
    //This UI is composed by a group of Views(Card, UserInfo, UserInfoText, InteractionWrapper).
    //Inside these Views, I'm showing the Username of the user posting the post, the user's profile picture, the time of the post(*), a placeholder image while the post image loads,
    //the post itself, and respective like, comment and delete interactions.
    //There's an if statement inside this UI, which checks if the userId of the user posting is equal to the current user logged in, if so, the trash bin icon will be shown
    //which will allow the user to delete the post. The backend of this is handled in ./navigation/screens/HomeScreen.js
    //Other things that will be handled by the HomeScreen will be the like onPress and comment onPress.
    //(*) I'm getting the time of the post using a 3rd party library called 'moment'. It will convert the toDate() javascript method to readable time, for example '5 min ago' or '2 days ago'.
    //This library is also handling the translation of the app, so this will be using portuguese as well (Refer to ./navigation/screens/LoginScreen.js for more info about the translation of the App.)
    return (
        <>
            {theme == 'light' ?
            <Card>
                <UserInfo>
                    <UserImg source={{uri: item.userImg}}></UserImg>
                    <UserInfoText>
                    <TouchableOpacity onPress={onPress}>
                        <UserName>{item.userName}</UserName>
                    </TouchableOpacity>
                        <PostTime>{moment(item.postTime.toDate()).locale(locale).fromNow()}</PostTime>
                    </UserInfoText>
                </UserInfo>
                <PostText>{item.post}</PostText>
                {item.postImg != null ? (
                    <ProgressiveImage
                        defaultImageSource={require('../assets/default-img.png')}
                        source={{uri: item.postImg}}
                        style={{width: '100%', height: 250}}
                        resizeMode='cover'
                    />
                ) : <PostDivider />}
                <InteractionWrapper>
                    {<Interaction active={item.liked} onPress={() => onLike(item.id)}>
                        <Ionicons name={likeIcon} size={25} color={likeIconColor}/>
                        <InteractionText active={item.liked}>{likeText}</InteractionText>
                    </Interaction>}
                    {<Interaction onPress={() => onComment(item.id)}>
                        <Ionicons name="md-chatbubble-outline" size={25}/>
                        <InteractionText>{commentText}</InteractionText>
                    </Interaction>}
                    {auth.currentUser.uid == item.userId ? 
                    <Interaction onPress={() => onDelete(item.id)}>
                        <Ionicons name="md-trash-bin" size={25}/>
                    </Interaction>
                    : null }
                </InteractionWrapper>
            </Card> :
            <CardDark>
                <UserInfo>
                    <UserImg source={{uri: item.userImg}}></UserImg>
                    <UserInfoText>
                    <TouchableOpacity onPress={onPress}>
                        <UserNameDark>{item.userName}</UserNameDark>
                    </TouchableOpacity>
                        <PostTimeDark>{moment(item.postTime.toDate()).locale(locale).fromNow()}</PostTimeDark>
                    </UserInfoText>
                </UserInfo>
                <PostTextDark>{item.post}</PostTextDark>
                {item.postImg != null ? (
                    <ProgressiveImage
                        defaultImageSource={require('../assets/default-img.png')}
                        source={{uri: item.postImg}}
                        style={{width: '100%', height: 250}}
                        resizeMode='cover'
                    />
                ) : <PostDivider />}
                <InteractionWrapper>
                    {<Interaction active={item.liked} onPress={() => onLike(item.id)}>
                        <Ionicons name={likeIcon} size={25} color={likeIconColorDark}/>
                        <InteractionTextDark active={item.liked}>{likeText}</InteractionTextDark>
                    </Interaction>}
                    {<Interaction onPress={() => onComment(item.id)}>
                        <Ionicons name="md-chatbubble-outline" size={25} color={'#fff'}/>
                        <InteractionTextDark>{commentText}</InteractionTextDark>
                    </Interaction>}
                    {auth.currentUser.uid == item.userId ? 
                    <Interaction onPress={() => onDelete(item.id)}>
                        <Ionicons name="md-trash-bin" size={25} color={'#fff'}/>
                    </Interaction>
                    : null }
                </InteractionWrapper>
            </CardDark>}
        </>
    )
}

export default PostCard