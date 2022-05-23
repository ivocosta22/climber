import * as React from 'react'
import LoginScreen from './navigation/screens/LoginScreen'
import MainContainer from './navigation/MainContainer'
import OnboardingScreen from './navigation/screens/OnboardingScreen'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'

const Stack = createNativeStackNavigator()

function App() {
  return(
    <NavigationContainer>
      <Stack.Navigator>
          <Stack.Screen options={{ headerShown: false }} name="OnboardingScreen" component={OnboardingScreen} />
          <Stack.Screen options={{ headerShown: false }} name="LoginScreen" component={LoginScreen} />
          <Stack.Screen options={{ headerShown: false }} name="MainContainer" component={MainContainer} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App