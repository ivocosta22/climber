import { StyleSheet } from "react-native";
import {windowHeight} from '../utils/Dimentions'

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    tinyLogo: {
        height: 200,
        width: 200,
        alignItems: 'center',
    },
    mediumLogo: {
        height: 300,
        width: 300,
        marginTop: -100,
        alignItems: 'center',
    },
    wideTinyLogo: {
        height: 180,
        width: 400,
        marginBottom: 20,
        alignItems: 'center',
    },
    inputContainer: {
        width: '80%'
    },
    input: {
        paddingHorizontal: 15,
        borderRadius: 10,
        marginTop: 5,
    },
    buttonContainer: {
        width: '60%',
        justifyContent: 'center',
        marginTop: 40,
    },
    iconContainer: {
        flexDirection: 'row',
        marginHorizontal: 30,
        paddingTop: 30
    },
    ionicon: {
        marginLeft: 15,
        marginRight: 15
    },
    button: {
        backgroundColor: '#0782F9',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonOutline: {
        backgroundColor: 'white',
        marginTop: 10,
        marginBottom: 20,
        borderColor: '#0782F9',
        borderWidth: 2,
    },
    buttonOutlineText: {
        color: '#0782F9',
        fontWeight: '700',
        fontSize: 16,
        alignSelf: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    actionButtonIcon: {
        fontSize: 20,
        height: 22,
        color: 'white',
    },
    containerProfile: {
        flex: 1,
        padding: 20,
    },
    userImg: {
        height: 150,
        width: 150,
        borderRadius: 75,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
    },
    aboutUser: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
    },
    userBtnWrapper: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 10,
    },
    userBtn: {
        borderColor: '#0782F9',
        borderWidth: 2,
        borderRadius: 3,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginHorizontal: 5,
    },
    userBtnTxt: {
        color: '#0782F9',
    },
    userInfoWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginVertical: 20,
    },
    userInfoItem: {
        justifyContent: 'center',
    },
    userInfoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    userInfoSubTitle: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    action: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f2f2f2',
        paddingBottom: 5,
    },
    textInput: {
        flex: 1,
        marginTop: -12,
        paddingLeft: 10,
    },
    userText: {
        marginTop: 10, 
        fontSize: 18, 
        fontWeight: 'bold',
    },
    ioniconEditProfile: {
        marginLeft: 5, 
        marginBottom: 10
    },
    containerProgressiveImage: {
        backgroundColor: '#e1e4e8'
     },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    formButtonContainer: {
        marginTop: 10,
        width: '100%',
        height: windowHeight / 15,
        backgroundColor: '#2e64e5',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
    },
    formButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
})