import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { globalStyles } from './../styles/global'

//This Custom Button is used for the Edit Profile Screen to Update the Profile. This is the UI only.
//This UI's styles are located in a global styles file (./styles/global.js)
const FormButton = ({buttonTitle, ...rest}) => {
  return (
    <TouchableOpacity style={globalStyles.formButtonContainer} {...rest}>
      <Text style={globalStyles.formButtonText}>{buttonTitle}</Text>
    </TouchableOpacity>
  )
}

export default FormButton