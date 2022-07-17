import * as React from 'react'
import { FlatList } from 'react-native'
import { Container, Card, UserInfo, UserImgWrapper, UserImg, UserInfoText, UserName, PostTime, MessageText, TextSection, ContainerDark, UserNameDark, PostTimeDark, MessageTextDark } from '../../styles/MessageStyles'
import { en, pt } from './../../localizations'
import i18n from 'i18n-js'
import AsyncStorage from "@react-native-async-storage/async-storage"

//This Screen has not been finished, however I will show the logic of what I have here so far.
//I have this list below called Messages which is the template of what my Database(*) should have
//Basically as soon as the user would get/send a message, an object containing the User ID, Message Time and Text would be sent to the Database
//Keep in mind that the Username and Profile image would not be sent as that could be updated at any time, so that needs to be fetched from the user's info
//not this list. For placeholder purposes, the username and userImg exist on this list.
const Messages = [
    {
        id: '1',
        userName: 'John Doe',
        userImg: require('../../assets/users/user3.png'),
        messageTime: '4 mins ago',
        messageTimePT: 'há 4 minutos',
        messageText: 'Hello!',
    },
    {
        id: '2',
        userName: 'Mary Doe',
        userImg: require('../../assets/users/user1.png'),
        messageTime: '2 hours ago',
        messageTimePT: 'há 2 horas',
        messageText: 'Last time we did it, it did not turn out well...',
    },
    {
        id: '3',
        userName: 'Joana Silva',
        userImg: require('../../assets/users/user4.png'),
        messageTime: '1 hour ago',
        messageTimePT: 'há 1 hora',
        messageText: 'yo 😉',
    },
    {
        id: '4',
        userName: 'Mariana Neves',
        userImg: require('../../assets/users/user6.png'),
        messageTime: '1 day ago',
        messageTimePT: 'há 1 dia',
        messageText: 'Boas amigo. Chumbei em calculo financeiro. Ajuda-me.',
    },
    {
        id: '5',
        userName: 'Felicia Lengyel',
        userImg: require('../../assets/users/user7.png'),
        messageTime: '2 days ago',
        messageTimePT: 'há 2 dias',
        messageText: 'Hey there.',
    },
]

const MessagesScreen = ({navigation}) => {

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

    //This UI is being handled by the DarkTheme (Refer to ./navigation/screens/LoginScreen.js for more info).
    //This UI is being handled by 'styled'. A library that I imported so that I could use css in some styles of my UI (Refer to ./styles/info.md).
    //This UI is composed by a group of Views(Container, Card, UserInfo, UserImgWrapper, TextSection).
    return (
        <>{theme == 'light' ?
            <Container>
                <FlatList data={Messages} keyExtractor={item=>item.id} renderItem={({item}) => (
                    <Card onPress={() => navigation.navigate('Chat', {userName: item.userName, profilePic: item.userImg, messageText: item.messageText})}>
                        <UserInfo>
                            <UserImgWrapper>
                                <UserImg source={item.userImg}/>
                            </UserImgWrapper>
                            <TextSection>
                                <UserInfoText>
                                    <UserName>{item.userName}</UserName>    
                                    <PostTime>{locale == 'pt' ? item.messageTimePT : item.messageTime}</PostTime>
                                </UserInfoText>
                                <MessageText>{item.messageText}</MessageText>
                            </TextSection>
                        </UserInfo>
                    </Card>
                )}/>
            </Container> 
            : 
            <ContainerDark>
                <FlatList data={Messages} keyExtractor={item=>item.id} renderItem={({item}) => (
                    <Card onPress={() => navigation.navigate('Chat', {userName: item.userName, profilePic: item.userImg, messageText: item.messageText})}>
                        <UserInfo>
                            <UserImgWrapper>
                                <UserImg source={item.userImg}/>
                            </UserImgWrapper>
                            <TextSection>
                                <UserInfoText>
                                    <UserNameDark>{item.userName}</UserNameDark>    
                                    <PostTimeDark>{locale == 'pt' ? item.messageTimePT : item.messageTime}</PostTimeDark>
                                </UserInfoText>
                                <MessageTextDark>{item.messageText}</MessageTextDark>
                            </TextSection>
                        </UserInfo>
                    </Card>
                )}/>
            </ContainerDark>
        }</>
    )
}

export default MessagesScreen