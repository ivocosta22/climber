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

//This file might look confusing at first, but this whole file is mostly the navigation flow of my App, mainly from my Bottom Navigation Drawer

//FeedStack, MessagesStack and ProfileStack have the screens/nested screens that are on each bottom drawer navigation item.
//They are not simple functions, they are component functions that are used below (Lines 199, 206 and 213) to make the Navigation Drawer work.
//They all have a title, properties, onPress events.
//This allows for example to make the AddPostScreen work (When the user clicks on the + button on the top right of the screen in the HomeScreen.js)
//Another examples are when the user clicks on another user's profile in the HomeScreen.js, or when they click on the Comment Button.
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

  //This file is using React's useEffect, which means that everything inside this function will be ran as soon as this file loads.
  //Inside this useEffect I will get the current setting in AsyncStorage for the value of currentLanguage (Which defines what language the user is on).
  //(Refer to ./navigation/screens/LoginScreen.js for more info).
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

  //This is the most important part of this file.
  //This UI is creating the whole flow of the App's navigation, past the Login Screen.
  //First, it draws a Tab.navigator, starting the App at the HomeScreen, and settings the icons on the bottom tab navigator
  //Those if statements below define the icons based on the name of the Stacked Screens, and return the icon respectively.
  //After the if statements and setting some options there is a very important option called tabBarStyle
  //Without explaining much, it will check which screen I'm on, since I don't want the bottom tab navigator to show on every screen, I will make it hidden
  //on certain screens, like the ChatScreen or EditProfile Screen. Making the User experince better and preventing the App from creating lots of problems with navigation.
  //After all that, I declare the 3 bottom tab screens, Home, Messages and Profile. The ones you see in the bottom when inside the APP.
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