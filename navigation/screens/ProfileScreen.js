import React from 'react'
import { View, SafeAreaView, Text, Image, ScrollView, Alert, RefreshControl } from 'react-native'
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { get, getDatabase, ref, child, update } from 'firebase/database'
import { getFirestore, collection, getDocs, orderBy, getDoc, deleteDoc, doc } from 'firebase/firestore'
import { firebaseConfig } from '../../firebase'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { en, pt } from './../../localizations'
import { globalStyles } from './../../styles/global'
import i18n from 'i18n-js'
import PostCard from '../../components/PostCard'
import AppLoader from '../../components/AppLoader'
import AsyncStorage from "@react-native-async-storage/async-storage"

const ProfileScreen = ({navigation, route}) => {
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)
    const database = getDatabase(app)
    const [posts, setPosts] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [deleted, setDeleted] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const [username, setUsername] = React.useState(null)
    const [theme, setTheme] = React.useState(null)
    const [userPhotoURL, setUserPhotoURL] = React.useState(null)
    const [useraboutme, setUserAboutMe] = React.useState(null)
    const [isloggedInUser, setIsLoggedInUser] = React.useState(false)
    const [postsnumber, setPostsNumber] = React.useState(null)
    const [followers, setFollowers] = React.useState(null)
    const [following, setFollowing] = React.useState(null)
    const [followText, setFollowText] = React.useState(null)
    let [locale, setLocale] = React.useState('en')
    i18n.fallbacks = true
    i18n.translations = {en, pt}
    i18n.locale = locale

    const wait = (timeout) => {
      return new Promise(resolve => setTimeout(resolve, timeout))
    }

    //The onRefresh React Callback function runs whenever the user slides down the ProfileScreen, refreshing the posts
    //It sets a timeout of 2000 and then fetches the posts from the Database(*)
    //(*)More info about the database in ./firebase.js
    const onRefresh = React.useCallback(() => {
      setRefreshing(true)
      wait(2000).then(() => {
        if (route.params) {
          fetchUserInfo()
        } else {
          fetchCurrentUser()
        } 
        setRefreshing(false)
      })
    }, [])

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
      
      //If there's any parameters being passed through navigation to this screen, then this automatically means that the user navigated
      //from the HomeScreen by clicking another user's profile, hence there's a parameter called userId being passed through the route.
      //So, if there is any parameters, then the fetchUserInfo function will run, getting the clicked user's profile information/posts
      //If not, that means the user clicked the profile screen through the bottom navigation drawer, which means they are looking at their
      //own profile so the fetchCurrentUser function is run, getting the current logged in user's information/posts and 
      //the UserPhotoURL setState variable is set by the current logged in user's profile picture.
      if (route.params) {
        fetchUserInfo()
      } else {
        fetchCurrentUser()
        setUserPhotoURL(auth.currentUser.photoURL)
      } 
    },[])

    //This Special React useEffect function runs whenever the useState variable 'deleted' changes
    //In case a user deletes a post, the App will fetch all the posts again, making the deleted post dissapear from the UI.
    React.useEffect(() => {
      if (route.params) {
        fetchUserInfo()
      } else {
        fetchCurrentUser()
        setUserPhotoURL(auth.currentUser.photoURL)
      } 
    },[deleted])

    //The fetchUserInfo function runs whenever the Screen is loaded through the useEffect.
    //This function is very similar to the fetchPosts function inside ./navigation/screens/HomeScreen.js
    //You can refer to that file->Function for better explained info. I will explain whatever is different in this function.
    //Before fetching the posts, it will get all the clicked user's information and load it into the UI through a request to the
    //Database(*). It gets the username, profile picture, bio and followers and following numbers to show in the UI.
    //There's a if statement that checks if the current logged in user is currently following the clicked user, if so,
    //then a useState variable 'followText' is set to 'Following' instead of follow, this dynamically changes if the user
    //presses the follow button.
    //After the user info is set, the same flow of the function fetchPosts inside ./navigation/screens/HomeScreen.js is run
    //with an addition of the number of posts published by the pressed user, showing in the UI afterwards using another setState variable.
    //(*)More info about the database in ./firebase.js
    const fetchUserInfo = async() => {
      try {
        const postList = []
        const fetchedUserId = route.params.userId

        if (fetchedUserId == auth.currentUser.uid) {
          setIsLoggedInUser(true)
        }

        let usernamedb, photoURL, useraboutme, followersnumber, followingnumber = null

        await get(child(ref(database), `users/${fetchedUserId}/`)).then((snapshot) => {
          usernamedb = snapshot.child('username').toJSON()
          photoURL = snapshot.child('photoURL').toJSON()
          followersnumber = snapshot.child('followers').toJSON()
          followingnumber = snapshot.child('following').toJSON()
          useraboutme = snapshot.child('useraboutme').toJSON()

          if (Object.keys(followersnumber).includes(auth.currentUser.uid)) {
            setFollowText('Following')
          } else {
            setFollowText('Follow')
          }

          setFollowers(Object.keys(followersnumber).length)
          setFollowing(Object.keys(followingnumber).length)
          setUsername(usernamedb)
          setUserAboutMe(useraboutme)
          setUserPhotoURL(photoURL)
        }).catch((error) => {
          Alert.alert(i18n.t('error'), error.message)
        })

        let querySnapshot = await getDocs(collection(db, 'posts'), orderBy('postTime','desc'))
        querySnapshot.forEach(doc => {
          const {userId, post, postImg, postTime, likes, comments} = doc.data()
          if (userId == fetchedUserId) {
            postList.push({
              id: doc.id,
              userId,
              userName: usernamedb,
              userImg: photoURL,
              postTime: postTime,
              post,
              postImg,
              liked: false,
              likes: likes,
              comments : comments
            })
          }
        })
        postList.sort(function(x, y) {
          return y.postTime - x.postTime
        })
        setPosts(postList)
        setPostsNumber(postList.length.toString())

        if (loading) {
          setLoading(false)
        }

      } catch (error) {
        Alert.alert(i18n.t('error'), error.message)
      }
    }

    //This function does exactly the same as the above function, but for the current logged in user
    //This is bad practice for programming as I am repeating code, besides what I already repeated,
    //but for some reason when doing tests to the app using one function to handle both use cases was not working.
    //I was wasting a lot of time for a limited time project to finish, so I left this behind. This will get fixed in the future.
    const fetchCurrentUser = async() => {
      setIsLoggedInUser(true)
      try {
        const postList = []
        let usernamedb, photoURL, useraboutme, followersnumber, followingnumber = null

        await get(child(ref(database), `users/${auth.currentUser.uid}/`)).then((snapshot) => {
          usernamedb = snapshot.child('username').toJSON()
          photoURL = snapshot.child('photoURL').toJSON()
          followersnumber = snapshot.child('followers').toJSON()
          followingnumber = snapshot.child('following').toJSON()
          useraboutme = snapshot.child('useraboutme').toJSON()
          setFollowers(Object.keys(followersnumber).length)
          setFollowing(Object.keys(followingnumber).length)
          setUserAboutMe(useraboutme)
          setUsername(usernamedb)
          }).catch((error) => {
            Alert.alert(i18n.t('error'), error.message)
          })

        let querySnapshot = await getDocs(collection(db, 'posts'), orderBy('postTime','desc'))
        querySnapshot.forEach(doc => {
          const {userId, post, postImg, postTime, likes, comments} = doc.data()
          if (userId == auth.currentUser.uid) {
            postList.push({
              id: doc.id,
              userId,
              userName: usernamedb,
              userImg: photoURL,
              postTime: postTime,
              post,
              postImg,
              liked: false,
              likes: likes,
              comments : comments
            })
          }
        })
        postList.sort(function(x, y) {
          return y.postTime - x.postTime
        })
        setPosts(postList)
        setPostsNumber(postList.length.toString())
        setUserPhotoURL(auth.currentUser.photoURL)

        if (loading) {
          setLoading(false)
        }

      } catch(error) {
        Alert.alert(i18n.t('error'), error.message)
      }
    }

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
    //Then, it gets the current post to double check if it still exists, there's a chance that slower devices can call this function to be run
    //whenever a post has already been deleted. So I'm checking if that post still exists.
    //If so, I use the deleteObject function from the Database(*), deleting the image from the post if it exists.
    //The post is then deleted by running the deleteFirestoreData function.
    //If any error is thrown, it is handled by an Alert.
    //(*)More info about the database in ./firebase.js
    const deletePost = async (postId) => {
      const docRef = doc(db, 'posts', postId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists) {
        const {postImg} = docSnap.data()

        if (postImg != null) {
          const imageRef = ref(storage, postImg)
          deleteObject(imageRef).then(() => {
            deleteFirestoreData(postId)
          }).catch((error) => {
            Alert.alert(i18n.t('error'), error)
          })
        } else {
          deleteFirestoreData(postId)
        }
      }
  }

  //The deleteFirestoreData function is run whenever the user is about to delete the post.
  //It gets the Post ID as an argument from the above function and uses the deleteDoc function from my Database(*), deleting the post
  //If any error is thrown, it will be handled by an alert.
  //(*)More info about the database in ./firebase.js
  const deleteFirestoreData = async (postId) => {
    await deleteDoc(doc(db, 'posts', postId)).then(() => {
      setDeleted(true)
      Alert.alert(i18n.t('postDeleted'), i18n.t('postDeletedMessage'))
    }).catch(error => Alert.alert(i18n.t('error'), error.message))
  }

  //The handleSignOut function will set a small Loading from AppLoader (./components/AppLoader.js)
  //It will then Sign out the user and navigate them to the Login Screen.
  //If any error is thrown, it will be handled by an alert.
  const handleSignOut = async () => {
      setLoading(true)
      await auth.signOut().then(() => {
        navigation.navigate('Login')
      }).catch(error => Alert.alert(i18n.t('error'), error.message))
  }

  //The followUser function is run whenever the user clicks the Follow button in the UI
  //For better understanding let's call:
  //user1: the current logged in user;
  //user2: the selected user.
  //It gets the user2's User ID and navigates to their directory in the Database(*)
  //Then, it fetches all the necessary info for user2 in order to set them as follower/following
  //An if statement is run to check if user2 is already in the following list of user1
  //If user2 is already followed, that means the user pretends to unfollow, so the Database removes user2's
  //id from user1's following list. It also removes user1 from user2's follower list.
  //If user2 is not already followed, that means the user pretends to follow, so the Database adds user2's
  //id to user1's following list. It also adds user1 to the user2's follower list.
  //Refer to firebase.js for better understanding on how the Database is set up.
  //Everytime this event happens, the text is dynamically changed from 'Follow' to 'Following' and vice versa
  //using the followText setState Variable.
  //(*)More info about the database in ./firebase.js
  const followUser = async () => {
    const fetchedUserId = route.params.userId
    let fetchedUsername, fetchedUserProfilePic, fetchedfollowers = null
    await get(child(ref(database), `users/${fetchedUserId}/`)).then((snapshot) => {
      fetchedUsername = snapshot.child('username').toJSON()
      fetchedUserProfilePic = snapshot.child('photoURL').toJSON()
      fetchedfollowers = snapshot.child('followers').toJSON()

      if (Object.keys(fetchedfollowers).includes(auth.currentUser.uid)) {
        updateDatabase(auth.currentUser.uid, 'following', {
          username: null,
          photoURL: null
        }, fetchedUserId)

        updateDatabase(fetchedUserId, 'followers', {
          username: null,
          photoURL: null   
        }, auth.currentUser.uid)
          setFollowText('Follow')
      } else {
        updateDatabase(auth.currentUser.uid, 'following', {
            username: fetchedUsername,
            photoURL: fetchedUserProfilePic
        }, fetchedUserId)

        updateDatabase(fetchedUserId, 'followers', {
          username: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL   
        }, auth.currentUser.uid)
          setFollowText('Following')
      }
    })
  }

  //The updateDatabse function is run whenever the code needs to do any update in the Database(*).
  //This function is currently only used to update the user's followers/following list
  //It gets the path of both user1 and user2 using their Id and updates their following/follower list.
  //(*)More info about the database in ./firebase.js
  const updateDatabase = async (fromUser, path, info, toUser) => {
    const data = info
    const updates = {}
    updates['/users/' + fromUser + `/${path}/` + toUser] = data
    update(ref(database), updates)
  }

  //This UI's styles are located in a global styles file (./styles/global.js)
  //This UI includes an AppLoader that I created (Refer to ./components/AppLoader.js for more info).
  //This UI is being handled by the DarkTheme (Refer to ./navigation/screens/LoginScreen.js for more info)
  return (
    <SafeAreaView style={{flex:1}}>
      {loading ? <AppLoader/> : null}
      <ScrollView style={theme == 'light' ? [globalStyles.containerProfile, {backgroundColor: '#fff'}] : [globalStyles.containerProfile, {backgroundColor: '#000'}]} contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}} showsVerticalScrollIndicator={false} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>

        <Image style={globalStyles.userImg} source={userPhotoURL != null ? {uri: userPhotoURL} : require('../../assets/users/question-mark.png')}/>
        <Text style={theme == 'light' ? [globalStyles.userName, {color: '#000'}] : [globalStyles.userName, {color: '#fff'}]}>{username}</Text>
        <Text style={globalStyles.aboutUser}>{useraboutme == 'Go to the Edit Profile Page to change this text :)' ? (i18n.t('aboutmeDefault')) : useraboutme }</Text>

        <View style={globalStyles.userBtnWrapper}>
          {!isloggedInUser ? (
            <>
              <TouchableOpacity style={globalStyles.userBtn} onPress={() => {}}>
                <Text style={globalStyles.userBtnTxt}>{i18n.t('message')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={globalStyles.userBtn} onPress={followUser}>
                <Text style={globalStyles.userBtnTxt}>{followText == 'Follow' ? i18n.t('followButtonText') : i18n.t('followingButtonText')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={globalStyles.userBtn} onPress={() => {navigation.navigate('EditProfile')}}>
                <Text style={globalStyles.userBtnTxt}>{i18n.t('edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={globalStyles.userBtn} onPress={handleSignOut}>
                <Text style={globalStyles.userBtnTxt}>{i18n.t('logout')}</Text>
              </TouchableOpacity>
            </>
          ) }
          
        </View>

        <View style={globalStyles.userInfoWrapper}>
          <View style={globalStyles.userInfoItem}>
            <Text style={theme == 'light' ? globalStyles.userInfoTitle : [globalStyles.userInfoTitle, {color: '#fff'}]}>{postsnumber}</Text>
            <Text style={globalStyles.userInfoSubTitle}>{i18n.t('posts')}</Text>
          </View>

          <View style={globalStyles.userInfoItem}>
            <Text style={theme == 'light' ? globalStyles.userInfoTitle : [globalStyles.userInfoTitle, {color: '#fff'}]}>{followers - 1}</Text>
            <Text style={globalStyles.userInfoSubTitle}>{i18n.t('followers')}</Text>
          </View>

          <View style={globalStyles.userInfoItem}>
            <Text style={theme == 'light' ? globalStyles.userInfoTitle : [globalStyles.userInfoTitle, {color: '#fff'}]}>{following - 1}</Text>
            <Text style={globalStyles.userInfoSubTitle}>{i18n.t('following')}</Text>
          </View>
        </View>

        {posts.map((item) => (
          <PostCard key={item.id} item={item} onDelete={handleDelete}/>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen