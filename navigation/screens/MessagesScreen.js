import * as React from 'react'
import { FlatList } from 'react-native'
import { Container, Card, UserInfo, UserImgWrapper, UserImg, UserInfoText, UserName, PostTime, MessageText, TextSection, ContainerDark, UserNameDark, PostTimeDark, MessageTextDark } from '../../styles/MessageStyles'
import AsyncStorage from "@react-native-async-storage/async-storage"

const Messages = [
    {
        id: '1',
        userName: 'Jenny Doe',
        userImg: require('../../assets/users/user3.png'),
        messageTime: '4 mins ago',
        messageText: 'Hey there, this is my test for a post of my social app in React Native.',
    },
    {
        id: '2',
        userName: 'John Doe',
        userImg: require('../../assets/users/user1.png'),
        messageTime: '2 hours ago',
        messageText: 'Hey there, this is my test for a post of my social app in React Native.',
    },
    {
        id: '3',
        userName: 'Ken William',
        userImg: require('../../assets/users/user4.png'),
        messageTime: '1 hour ago',
        messageText: 'Hey there, this is my test for a post of my social app in React Native.',
    },
    {
        id: '4',
        userName: 'Selina Paul',
        userImg: require('../../assets/users/user6.png'),
        messageTime: '1 day ago',
        messageText: 'Hey there, this is my test for a post of my social app in React Native.',
    },
    {
        id: '5',
        userName: 'Christy Alex',
        userImg: require('../../assets/users/user7.png'),
        messageTime: '2 days ago',
        messageText: 'Hey there, this is my test for a post of my social app in React Native.',
    },
]

const MessagesScreen = ({navigation}) => {

    const [theme, setTheme] = React.useState(null)

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
      },[])

    return (
        <>{theme == 'light' ?
            <Container>
                <FlatList data={Messages} keyExtractor={item=>item.id} renderItem={({item}) => (
                    <Card onPress={() => navigation.navigate('Chat', {userName: item.userName})}>
                        <UserInfo>
                            <UserImgWrapper>
                                <UserImg source={item.userImg}/>
                            </UserImgWrapper>
                            <TextSection>
                                <UserInfoText>
                                    <UserName>{item.userName}</UserName>    
                                    <PostTime>{item.messageTime}</PostTime>
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
                    <Card onPress={() => navigation.navigate('Chat', {userName: item.userName})}>
                        <UserInfo>
                            <UserImgWrapper>
                                <UserImg source={item.userImg}/>
                            </UserImgWrapper>
                            <TextSection>
                                <UserInfoText>
                                    <UserNameDark>{item.userName}</UserNameDark>    
                                    <PostTimeDark>{item.messageTime}</PostTimeDark>
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