import * as React from 'react'
import { FlatList } from 'react-native'
import { Container } from '../../styles/FeedStyles'
import PostCard from '../../components/PostCard'

const Posts = [
    {
      id: '1',
      userName: 'Jenny Doe',
      userImg: require('../../assets/users/user1.png'),
      postTime: '4 mins ago',
      post:
        'Hey there, this is my test for a post of my social app in React Native.',
      postImg: require('../../assets/posts/post1.png'),
      liked: true,
      likes: '14',
      comments: '5',
    },
    {
      id: '2',
      userName: 'John Doe',
      userImg: require('../../assets/users/user2.png'),
      postTime: '2 hours ago',
      post:
        'Hey there, this is my test for a post of my social app in React Native.',
      postImg: 'none',
      liked: false,
      likes: '8',
      comments: '0',
    },
    {
      id: '3',
      userName: 'Ken William',
      userImg: require('../../assets/users/user3.png'),
      postTime: '1 hours ago',
      post:
        'Hey there, this is my test for a post of my social app in React Native.',
      postImg: require('../../assets/posts/post2.png'),
      liked: true,
      likes: '1',
      comments: '0',
    },
    {
      id: '4',
      userName: 'Selina Paul',
      userImg: require('../../assets/users/user4.png'),
      postTime: '1 day ago',
      post:
        'Hey there, this is my test for a post of my social app in React Native.',
      postImg: require('../../assets/posts/post3.png'),
      liked: true,
      likes: '22',
      comments: '4',
    },
    {
      id: '5',
      userName: 'Christy Alex',
      userImg: require('../../assets/users/user5.png'),
      postTime: '2 days ago',
      post:
        'Hey there, this is my test for a post of my social app in React Native.',
      postImg: 'none',
      liked: false,
      likes: '0',
      comments: '0',
    },
  ]

export default function HomeScreen({navigation}) {
    return(
        <Container>
            <FlatList data={Posts} renderItem={({item}) => <PostCard item={item}/>} keyExtractor={item=>item.id} showsVerticalScrollIndicator={false}></FlatList>
        </Container>
    )
}