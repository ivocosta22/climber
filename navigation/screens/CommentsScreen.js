import * as React from 'react'
import { FlatList } from 'react-native'
import { Container, UserInfo, UserImgWrapper, UserImg, UserName, PostTime, MessageText, TextSection } from '../../styles/CommentsStyles'

const Comments = [
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

const CommentsScreen = () => {
    return (
        <Container>
            <FlatList data={Comments} keyExtractor={item=>item.id} renderItem={({item}) => (
                <UserInfo>
                    <UserImgWrapper>
                        <UserImg source={item.userImg}/>
                    </UserImgWrapper>
                    <TextSection>
                        <UserName>{item.userName}</UserName>        
                        <MessageText>{item.messageText}</MessageText>
                        <PostTime>{item.messageTime}</PostTime>
                    </TextSection>
                </UserInfo>
            )}/>
        </Container>
    )
}

export default CommentsScreen