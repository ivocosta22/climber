import * as React from 'react'
import { View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import HomeScreen from './screens/HomeScreen'
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
      name="Home"
      component={HomeScreen}
      options={{
        headerTitleAlign: 'left',
        headerStyle: {
          shadowColor: '#fff',
          elevation: 0,
        },
        headerRight: () => (
          <View>
            <FontAwesome5.Button
              name="plus"
              size={22}
              backgroundColor="#fff"
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
        title: '',
        headerTitleAlign: 'left',
        headerStyle: {
          backgroundColor: '#fff',
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
        title: '',
        headerTitleAlign: 'left',
        headerStyle: {
          backgroundColor: '#fff',
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
);

const MessageStack = ({navigation}) => (
  <Stack.Navigator>
    <Stack.Screen name="Messages" component={MessagesScreen} />
    <Stack.Screen
      name="Chat"
      component={ChatScreen}
      options={({route}) => ({
        title: route.params.userName,
        headerBackTitleVisible: false,
      })}
    />
  </Stack.Navigator>
);

const ProfileStack = ({navigation}) => (
  <Stack.Navigator>
    <Stack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{
        headerTitle: 'Edit Profile',
        headerBackTitleVisible: false,
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: '#fff',
          elevation: 0,
        },
      }}
    />
  </Stack.Navigator>
);


function App() {

  const getTabBarVisibility = (route) => {
    const routeName = route.state
      ? route.state.routes[route.state.index].name
      : '';

    if (routeName === 'Chat') {
      return false;
    }
    return true;
  };

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
    })}
      tabBarOptions={{
        activeTintColor: '#0782F9',
        inactiveTintColor: 'grey',
        style: { padding: 10, height: 70 },
        showLabel: false
      }}>

      <Tab.Screen
        name="Home"
        component={FeedStack}
        options={({route}) => ({
          headerShown: false,
        })}
      />
      <Tab.Screen
        name="Messages"
        component={MessageStack}
        options={({route}) => ({
          headerShown: false,
          tabBarVisible: getTabBarVisibility(route),
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
      />
    </Tab.Navigator>
  )
}

export default App