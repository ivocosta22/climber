import React from 'react'
import { FlatList, Alert, SafeAreaView, ScrollView, BackHandler, RefreshControl } from 'react-native'
import { useRoute, useFocusEffect } from '@react-navigation/native'
import { Container, ContainerDark } from '../../styles/FeedStyles'
import { firebaseConfig } from '../../firebase'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, orderBy, getDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { deleteObject, getStorage, ref } from 'firebase/storage'
import { getAuth } from 'firebase/auth'
import { en, pt } from './../../localizations'
import * as Database from 'firebase/database'
import SkeletonLoader from 'expo-skeleton-loader'
import PostCard from '../../components/PostCard'
import AppLoader from '../../components/AppLoader'
import AsyncStorage from "@react-native-async-storage/async-storage"
import i18n from 'i18n-js'


export default function HomeScreen({navigation}) {
  //TODO: Check onboarding screen translation and test it. I saw an error
  //TODO: Test APP for bugs, do Report, Prepare PowerPoint, do test presentation
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    const storage = getStorage(app)
    const database = Database.getDatabase(app)
    const auth = getAuth(app)
    const [posts, setPosts] = React.useState(null)
    const [theme, setTheme] = React.useState(null)
    const [loading, setLoading] = React.useState(true)
    const [deleting, setDeleting] = React.useState(false)
    const [deleted, setDeleted] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const [postLiked, setPostLiked] = React.useState([{liked: false, id: '0'}])
    let [locale, setLocale] = React.useState('en')
    i18n.fallbacks = true
    i18n.translations = {en, pt}
    i18n.locale = locale

    const wait = (timeout) => {
      return new Promise(resolve => setTimeout(resolve, timeout))
    }

    const onRefresh = React.useCallback(() => {
      setRefreshing(true)
      wait(2000).then(() => {
        fetchPosts()
        setRefreshing(false)
      })
    }, [])

    const route = useRoute()
    useFocusEffect(
      React.useCallback(() => {
        const onBackPress = () => {
          if (route.name === 'Climber') {
            return true
          } else {
            return false
          }
        }

        BackHandler.addEventListener('hardwareBackPress', onBackPress)
        return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress)
      }, [route]),)
      
    const fetchPosts = async() => {
      try {
        const postList = []
        const databaseLikesRef = Database.ref(database, '/users/' + auth.currentUser.uid + `/likedPosts/`)
        const likesList = []
        
        let likessnapshot = await Database.get(databaseLikesRef)
        likessnapshot.forEach(likedPost => {
          likesList.push(likedPost)
        })

        let isPostLiked
        let querySnapshot = await getDocs(collection(db, 'posts'), orderBy('postTime','desc'))
        querySnapshot.forEach(doc => {
          const {userId, post, postImg, postTime, likes, comments} = doc.data()
          Database.get(Database.child(Database.ref(database), `users/${userId}/`)).then((snapshot) => {
            let username = snapshot.child('username').toJSON()
            let photoURL = snapshot.child('photoURL').toJSON()
            if (JSON.stringify(likesList).includes(doc.id)) {
              isPostLiked = true
            } else {
              isPostLiked = false
            }
            postList.push({
              id: doc.id,
              userId,
              userName: username,
              userImg: photoURL,
              postTime: postTime,
              post,
              postImg,
              liked: isPostLiked,
              likes: likes,
              comments : comments
            })
            postList.sort(function(x, y) {
              return y.postTime - x.postTime
            })
            setPosts(postList)
            setLoading(false)
          }) 
        }) 
      } catch(error) {
        setLoading(false)
        Alert.alert(i18n.t('error'), error.message)
      }
    }

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


      setLoading(true)
      fetchPosts()
    },[])

    React.useEffect(() => {
      fetchPosts()
      setDeleted(false)
    },[deleted])

    const handleDelete = (postId) => {
      Alert.alert(
        i18n.t('deletePost'),
        i18n.t('areYouSure'),
        [
          {
            text: i18n.t('cancel'),
            onPress: () => {},
            style: 'cancel'
          },
          {
            text: i18n.t('confirm'),
            onPress: () => deletePost(postId),
          },  
        ],
        {cancelable: false}
      )
    }

    const deletePost = async (postId) => {
        setDeleting(true)
        const docRef = doc(db, 'posts', postId)
        const docSnap = await getDoc(docRef).catch((error) => {
          setDeleting(false)
          Alert.alert(i18n.t('error'), error.message)
        })

        if (docSnap.exists) {
          const {postImg} = docSnap.data()
          if (postImg != null) {
            const imageRef = ref(storage, postImg)
            deleteObject(imageRef).then(() => {
              deleteFirestoreData(postId)
            }).catch((error) => {
              setDeleting(false)
              Alert.alert(i18n.t('error'), error.message)
            })
          } else {
            deleteFirestoreData(postId)
          }
        } else {
          setDeleting(false)
          Alert.alert(i18n.t('error'), i18n.t('deletedPostAlready'))
        }
    }

    const deleteFirestoreData = async (postId) => {
      await deleteDoc(doc(db, 'posts', postId)).then(() => {
        Alert.alert(i18n.t('postDeleted'), i18n.t('postDeletedMessage'))
        setDeleting(false)
      }).catch(error => {
        setDeleting(false)
        Alert.alert(i18n.t('error'), error.message)
      })
    }

    const handleLike = async (postId) => {
      const docRef = doc(db, 'posts', postId)
      const docSnap = await getDoc(docRef).catch((error) => {
        Alert.alert(i18n.t('error'), error.message)
      })

      if (docSnap.exists) {
        const {likes} = docSnap.data()

        posts.forEach((post) => {
          if (post.id == postId) {
            const databasepostid = post.id

            if (!post.liked) {
              updateDoc(docRef, {likes: likes + 1}).then(() => {
                post.liked = true
                databaseUpdate('likedPosts', databasepostid)
                setPostLiked(postLiked => [...postLiked, {liked: true, id: post.id}])
              }).catch((error) => {
                Alert.alert(i18n.t('error'), error.message)
              })
            } else if (post.liked) {
              updateDoc(docRef, {likes: likes - 1}).then(() => {
                post.liked = false
                databaseRemove('likedPosts', databasepostid)
                setPostLiked(postLiked => postLiked.filter(postlike => {
                  return postlike.id == databasepostid
                }))
              }).catch((error) => {
                Alert.alert(i18n.t('error'), error.message)
              })
            }
          }
        })
      }
    }

    const databaseUpdate = async (path, id) => {
      const ref = Database.ref(database, '/users/' + auth.currentUser.uid + `/${path}/`)
      const push = Database.push(ref)
      Database.set(push, id)
    }

    const databaseRemove = async (path, id) => {
      const ref = Database.ref(database, `users/${auth.currentUser.uid}/${path}/`)
      await Database.get(Database.child(Database.ref(database), `users/${auth.currentUser.uid}/${path}/`)).then((snapshot) => {
        snapshot.forEach(child => {
          if (JSON.stringify(child).includes(id)) {
            Database.remove(child.ref)
          }
        })
      })
    }

    return(
      <SafeAreaView style={theme == 'light' ? {flex:1} : {flex:1, backgroundColor:'black'}}>
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
        </ScrollView> : deleting ? 
        <>
        <AppLoader/>
        {theme == 'light' ? 
        <Container>
            <FlatList data={posts} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>} renderItem={({item}) => <PostCard item={item} onDelete={handleDelete} onLike={handleLike} onComment={() => navigation.navigate('Comments', {userId: item.userId})} onPress={() => navigation.navigate('HomeProfile', {userId: item.userId})}/>} keyExtractor={item=>item.id} showsVerticalScrollIndicator={false}></FlatList>
        </Container> :

        <ContainerDark>
            <FlatList data={posts} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>} renderItem={({item}) => <PostCard item={item} onDelete={handleDelete} onLike={handleLike} onComment={() => navigation.navigate('Comments', {userId: item.userId})} onPress={() => navigation.navigate('HomeProfile', {userId: item.userId})}/>} keyExtractor={item=>item.id} showsVerticalScrollIndicator={false}></FlatList>
        </ContainerDark>
        }
        </> :
        <>
        {theme == 'light' ?
        <Container>
            <FlatList data={posts} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>} renderItem={({item}) => <PostCard item={item} onDelete={handleDelete} onLike={handleLike} onComment={() => navigation.navigate('Comments', {userId: item.userId})} onPress={() => navigation.navigate('HomeProfile', {userId: item.userId})}/>} keyExtractor={item=>item.id} showsVerticalScrollIndicator={false}></FlatList>
        </Container> :

        <ContainerDark>
            <FlatList data={posts} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>} renderItem={({item}) => <PostCard item={item} onDelete={handleDelete} onLike={handleLike} onComment={() => navigation.navigate('Comments', {userId: item.userId})} onPress={() => navigation.navigate('HomeProfile', {userId: item.userId})}/>} keyExtractor={item=>item.id} showsVerticalScrollIndicator={false}></FlatList>
        </ContainerDark>
        }
        </>
      }
      </SafeAreaView>
    )
}