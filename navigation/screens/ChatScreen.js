import * as React from 'react'
import { View } from 'react-native'
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat'
import Ionicons from 'react-native-vector-icons/Ionicons';

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

    return (
        <GiftedChat messages={messages} onSend={messages => onSend(messages)} user={{_id: 1,}} renderBubble={renderBubble} alwaysShowSend renderSend={renderSend}/>
    )
}

export default ChatScreen