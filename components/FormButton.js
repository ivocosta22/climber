import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { globalStyles } from './../styles/global'

const FormButton = ({buttonTitle, ...rest}) => {
  return (
    <TouchableOpacity style={globalStyles.formButtonContainer} {...rest}>
      <Text style={globalStyles.formButtonText}>{buttonTitle}</Text>
    </TouchableOpacity>
  )
}

export default FormButton