import * as React from 'react'
import { NavigationContainer, DarkTheme } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import OnboardingScreen from './navigation/screens/OnboardingScreen'
import LoginScreen from './navigation/screens/LoginScreen'
import AppStackScreen from './navigation/AppStack'
import RegisterScreen from './navigation/screens/RegisterScreen'

const AppStack = createStackNavigator()

const App = () => {
  const [isFirstLaunch, setIsFirstLaunch] = React.useState(null)
  const [theme, setTheme] = React.useState(null)

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