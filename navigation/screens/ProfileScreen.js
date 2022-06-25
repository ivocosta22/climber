import React from 'react'
import { View, SafeAreaView, StyleSheet, Text, Image, ScrollView, Alert, RefreshControl } from 'react-native'
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { get, getDatabase, ref, child, update } from 'firebase/database'
import { getFirestore, collection, getDocs, orderBy, getDoc, deleteDoc, doc } from 'firebase/firestore'
import { firebaseConfig } from '../../firebase'
import { TouchableOpacity } from 'react-native-gesture-handler'
import PostCard from '../../components/PostCard'
import AppLoader from '../../components/AppLoader'

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
    const [userPhotoURL, setUserPhotoURL] = React.useState(null)
    const [useraboutme, setUserAboutMe] = React.useState(null)
    const [isloggedInUser, setIsLoggedInUser] = React.useState(false)
    const [postsnumber, setPostsNumber] = React.useState(null)
    const [followers, setFollowers] = React.useState(null)
    const [following, setFollowing] = React.useState(null)
    const [followText, setFollowText] = React.useState(null)

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
          Alert.alert('Error!', error.message)
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
        Alert.alert('Error!', error.message)
      }
    }

    const fetchCurrentUser = async() => {
      setIsLoggedInUser(true)
      try {
        //TODO: ability for users to follow, and comments for posts
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
            Alert.alert('Error!', error.message)
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
        Alert.alert('Error!', error.message)
      }
    }

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
            deleteFirestoreData(postId)
          }).catch((error) => {
            Alert.alert("Error!", error)
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
    }).catch(error => Alert.alert('Error!', error.message))
  }

  const handleSignOut = async () => {
      setLoading(true)
      await auth.signOut().then(() => {
        navigation.navigate('Login')
      }).catch(error => Alert.alert('Error!', error.message))
  }

  const followUser = async () => {
    const fetchedUserId = route.params.userId
    let fetchedUsername, fetchedUserProfilePic = null
    await get(child(ref(database), `users/${fetchedUserId}/`)).then((snapshot) => {
      fetchedUsername = snapshot.child('username').toJSON()
      fetchedUserProfilePic = snapshot.child('photoURL').toJSON()

      updateDatabase(auth.currentUser.uid, 'following', {
          username: fetchedUsername,
          photoURL: fetchedUserProfilePic
      }, fetchedUserId)

      updateDatabase(fetchedUserId, 'followers', {
          username: auth.currentUser.displayName,
          photoURL: auth.currentUser.photoURL   
      }, auth.currentUser.uid)
    })
    setFollowText('Following')
  }

  const updateDatabase = async (fromUser, path, info, toUser) => {
    const data = info
    const updates = {}
    updates['/users/' + fromUser + `/${path}/` + toUser] = data
    update(ref(database), updates)
  }

  return (
    <SafeAreaView style={{flex:1, backgroundColor: '#fff'}}>
      {loading ? <AppLoader/> : null}
      <ScrollView style={styles.container} contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}} showsVerticalScrollIndicator={false} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>

        <Image style={styles.userImg} source={userPhotoURL != null ? {uri: userPhotoURL} : require('../../assets/users/question-mark.png')}/>
        <Text style={styles.userName}>{username}</Text>
        <Text style={styles.aboutUser}>{useraboutme == null ? 'Go to the Edit Profile Page to change this text :)' : useraboutme }</Text>

        <View style={styles.userBtnWrapper}>
          {!isloggedInUser ? (
            <>
              <TouchableOpacity style={styles.userBtn} onPress={() => {}}>
                <Text style={styles.userBtnTxt}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.userBtn} onPress={followUser}>
                <Text style={styles.userBtnTxt}>{followText}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.userBtn} onPress={() => {navigation.navigate('EditProfile')}}>
                <Text style={styles.userBtnTxt}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.userBtn} onPress={handleSignOut}>
                <Text style={styles.userBtnTxt}>Logout</Text>
              </TouchableOpacity>
            </>
          ) }
          
        </View>

        <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>{postsnumber}</Text>
            <Text style={styles.userInfoSubTitle}>Posts</Text>
          </View>

          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>{followers - 1}</Text>
            <Text style={styles.userInfoSubTitle}>Followers</Text>
          </View>

          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>{following - 1}</Text>
            <Text style={styles.userInfoSubTitle}>Following</Text>
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
  userInfoSubTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
})