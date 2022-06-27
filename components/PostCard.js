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

const PostCard = ({item, onDelete, onLike, onComment, onPress}) => {

    const [theme, setTheme] = React.useState(null)
    let [locale, setLocale] = React.useState('en')
    i18n.fallbacks = true
    i18n.translations = {en, pt}
    i18n.locale = locale

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