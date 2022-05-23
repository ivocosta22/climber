import * as React from 'react'
import LoginScreen from './navigation/screens/LoginScreen'
import MainContainer from './navigation/MainContainer'
import OnboardingScreen from './navigation/screens/OnboardingScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const Stack = createNativeStackNavigator()

function App() {
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
  }, [])

  if (isFirstLaunch === null) {
    return null
  } else if ( isFirstLaunch === true) {
    return(
      <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen options={{ headerShown: false }} name="OnboardingScreen" component={OnboardingScreen} />
            <Stack.Screen options={{ headerShown: false }} name="LoginScreen" component={LoginScreen} />
            <Stack.Screen options={{ headerShown: false }} name="MainContainer" component={MainContainer} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  } else {
    return(
    <NavigationContainer>
        <Stack.Navigator>
            <Stack.Screen options={{ headerShown: false }} name="LoginScreen" component={LoginScreen} />
            <Stack.Screen options={{ headerShown: false }} name="MainContainer" component={MainContainer} />
        </Stack.Navigator>
      </NavigationContainer>
    )
  }
}

export default App