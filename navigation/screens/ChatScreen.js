import * as React from 'react'
import { View } from 'react-native'
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

const ChatScreen = () => {

    const [messages, setMessages] = React.useState([])

        React.useEffect(() => {
            setMessages([
                {
                    _id: 1,
                    text: 'Hello developer',
                    createdAt: new Date(),
                    user: {
                        _id: 2,
                        name: 'React Native',
                        avatar: 'https://placeimg.com/140/140/any'
                    }
                },
            ])
        }, [])

    const onSend = React.useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
    }, [])

    const renderSend = (props) => {
        return (
            <Send {...props}>
                <View>
                    <Ionicons name='send-sharp' size={28} color='#0782F9' style={{marginBottom: 7, marginRight: 7}} />
                </View>
            </Send>
        )
    }

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

    const scrolltoBottomComponent = () => {
        return (
            <FontAwesome5 name='angle-double-down' size={22} color='#333'/>
        )
    }

    return (
        <GiftedChat messages={messages} onSend={messages => onSend(messages)} user={{_id: 1,}} renderBubble={renderBubble} alwaysShowSend renderSend={renderSend} scrollToBottom scrollToBottomComponent={scrolltoBottomComponent}/>
    )
}

export default ChatScreen