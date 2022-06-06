import React from 'react'
import { View, StyleSheet } from 'react-native'
import { InputField, InputWrapper } from '../../styles/AddPost'
import ActionButton from 'react-native-action-button'
import Icon from 'react-native-vector-icons/Ionicons'

const AddPostScreen = () => {
    return(
        <View style={styles.container}>
            <InputWrapper>
                <InputField
                    placeholder = "What goal did you achieve?"
                    multiline
                    numberOfLines={4}
                />
            </InputWrapper>
            <ActionButton buttonColor='rgba(7, 130, 249, 1)'>
                <ActionButton.Item
                    buttonColor="#9b59b6"
                    title="Take Photo"
                    //TODO
                    onPress={() => {}}>
                    <Icon name="camera-outline" style={styles.actionButtonIcon} />
                </ActionButton.Item>
                <ActionButton.Item
                    buttonColor="#e84d3c"
                    title="Choose Photo"
                    //TODO
                    onPress={() => {}}>
                    <Icon name="md-images-outline" style={styles.actionButtonIcon} />
                </ActionButton.Item>
            </ActionButton>
        </View>
    )
}

export default AddPostScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
})