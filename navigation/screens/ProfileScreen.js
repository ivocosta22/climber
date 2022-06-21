import React from 'react'
import { View, SafeAreaView, StyleSheet, Text, Image, ScrollView, Alert, RefreshControl } from 'react-native'
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { get, getDatabase, ref, child } from 'firebase/database'
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
    const [userPhotoURL, setUserPhotoURL] = React.useState(null)
    const [useraboutme, setUserAboutMe] = React.useState(null)
    const [postsnumber, setPostsNumber] = React.useState(null)
    const [followers, setFollowers] = React.useState(null)
    const [following, setFollowing] = React.useState(null)

    const wait = (timeout) => {
      return new Promise(resolve => setTimeout(resolve, timeout))
    }

    const onRefresh = React.useCallback(() => {
      setRefreshing(true)
      wait(2000).then(() => {
        fetchPosts()
        getuserInfo()
        setUserPhotoURL(auth.currentUser.photoURL)
        setRefreshing(false)
      })
    }, [])

    const getuserInfo = async () => {
        get(child(ref(database), `users/${auth.currentUser.uid}/`)).then((snapshot) => {
          if (snapshot.exists()) {
            setUserAboutMe(snapshot.child('useraboutme').toJSON())
          } else {
            console.log("No data available")
          }
        }).catch((error) => {
          console.error(error)
        });
    }

    const fetchPosts = async() => {
      try {
        //TODO: ability for users to follow, make likes and comments for posts
        const postList = []
        let username, photoURL,followersnumber,followingnumber = null

        get(child(ref(database), `users/${auth.currentUser.uid}/`)).then((snapshot) => {
          username = snapshot.child('username').toJSON()
          photoURL = snapshot.child('photoURL').toJSON()
          followersnumber = snapshot.child('followers').toJSON()
          followingnumber = snapshot.child('following').toJSON()
          setFollowers(Object.keys(followersnumber).length)
          setFollowing(Object.keys(followingnumber).length)
          }).catch((error) => {
            console.error(error)
          });

        let querySnapshot = await getDocs(collection(db, 'posts'), orderBy('postTime','desc'))
        querySnapshot.forEach(doc => {
          const {userId, post, postImg, postTime, likes, comments} = doc.data()
          if (userId == auth.currentUser.uid) {
            postList.push({
              id: doc.id,
              userId,
              userName: username,
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

      } catch(error) {
        Alert.alert('Error!', error.message)
      }
    }

    React.useEffect(() => {
      setUserPhotoURL(auth.currentUser.photoURL)
      fetchPosts()
      getuserInfo()
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
    }).catch(error => Alert.alert('Error!', error.message))
  }

  const handleSignOut = async () => {
      setLoading(true)
      await auth.signOut().then(() => {
        navigation.navigate('Login')
      }).catch(error => Alert.alert('Error!', error.message))
  }

  return (
    <SafeAreaView style={{flex:1, backgroundColor: '#fff'}}>
      {loading ? <AppLoader/> : null}
      <ScrollView style={styles.container} contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}} showsVerticalScrollIndicator={false} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>

        <Image style={styles.userImg} source={userPhotoURL != null ? {uri: userPhotoURL} : require('../../assets/users/question-mark.png')}/>
        <Text style={styles.userName}>{auth.currentUser.displayName}</Text>
        <Text style={styles.aboutUser}>{useraboutme == null ? 'Go to the Edit Profile Page to change this text :)' : useraboutme }</Text>

        <View style={styles.userBtnWrapper}>
          {route.params ? (
            <>
              <TouchableOpacity style={styles.userBtn} onPress={() => {}}>
                <Text style={styles.userBtnTxt}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.userBtn} onPress={() => {}}>
                <Text style={styles.userBtnTxt}>Follow</Text>
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