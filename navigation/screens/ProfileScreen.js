import React from 'react'
import { View, SafeAreaView, StyleSheet, Text, Image, ScrollView, Alert, RefreshControl } from 'react-native'
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { get, getDatabase, ref, child, update } from 'firebase/database'
import { getFirestore, collection, getDocs, orderBy, getDoc, deleteDoc, doc } from 'firebase/firestore'
import { firebaseConfig } from '../../firebase'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { en, pt } from './../../localizations'
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
      
      if (route.params) {
        fetchUserInfo()
      } else {
        fetchCurrentUser()
        setUserPhotoURL(auth.currentUser.photoURL)
      } 
    },[])

    React.useEffect(() => {
      if (route.params) {
        fetchUserInfo()
      } else {
        fetchCurrentUser()
        setUserPhotoURL(auth.currentUser.photoURL)
      } 
    },[deleted])

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

  const deleteFirestoreData = async (postId) => {
    await deleteDoc(doc(db, 'posts', postId)).then(() => {
      setDeleted(true)
      Alert.alert(i18n.t('postDeleted'), i18n.t('postDeletedMessage'))
    }).catch(error => Alert.alert(i18n.t('error'), error.message))
  }

  const handleSignOut = async () => {
      setLoading(true)
      await auth.signOut().then(() => {
        navigation.navigate('Login')
      }).catch(error => Alert.alert(i18n.t('error'), error.message))
  }

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

  const updateDatabase = async (fromUser, path, info, toUser) => {
    const data = info
    const updates = {}
    updates['/users/' + fromUser + `/${path}/` + toUser] = data
    update(ref(database), updates)
  }

  return (
    <SafeAreaView style={{flex:1}}>
      {loading ? <AppLoader/> : null}
      <ScrollView style={theme == 'light' ? styles.container : styles.containerDark} contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}} showsVerticalScrollIndicator={false} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>

        <Image style={styles.userImg} source={userPhotoURL != null ? {uri: userPhotoURL} : require('../../assets/users/question-mark.png')}/>
        <Text style={theme == 'light' ? styles.userName : styles.userNameDark}>{username}</Text>
        <Text style={styles.aboutUser}>{useraboutme == 'Go to the Edit Profile Page to change this text :)' ? (i18n.t('aboutmeDefault')) : useraboutme }</Text>

        <View style={styles.userBtnWrapper}>
          {!isloggedInUser ? (
            <>
              <TouchableOpacity style={styles.userBtn} onPress={() => {}}>
                <Text style={styles.userBtnTxt}>{i18n.t('message')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.userBtn} onPress={followUser}>
                <Text style={styles.userBtnTxt}>{followText == 'Follow' ? i18n.t('followButtonText') : i18n.t('followingButtonText')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.userBtn} onPress={() => {navigation.navigate('EditProfile')}}>
                <Text style={styles.userBtnTxt}>{i18n.t('edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.userBtn} onPress={handleSignOut}>
                <Text style={styles.userBtnTxt}>{i18n.t('logout')}</Text>
              </TouchableOpacity>
            </>
          ) }
          
        </View>

        <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
            <Text style={theme == 'light' ? styles.userInfoTitle : styles.userInfoTitleDark}>{postsnumber}</Text>
            <Text style={styles.userInfoSubTitle}>{i18n.t('posts')}</Text>
          </View>

          <View style={styles.userInfoItem}>
            <Text style={theme == 'light' ? styles.userInfoTitle : styles.userInfoTitleDark}>{followers - 1}</Text>
            <Text style={styles.userInfoSubTitle}>{i18n.t('followers')}</Text>
          </View>

          <View style={styles.userInfoItem}>
            <Text style={theme == 'light' ? styles.userInfoTitle : styles.userInfoTitleDark}>{following - 1}</Text>
            <Text style={styles.userInfoSubTitle}>{i18n.t('following')}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#000',
  },
  userNameDark: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#fff',
  },
  aboutUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  userBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  userBtn: {
    borderColor: '#0782F9',
    borderWidth: 2,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  userBtnTxt: {
    color: '#0782F9',
  },
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  userInfoItem: {
    justifyContent: 'center',
  },
  userInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  userInfoTitleDark: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#fff'
  },
  userInfoSubTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
})