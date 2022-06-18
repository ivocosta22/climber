import * as React from 'react'
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import AsyncStorage from "@react-native-async-storage/async-storage"
import OnboardingScreen from './navigation/screens/OnboardingScreen'
import LoginScreen from './navigation/screens/LoginScreen'
import AppStackScreen from './navigation/AppStack'

const AppStack = createStackNavigator()

const App = () => {
  const [isFirstLaunch, setIsFirstLaunch] = React.useState(null)

  React.useEffect(() => {
    AsyncStorage.getItem('alreadyLaunched').then(value => {
      if (value == null) {
        AsyncStorage.setItem('alreadyLaunched', 'true')
        setIsFirstLaunch(true)
      } else {
        setIsFirstLaunch(false)
      }
    })
  },[])

  if (isFirstLaunch == null) {
    return null
  } else if (isFirstLaunch == true) {
    return (
      <NavigationContainer>
        <AppStack.Navigator headerMode='none'>
          <AppStack.Screen name='Onboarding' component={OnboardingScreen}/>
          <AppStack.Screen name='Login' component={LoginScreen}/>
          <AppStack.Screen name='AppStack' component={AppStackScreen}/>
        </AppStack.Navigator>
      </NavigationContainer>
    )
  } else {
    return (
      <NavigationContainer>
        <AppStack.Navigator headerMode='none'>
          <AppStack.Screen name='Login' component={LoginScreen}/>
          <AppStack.Screen name='AppStack' component={AppStackScreen}/>
        </AppStack.Navigator>
      </NavigationContainer>
    )
  }
}

export default App