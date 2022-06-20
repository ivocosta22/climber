import React from 'react'
import { View, SafeAreaView, StyleSheet, Text, Image, ScrollView, Alert, RefreshControl } from 'react-native'
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, orderBy, getDoc, deleteDoc, doc, where } from 'firebase/firestore'
import { firebaseConfig } from '../../firebase'
import { TouchableOpacity } from 'react-native-gesture-handler'
import PostCard from '../../components/PostCard'


const ProfileScreen = ({navigation, route}) => {
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)
    const [posts, setPosts] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [deleted, setDeleted] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)

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

    const fetchPosts = async() => {
      try {
        const postList = []
        let querySnapshot = await getDocs(collection(db, 'posts'), where('userId', '==', `${auth.currentUser.uid}`), orderBy('postTime', 'desc'))
        querySnapshot.forEach(doc => {
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
        postList.sort(function(x, y) {
          return y.postTime - x.postTime
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
            //console.log(`${postImg} has been deleted successfully.`)
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

  const handleSignOut = async () => {
      await auth.signOut().then(() => {
        navigation.navigate('Login')
      }).catch(error => alert(error.message))
  }

  return (
    <SafeAreaView style={{flex:1, backgroundColor: '#fff'}}>
      <ScrollView style={styles.container} contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}} showsVerticalScrollIndicator={false} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>

        <Image style={styles.userImg} source={require('../../assets/users/user1.png')}/>
        <Text style={styles.userName}>Jenny Doe</Text>
        <Text>{route.params ? route.params.userId : auth.currentUser.uid}</Text>
        <Text style={styles.aboutUser}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris a elit nisl.</Text>

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
            <Text style={styles.userInfoTitle}>5</Text>
            <Text style={styles.userInfoSubTitle}>Posts</Text>
          </View>

          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>100</Text>
            <Text style={styles.userInfoSubTitle}>Followers</Text>
          </View>

          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>100</Text>
            <Text style={styles.userInfoSubTitle}>Following</Text>
          </View>

          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>100</Text>
            <Text style={styles.userInfoSubTitle}>Games</Text>
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