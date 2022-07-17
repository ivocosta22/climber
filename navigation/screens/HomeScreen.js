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
  //TODO: Shorten code by putting Database functions inside a file, get rid of repeating functions.
  //TODO: Add ability to click on user's followers and show list of followers
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

    //The function wait uses a  Javascript timeout function for better User experience inside the function onRefresh
    const wait = (timeout) => {
      return new Promise(resolve => setTimeout(resolve, timeout))
    }

    //The onRefresh React Callback function runs whenever the user slides down the Homescreen, refreshing the posts
    //It sets a timeout of 2000 and then fetches the posts from the Database(*)
    //(*)More info about the database in ./firebase.js
    const onRefresh = React.useCallback(() => {
      setRefreshing(true)
      wait(2000).then(() => {
        fetchPosts()
        setRefreshing(false)
      })
    }, [])

    //This useCallback function will check if the current screen is the home screen, if so, the Hardware back handler is disabled,
    //preventing the user from returning to the login screen without logging out.
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
   
    //The function fetchPosts is the main function in this screen. SO there's a lot of explaining here to do:
    //First and most importantly, a try/catch statement. Very important here because I'm mostly running lots and lots of Database(*) requests.
    //Any error along this function will be thrown as an Alert with the error.
    //OK so now, I create 2 lists, a postList and a likesList. I will explain what they do below.
    //A reference to the database is created and all the user's liked posts are fetched from the database.
    //This is done in order to apply any liked posts the user has liked in the past.
    //After that request is done, the likesList should now have every liked post ID the user liked.
    //Secondly, another Database request is done, where it's getting all the posts from a different "section" of my Database, where only the posts are saved.
    //A forEach statement is then run, and inside it, every parameter of the post fetched is saved onto variables individually.
    //Now, FOR EACH POST, a Database request is done to get the username and profile picture of the owner of each post.
    //It will then check if the current logged in user has liked each post
    //Afterwards, the post will be pushed to the postList array variable with all it's respective parameters.
    //After all the posts are pushed, they are organized by the time they were posted, so that the newest ones show first.
    //The setPosts React useState Variable comes in, getting set by the postList, and then, the posts are shown in the App.
    //After the posts are being shown, the AppLoader that was previously being shown, dissapears (./components/AppLoader.js)
    //(*)More info about the database in ./firebase.js
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

    //This file is using React's useEffect, which means that everything inside this function will be ran as soon as this file loads.
    //Inside this useEffect I will get the current setting in AsyncStorage for the value of isDarkMode (Which defines if the user is in Dark Mode or not).
    //AsyncStorage will also get the currentLanguage value to check what language the user has saved (Refer to ./navigation/screens/LoginScreen.js for more info).
    //Everytime this screen is run, the fetchPosts function will be run, getting all the posts from the Database(*)
    //(*)More info about the database in ./firebase.js
    //The AppLoader also comes into effect, loading while no posts are shown. (./components/AppLoader.js)
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

    //This Special React useEffect function runs whenever the useState variable 'deleted' changes
    //In case a user deletes a post, the App will fetch all the posts again, making the deleted post dissapear from the UI.
    React.useEffect(() => {
      fetchPosts()
      setDeleted(false)
    },[deleted])

    //The handleDelete function is run whenever the user clicks on the Trashbin icon inside a post
    //Check ./components/PostCard.js for better understanding on how the onPress is handled.
    //An alert is thrown, asking the user if they're sure they want to delete the post.
    //If the user presses cancel, nothing happens, the alert dissappears.
    //If the user presses confirm however, the deletePost function is run,
    //passing the argument of the post ID, provided to this function by the PostCard.js file.
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

    //The function deletePost is run after the user presses confirm on the handleDelete function
    //It sets the setDeleting React useState variable to true in order for the posts to be updated after the deletion is completed
    //Then, it gets the current post to double check if it still exists, there's a chance that slower devices can call this function to be run
    //whenever a post has already been deleted. So I'm checking if that post still exists.
    //If so, I use the deleteObject function from the Database(*), deleting the image from the post if it exists.
    //The post is then deleted by running the deleteFirestoreData function.
    //If any error is thrown, it is handled by an Alert.
    //(*)More info about the database in ./firebase.js
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

    //The deleteFirestoreData function is run whenever the user is about to delete the post.
    //It gets the Post ID as an argument from the above function and uses the deleteDoc function from my Database(*), deleting the post
    //If any error is thrown, it will be handled by an alert.
    //(*)More info about the database in ./firebase.js
    const deleteFirestoreData = async (postId) => {
      await deleteDoc(doc(db, 'posts', postId)).then(() => {
        Alert.alert(i18n.t('postDeleted'), i18n.t('postDeletedMessage'))
        setDeleting(false)
      }).catch(error => {
        setDeleting(false)
        Alert.alert(i18n.t('error'), error.message)
      })
    }

    //The handleLike function is run whenever the user presses the like button.
    //It gets the post that was clicked to double check if it exists. 
    //There's a small chance it could have been deleted between the process of liking.
    //If it wasn't however, then the post gets updated using a Database(*) function
    //Then a React setState variable is set to turn the Liked Icon blue, indicating the user liked the post.
    //If the post was already liked, it will remove the like, doing the same update on the Database, but removing the like.
    //If any error is thrown, it will be handled by an alert.
    //(*)More info about the database in ./firebase.js
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

    //The databaseUpdate function is run whenever the code needs to do any update in the Database(*).
    //This function is currently only used to update the post Likes
    //It gets the path of the user and Id of the post and updates their info saying that the current logged in user is liking/not liking the post
    //(*)More info about the database in ./firebase.js
    const databaseUpdate = async (path, id) => {
      const ref = Database.ref(database, '/users/' + auth.currentUser.uid + `/${path}/`)
      const push = Database.push(ref)
      Database.set(push, id)
    }

    //The databaseRemove function is run whenever the code needs to do any removal in the Database.
    //This function is currently only used to update the post Likes
    //It gets the path of the user and Id of the post and updates their info saying that the current logged in user is liking/not liking the post
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

    //This UI is being handled by the DarkTheme (Refer to ./navigation/screens/LoginScreen.js for more info)
    //This UI includes an AppLoader that I created (Refer to ./components/AppLoader.js for more info).
    //This UI is being handled by 'styled'. A library that I imported so that I could use css in some styles of my UI (Refer to ./styles/info.md)
    //There's something special inside the UI here, the Skeleton Loader.
    //If you test the App and look closely when you check the HomeScreen/ProfileScreen, it briefly shows an empty skeleton UI while it loads the posts
    //This is very good for user experience, instead of just having an empty View.
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