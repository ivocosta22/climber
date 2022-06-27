import * as React from 'react'
import { FlatList } from 'react-native'
import { Container, UserInfo, UserImgWrapper, UserImg, UserName, PostTime, MessageText, TextSection, ContainerDark, UserNameDark, MessageTextDark, PostTimeDark } from '../../styles/CommentsStyles'
import { en, pt } from './../../localizations'
import i18n from 'i18n-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Comments = [
    {
        id: '1',
        userName: 'Jenny Doe',
        userImg: require('../../assets/users/user3.png'),
        messageTime: '4 mins ago',
        messageTimePT: 'há 4 minutos',
        messageText: 'Hey there, this is my test for a post of my social app in React Native.',
    },
    {
        id: '2',
        userName: 'John Doe',
        userImg: require('../../assets/users/user1.png'),
        messageTime: '2 hours ago',
        messageTimePT: 'há 2 horas',
        messageText: 'Hey there, this is my test for a post of my social app in React Native.',
    },
    {
        id: '3',
        userName: 'Ken William',
        userImg: require('../../assets/users/user4.png'),
        messageTime: '1 hour ago',
        messageTimePT: 'há 1 hora',
        messageText: 'Hey there, this is my test for a post of my social app in React Native.',
    },
    {
        id: '4',
        userName: 'Selina Paul',
        userImg: require('../../assets/users/user6.png'),
        messageTime: '1 day ago',
        messageTimePT: 'há 1 dia',
        messageText: 'Hey there, this is my test for a post of my social app in React Native.',
    },
    {
        id: '5',
        userName: 'Christy Alex',
        userImg: require('../../assets/users/user7.png'),
        messageTime: '2 days ago',
        messageTimePT: 'há 2 dias',
        messageText: 'Hey there, this is my test for a post of my social app in React Native.',
    },
]

const CommentsScreen = () => {
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

    return (
        <>{theme == 'light' ?
            <Container>
                <FlatList data={Comments} keyExtractor={item=>item.id} renderItem={({item}) => (
                    <UserInfo>
                        <UserImgWrapper>
                            <UserImg source={item.userImg}/>
                        </UserImgWrapper>
                        <TextSection>
                            <UserName>{item.userName}</UserName>        
                            <MessageText>{item.messageText}</MessageText>
                            <PostTime>{locale == 'pt' ? item.messageTimePT : item.messageTime}</PostTime>
                        </TextSection>
                    </UserInfo>
                )}/>
            </Container> 
            :
            <ContainerDark>
                <FlatList data={Comments} keyExtractor={item=>item.id} renderItem={({item}) => (
                    <UserInfo>
                        <UserImgWrapper>
                            <UserImg source={item.userImg}/>
                        </UserImgWrapper>
                        <TextSection>
                            <UserNameDark>{item.userName}</UserNameDark>        
                            <MessageTextDark>{item.messageText}</MessageTextDark>
                            <PostTimeDark>{locale == 'pt' ? item.messageTimePT : item.messageTime}</PostTimeDark>
                        </TextSection>
                    </UserInfo>
                )}/>
            </ContainerDark> 
        }</>
    )
}

export default CommentsScreen