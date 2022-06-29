import * as React from 'react'
import { View } from 'react-native'
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'dayjs/locale/en'
import 'dayjs/locale/pt'

//This Screen has not been finished, however I will show the logic of what I have here so far.
//Inside this Screen, I'm mainly using the 3rd party library 'GiftedChat' from react-native.
const ChatScreen = () => {

    const [messages, setMessages] = React.useState([])
    let [locale, setLocale] = React.useState('en')

    //This file is using React's useEffect, which means that everything inside this function will be ran as soon as this file loads.
    //Inside this useEffect I will get the current setting in AsyncStorage for the value of currentLanguage to check what language the user has saved 
    //(Refer to ./navigation/screens/LoginScreen.js for more info).

    //I'm using React's useState on the variable 'messages'. Currently, I have a hard created JSON inside it, but the primary objective of this variable is to get that
    //same JSON format from my database(*). This is something I will implement in the future.
    //(*)More info about the database in ./firebase.js
        React.useEffect(() => {
        
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

            setMessages([
                {
                    _id: 1,
                    text: 'Hello! How are you?',
                    createdAt: new Date(),
                    user: {
                        _id: 2,
                        name: 'React Native',
                        avatar: 'https://placeimg.com/140/140/any'
                    }
                },
            ])
        }, [])
    //Here, the function onSend will return a callback of the updated messages list after the use sends a new message.
    //Keep in mind that the messages variable is an Array with a nested JSON inside each position.
    const onSend = React.useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
    }, [])

    //This is the UI of the send Button. Here, I used an Ionicon which is better in my opinion. 
    const renderSend = (props) => {
        return (
            <Send {...props}>
                <View>
                    <Ionicons name='send-sharp' size={28} color='#0782F9' style={{marginBottom: 7, marginRight: 7}} />
                </View>
            </Send>
        )
    }

    //This is the UI of the chat bubbles, I changed a few colors here to fit my app's theme.
    const renderBubble = (props) => {
        return (
        <Bubble {...props} wrapperStyle={{
            right: {
                backgroundColor: '#0782F9'
            },
            left: {
                backgroundColor: '#E2E2E2'
            }
        }}
            textStyle={{
                right: {
                    color: '#FFF'
                }
            }}
        />
        ) 
    }

    //I implemented this for better user experience. This is a button that will show in case there's too many messages and the user scrolls up far enough.
    //When pressed, the Chat will scroll back down till the last message. This functions the same way as the 'Scroll to Top' buttons in websites work.
    const scrolltoBottomComponent = () => {
        return (
            <FontAwesome5 name='angle-double-down' size={22} color='#333'/>
        )
    }

    //This is the UI of the screen. It also is rendering the bottom of the screen, where the user can type the message.
    //I changed the placeholder to be able to handle my translations.
    //More info about the App translation in ./navigation/screens/LoginScreen.js
    return (
        <GiftedChat placeholder={locale == 'pt' ? 'Escreve uma mensagem...' : 'Type a message...'} messages={messages} onSend={messages => onSend(messages)} user={{_id: 1,}} renderBubble={renderBubble} alwaysShowSend renderSend={renderSend} scrollToBottom scrollToBottomComponent={scrolltoBottomComponent}/>
    )
}

export default ChatScreen