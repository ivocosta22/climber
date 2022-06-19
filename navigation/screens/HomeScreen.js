import * as React from 'react'
import { FlatList, Alert, SafeAreaView, ScrollView, BackHandler } from 'react-native'
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { Container } from '../../styles/FeedStyles'
import { firebaseConfig } from '../../firebase'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, orderBy, getDoc, deleteDoc, doc } from 'firebase/firestore'
import { deleteObject, getStorage, ref } from 'firebase/storage'
import SkeletonLoader from 'expo-skeleton-loader'
import PostCard from '../../components/PostCard'

export default function HomeScreen({navigation}) {
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    const storage = getStorage(app)
    const [posts, setPosts] = React.useState(null)
    const [loading, setLoading] = React.useState(true)
    const [deleted, setDeleted] = React.useState(false)

    const route = useRoute();
      
    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          if (route.name === 'Climber') {
            return true;
          } else {
            return false;
          }
        }

        BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () =>
          BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      }, [route]),)

    const fetchPosts = async() => {
      try {
        const postList = []
        let querySnapshot = await getDocs(collection(db, 'posts'), orderBy('postTime','desc'))
        querySnapshot.forEach(doc => {
          doc.data(orderBy('postTime','desc'))
          const {userId, post, postImg, postTime} = doc.data()
          postList.push({
            id: doc.id,
            userId,
            userName: 'Test Name',
            userImg: 'http://cdn.thinglink.me/api/image/479353026285404161/1024/10/scaletowidth/0/0/1/1/false/true?wait=true',
            postTime: postTime,
            post,
            postImg,
            liked: false,
            likes: null,
            comments : null
          })
        })
        setPosts(postList)

        if (loading) {
          setLoading(false)
        }

      } catch(e) {
        console.log(e)
      }
    }

    React.useEffect(() => {
      fetchPosts()
    },[])

    React.useEffect(() => {
      fetchPosts()
      setDeleted(false)
    },[deleted])

    const handleDelete = (postId) => {
      Alert.alert(
        'Delete post',
        'Are you sure?',
        [
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel'
          },
          {
            text: 'Confirm',
            onPress: () => deletePost(postId),
          },  
        ],
        {cancelable: false}
      )
    }

    const deletePost = async (postId) => {
        const docRef = doc(db, 'posts', postId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists) {
          const {postImg} = docSnap.data()

          if (postImg != null) {
            const imageRef = ref(storage, postImg)
            deleteObject(imageRef).then(() => {
              console.log(`${postImg} has been deleted successfully.`)
              deleteFirestoreData(postId)
            }).catch((e) => {
              console.log(e)
            })
          } else {
            deleteFirestoreData(postId)
          }
        }
    }

    const deleteFirestoreData = async (postId) => {
      await deleteDoc(doc(db, 'posts', postId)).then(() => {
        setDeleted(true)
        Alert.alert('Post Deleted!', 'Your Post has been deleted successfully!')
      }).catch(e => console.log(e))
    }

    return(
      <SafeAreaView style={{flex:1}}>
      {loading ? <ScrollView style={[{flex: 1}]} contentContainerStyle={{alignItems: 'center'}}>
            <SkeletonLoader boneColor='#b6b6b6' highlightColor='#fff'>
                <SkeletonLoader.Container style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <SkeletonLoader.Item style={{width: 60, height: 60, borderRadius: 50}}/>
                    <SkeletonLoader.Item style={{marginLeft: 20}}>
                        <SkeletonLoader.Item style={{width: 120, height: 20, borderRadius: 4}}/>
                        <SkeletonLoader.Item style={{ marginTop: 6, width: 80, height: 20, borderRadius: 4}}/>
                    </SkeletonLoader.Item>
                </SkeletonLoader.Container>
                <SkeletonLoader.Item style={{marginTop: 10, marginBottom: 30}}>
                    <SkeletonLoader.Item style={{width: 300, height: 20, borderRadius: 4}} />
                    <SkeletonLoader.Item style={{marginTop: 6, width: 250, height: 20, borderRadius: 4}} />
                    <SkeletonLoader.Item style={{marginTop: 6, width: 350, height: 200, borderRadius: 4}} />
                </SkeletonLoader.Item>
            </SkeletonLoader>
            <SkeletonLoader boneColor='#b6b6b6' highlightColor='#fff'>
                <SkeletonLoader.Container style={{ flexDirection: 'row', alignItems: 'center'}}>
                    <SkeletonLoader.Item style={{width: 60, height: 60, borderRadius: 50}}/>
                    <SkeletonLoader.Item style={{marginLeft: 20}}>
                        <SkeletonLoader.Item style={{width: 120, height: 20, borderRadius: 4}}/>
                        <SkeletonLoader.Item style={{ marginTop: 6, width: 80, height: 20, borderRadius: 4}}/>
                    </SkeletonLoader.Item>
                </SkeletonLoader.Container>
                <SkeletonLoader.Item style={{marginTop: 10, marginBottom: 30}}>
                    <SkeletonLoader.Item style={{width: 300, height: 20, borderRadius: 4}} />
                    <SkeletonLoader.Item style={{marginTop: 6, width: 250, height: 20, borderRadius: 4}} />
                    <SkeletonLoader.Item style={{marginTop: 6, width: 350, height: 200, borderRadius: 4}} />
                </SkeletonLoader.Item>
            </SkeletonLoader>
        </ScrollView> : 
        
        <Container>
            <FlatList data={posts} renderItem={({item}) => <PostCard item={item} onDelete={handleDelete} onPress={() => navigation.navigate('HomeProfile', {userId: item.userId})}/>} keyExtractor={item=>item.id} showsVerticalScrollIndicator={false}></FlatList>
        </Container>}
      </SafeAreaView>
    )
}