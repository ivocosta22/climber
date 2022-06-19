import React from 'react'
import { View, StyleSheet, Text, ImageBackground, TextInput } from 'react-native'
import { getAuth } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../../firebase'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FormButton from '../../components/FormButton'


const EditProfileScreen = () => {
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)

    return (
      <View style={styles.container}>
          <View style={{alignItems: 'center', paddingTop: 30}}>
            <TouchableOpacity onPress={() => this.bs.current.snapTo(0)}>
              <View style={{height: 100, width: 100, borderRadius: 15, justifyContent: 'center', alignItems: 'center',
                }}>
                <ImageBackground source={{ uri:'https://lh5.googleusercontent.com/-b0PKyNuQv5s/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclxAM4M1SCBGAO7Rp-QP6zgBEUkOQ/s96-c/photo.jpg'}}
                  style={{height: 100, width: 100}}
                  imageStyle={{borderRadius: 15}}>
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Ionicons
                      name="camera"
                      size={35}
                      color="#fff"
                      style={{
                        opacity: 0.7,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#fff',
                        borderRadius: 10,
                      }}
                    />
                  </View>
                </ImageBackground>
              </View>
            </TouchableOpacity>
            <Text style={{marginTop: 10, fontSize: 18, fontWeight: 'bold'}}>
                  User Name
            </Text>
            {/* <Text>{user.uid}</Text> */}
          </View>
  
          <View style={styles.action}>
            <Ionicons name="person-outline" color="#333333" size={20} style={{marginLeft: 5, marginBottom: 10}} />
            <TextInput
              placeholder="First Name"
              placeholderTextColor="#666666"
              autoCorrect={false}
              value=''
              onChangeText={(txt) => setUserData({...userData, fname: txt})}
              style={styles.textInput}
            />
          </View>
          <View style={styles.action}>
            <Ionicons name="person-outline" color="#333333" size={20} style={{marginLeft: 5, marginBottom: 10}} />
            <TextInput
              placeholder="Last Name"
              placeholderTextColor="#666666"
              value=''
              onChangeText={(txt) => setUserData({...userData, lname: txt})}
              autoCorrect={false}
              style={styles.textInput}
            />
          </View>
          <View style={styles.action}>
            <Ionicons name="ios-clipboard-outline" color="#333333" size={20} style={{marginLeft: 5, marginBottom: 10}} />
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="About Me"
              placeholderTextColor="#666666"
              value=''
              onChangeText={(txt) => setUserData({...userData, about: txt})}
              autoCorrect={true}
              style={[styles.textInput, {height: 40}]}
            />
          </View>
          <View style={styles.action}>
          {/*TODO: SWITCH HERE TO ADD GAMES TO DB*/}
            <Ionicons name="game-controller-outline" color="#333333" size={20} style={{marginLeft: 5, marginBottom: 10}} />
            <TextInput
              placeholder="Games"
              placeholderTextColor="#666666"
              keyboardType="number-pad"
              autoCorrect={false}
              value=''
              onChangeText={(txt) => setUserData({...userData, phone: txt})}
              style={styles.textInput}
            />
          </View>
          <FormButton buttonTitle="Update" onPress={() => {}} />
      </View>
    );
  };
  
  export default EditProfileScreen;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    commandButton: {
      padding: 15,
      borderRadius: 10,
      backgroundColor: '#FF6347',
      alignItems: 'center',
      marginTop: 10,
    },
    panel: {
      padding: 20,
      backgroundColor: '#FFFFFF',
      paddingTop: 20,
      width: '100%',
    },
    header: {
      backgroundColor: '#FFFFFF',
      shadowColor: '#333333',
      shadowOffset: {width: -1, height: -3},
      shadowRadius: 2,
      shadowOpacity: 0.4,
      paddingTop: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    panelHeader: {
      alignItems: 'center',
    },
    panelHandle: {
      width: 40,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#00000040',
      marginBottom: 10,
    },
    panelTitle: {
      fontSize: 27,
      height: 35,
    },
    panelSubtitle: {
      fontSize: 14,
      color: 'gray',
      height: 30,
      marginBottom: 10,
    },
    panelButton: {
      padding: 13,
      borderRadius: 10,
      backgroundColor: '#2e64e5',
      alignItems: 'center',
      marginVertical: 7,
    },
    panelButtonTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: 'white',
    },
    action: {
      flexDirection: 'row',
      marginTop: 10,
      marginBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#f2f2f2',
      paddingBottom: 5,
    },
    actionError: {
      flexDirection: 'row',
      marginTop: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#FF0000',
      paddingBottom: 5,
    },
    textInput: {
      flex: 1,
      marginTop: -12,
      paddingLeft: 10,
      color: '#333333',
    },
  });