import * as React from 'react'
import { BackHandler } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from 'react-native-vector-icons/Ionicons'
import HomeScreen from './screens/HomeScreen'
import ExploreScreen from './screens/ExploreScreen'
import ProfileScreen from './screens/ProfileScreen'
import AddPostScreen from './screens/AddPostScreen'


const homeName = 'Home'
const exploreName = 'Explore'
const postName = 'New Post'
const profileName = 'Profile'

const Tab = createBottomTabNavigator()

export default function MainContainer() {
    React.useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true)
        return () => backHandler.remove()
      }, [])
    return(
            <Tab.Navigator initialRouteName={homeName} screenOptions={({route}) => ({tabBarIcon: ({focused, color, size}) => {
                let iconName
                let rn = route.name

                if (rn === homeName) {
                    iconName = focused ? 'home' : 'home-outline'
                } else if (rn === exploreName) {
                    iconName = focused ? 'list' : 'list-outline'
                } else if (rn === postName) {
                    iconName = focused ? 'add-circle' : 'add-circle-outline'
                } else if (rn === profileName) {
                    iconName = focused ? 'person' : 'person-outline'
                }
                return <Ionicons name={iconName} size={size} color={color}/>
            },

            })}
            tabBarOptions={{
                activeTintColor: '#0782F9',
                inactiveTintColor: 'grey',
                labelStyle: { paddingBottom: 10, fontSize: 10},
                style: {padding: 10, height: 70}
            }}>

            <Tab.Screen name={homeName} component={HomeScreen}/>
            <Tab.Screen name={exploreName} component={ExploreScreen}/>
            <Tab.Screen name={postName} component={AddPostScreen}/>
            <Tab.Screen name={profileName} component={ProfileScreen}/>
            
            </Tab.Navigator>
    )
}