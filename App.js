import * as React from 'react'
import LoginScreen from './navigation/screens/LoginScreen'
import MainContainer from './navigation/MainContainer'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'

const Stack = createNativeStackNavigator()

function App() {
  return(
    <NavigationContainer>
      <Stack.Navigator>
          <Stack.Screen options={{ headerShown: false }} name="Login" component={LoginScreen} />
          <Stack.Screen options={{ headerShown: false }} name="MainContainer" component={MainContainer} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App