import * as React from 'react'
import { NavigationContainer, DarkTheme } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import OnboardingScreen from './navigation/screens/OnboardingScreen'
import LoginScreen from './navigation/screens/LoginScreen'
import AppStackScreen from './navigation/AppStack'
import RegisterScreen from './navigation/screens/RegisterScreen'

const AppStack = createStackNavigator()

//In lines 52 and 63 the Navigation Container will set the Theme for the OS to handle.
//In LoginScreen line 156, I explain that in order to change the App's theme to DarkMode or LightMode,
//the app must be restarted. This File is the reason why it has to. If the App isn't restarted, the value of
//the theme variable won't update as the LoginScreen always comes after this file is run, 
//and the UI will get (Example: a mix of DarkTheme for the OS UI and LightTheme for the App's UI)
//The best way to fix it: Restart the App so that this file gets run, and the theme variable gets updated.
const App = () => {
  const [isFirstLaunch, setIsFirstLaunch] = React.useState(null)
  const [theme, setTheme] = React.useState(null)

  //This file is using React's useEffect, which means that everything inside this function will be ran as soon as this file loads.
  //Inside this useEffect I will get the current setting in AsyncStorage for the value of isDarkMode (Which defines if the user is in Dark Mode or not).
  //AsyncStorage will also get the alreadyLaunched value to check if this is the first time the user's device is running the App.
  React.useEffect(() => {
    AsyncStorage.getItem('alreadyLaunched').then(value => {
      if (value == null) {
        AsyncStorage.setItem('alreadyLaunched', 'true')
        setIsFirstLaunch(true)
      } else {
        setIsFirstLaunch(false)
      }
    })
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
  },[])

  //Like said above, if this is the device's first launch, it will add the Onboarding Screen to the AppStack Navigation list.
  //After the user runs the App for the first time and restarts for example, isFirstLaunch will always return true unless the users resets the App's Data or reinstalls the App.
  if (isFirstLaunch == null) {
    return null
  } else if (isFirstLaunch == true) {
    return (
        <NavigationContainer theme={theme == 'light' ? undefined : DarkTheme}>
          <AppStack.Navigator screenOptions={{headerShown: false}}>
            <AppStack.Screen name='Onboarding' component={OnboardingScreen}/>
            <AppStack.Screen name='Login' component={LoginScreen}/>
            <AppStack.Screen name='Register' component={RegisterScreen}/>
            <AppStack.Screen name='AppStack' component={AppStackScreen}/>
          </AppStack.Navigator>
        </NavigationContainer>
    )
  } else {
    return (
        <NavigationContainer theme={theme == 'light' ? undefined  : DarkTheme}>
          <AppStack.Navigator screenOptions={{headerShown: false}}>
            <AppStack.Screen name='Login' component={LoginScreen}/>
            <AppStack.Screen name='Register' component={RegisterScreen}/>
            <AppStack.Screen name='AppStack' component={AppStackScreen}/>
          </AppStack.Navigator>
        </NavigationContainer>
    )
  }
}

export default App