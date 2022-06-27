import * as React from 'react'
import { View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { en, pt } from './../localizations'
import Ionicons from 'react-native-vector-icons/Ionicons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import i18n from 'i18n-js'
import HomeScreen from './screens/HomeScreen'
import CommentsScreen from './screens/CommentsScreen'
import ChatScreen from './screens/ChatScreen'
import MessagesScreen from './screens/MessagesScreen'
import AddPostScreen from './screens/AddPostScreen'
import ProfileScreen from './screens/ProfileScreen'
import EditProfileScreen from './screens/EditProfileScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const FeedStack = ({navigation}) => (
  <Stack.Navigator>
    <Stack.Screen
      name="Climber"
      component={HomeScreen}
      options={{
        title: (i18n.t('home')),
        headerTitleAlign: 'left',
        headerStyle: {
          shadowColor: '#fff',
          elevation: 0,
        },
        headerRight: () => (
          <View>
          <Ionicons
              style={{marginTop: 5}}
              name="add-circle"
              size={34}
              backgroundColor="#121212"
              color="#0782F9"
              onPress={() => navigation.navigate('AddPost')}
          />
          </View>
        ),
      }}
    />
    <Stack.Screen
      name="AddPost"
      component={AddPostScreen}
      options={{
        title: (i18n.t('addPostTitle')),
        headerTitleAlign: 'left',
        headerStyle: {
          elevation: 0,
        },
        headerBackTitleVisible: false,
        headerBackImage: () => (
          <View style={{marginLeft: 15}}>
            <Ionicons name="arrow-back" size={25} color="#0782F9" />
          </View>
        ),
      }}
    />
    <Stack.Screen
      name="Comments"
      component={CommentsScreen}
      options={{
        title: (i18n.t('commentsTitle')),
        headerTitleAlign: 'left',
        headerStyle: {
          elevation: 0,
        },
        headerBackTitleVisible: false,
        headerBackImage: () => (
          <View style={{marginLeft: 15}}>
            <Ionicons name="arrow-back" size={25} color="#0782F9" />
          </View>
        ),
      }}
      />
    <Stack.Screen
      name="HomeProfile"
      component={ProfileScreen}
      options={{
        title: (i18n.t('profileTitle')),
        headerTitleAlign: 'left',
        headerStyle: {
          elevation: 0,
        },
        headerBackTitleVisible: false,
        headerBackImage: () => (
          <View style={{marginLeft: 15}}>
            <Ionicons name="arrow-back" size={25} color="#0782F9" />
          </View>
        ),
      }}
    />
  </Stack.Navigator>
)

const MessageStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeMessages" component={MessagesScreen} options={{title:(i18n.t('messages'))}} />
    <Stack.Screen
      name="Chat"
      component={ChatScreen}
      options={({route}) => ({
        title: route.params.userName,
        headerBackTitleVisible: false,
      })}
    />
  </Stack.Navigator>
)

const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeProfile" component={ProfileScreen} options={{title:(i18n.t('profileTitle'))}} />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{
        title: (i18n.t('editProfileTitle')),
        headerBackTitleVisible: false,
        headerTitleAlign: 'left',
        headerStyle: {
          elevation: 0,
        },
      }}
    />
  </Stack.Navigator>
)

function AppStack() {

  let [locale, setLocale] = React.useState('en')
  i18n.fallbacks = true
  i18n.translations = {en, pt}
  i18n.locale = locale

  React.useEffect(() => {
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
  })

  return (
    <Tab.Navigator initialRouteName='Home' screenOptions={({route}) => ({tabBarIcon: ({focused, color, size}) => {
      let iconName
      let rn = route.name

      if (rn === 'Home') {
        iconName = focused ? 'home' : 'home-outline'
      } else if (rn === 'Messages') {
        iconName = focused ? 'chatbox-ellipses' : 'chatbox-ellipses-outline'
      } else if (rn === 'Profile') {
        iconName = focused ? 'person' : 'person-outline'
      }
      
      return <Ionicons name={iconName} color={color} size={size}/>
    },
      tabBarActiveTintColor: '#0782F9',
      tabBarInactiveTintColor: 'grey',
      tabBarShowLabel: false,
      tabBarStyle: [
        {
          'display': getFocusedRouteNameFromRoute(route) === 'Chat' || getFocusedRouteNameFromRoute(route) === 'AddPost' || getFocusedRouteNameFromRoute(route) === 'EditProfile' || getFocusedRouteNameFromRoute(route) === 'OtherProfile' || getFocusedRouteNameFromRoute(route) === 'Comments' ? 'none' : 'flex'
        },
        null
      ]
    })}>

      <Tab.Screen
        name="Home"
        component={FeedStack}
        options={() => ({
          headerShown: false,
        })}
      />
      <Tab.Screen
        name="Messages"
        component={MessageStack}
        options={() => ({
          headerShown: false,
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={() => ({
          headerShown: false,
        })}
      />
    </Tab.Navigator>
  )
}

export default AppStack