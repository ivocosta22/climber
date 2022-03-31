import * as React from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigation, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons'

// Screen imports
import HomeScreen from './screens/HomeScreen'
import ExploreScreen from './screens/ExploreScreen'
import SettingsScreen from './screens/SettingsScreen'

// Screen names
const homeName = 'Home';
const exploreName = 'Explore';
const settingsName = 'Settings';

const Tab = createBottomTabNavigator();

export default function MainContainer() {
    return(
        <NavigationContainer>
            <Tab.Navigator initialRouteName={homeName} screenOptions={({route}) => ({tabBarIcon: ({focused, color, size}) => {
                let iconName;
                let rn = route.name;

                if (rn === homeName) {
                    iconName = focused ? 'home' : 'home-outline';
                } else if (rn === exploreName) {
                    iconName = focused ? 'list' : 'list-outline';
                } else if (rn === settingsName) {
                    iconName = focused ? 'settings' : 'settings-outline';
                }

                return <Ionicons name={iconName} size={size} color={color}/>
            },

            })}
            tabBarOptions={{
                activeTintColor: 'tomato',
                inactiveTintColor: 'grey',
                labelStyle: { paddingBottom: 10, fontSize: 10},
                style: {padding: 10, height: 70}
            }}>

            <Tab.Screen name={homeName} component={HomeScreen}/>
            <Tab.Screen name={exploreName} component={ExploreScreen}/>
            <Tab.Screen name={settingsName} component={SettingsScreen}/>


            </Tab.Navigator>
        </NavigationContainer>
    );
}