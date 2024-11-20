import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Button, TextInput, Pressable } from "react-native";
import { fbApp, FIREBASE_AUTH, } from "../../../firebaseConfig"
import auth from "@react-native-firebase/auth"

import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes
} from '@react-native-google-signin/google-signin';

export default function FormTest() {
  const [user, setUser] = useState(null)
  const [isInProgress, setInProgress] = useState(false)
  const [isLoggedIn, setLoggedIn] = useState(false)
  
  const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID

  //const currentFirebase = fbApp
  //const currentAuth = getAuth();
  //console.log(currentAuth)
  //auth.useDeviceLanguage();
   
  useEffect(() => {
    GoogleSignin.configure({
      //offlineAccess: true,
  
      webClientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ['profile', 'email'],
      offlineAccess: true
    });
  }, []);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

 
  function onAuthStateChanged(user) {
    setUser(user);
    if (user) setLoggedIn(true);
    else setLoggedIn(false);
    if (isInProgress) setInProgress(false);
  }
  
  const handleSignIn = async () => {
    setInProgress(true);
    //console.log('sign in')
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult  = await GoogleSignin.signIn();

      let idToken = signInResult.data?.idToken;
      if (!idToken) {
        throw new Error('No ID token found');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(signInResult.data.idToken);
      setUser(signInResult.data);
      setLoggedIn(true);
      return auth().signInWithCredential(googleCredential);
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            console.log('')
            break;
          default:
          // some other error happened
          console.log(error +' '+ error.code)
        }
      } else {
        // an error that's not related to google sign in occurred
        console.log('error not related to google play')
      }
    }
    setInProgress(false);
  };

  const handleSignOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      auth()
        .signOut()
        .then(() => console.log("User signed out!"));
      setLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  if(!user) {
    return(
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignSelf: 'center'
        }}
      >
        <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={() => {
          handleSignIn()
        }}
        disabled={isInProgress}
      />
      <Pressable
        onPress={() => {
          handleSignOut();
        }}
      >
        <Text>Log Out</Text>
      </Pressable>
      </View>
    )
  }
  return(
    <View>
      <Pressable
        onPress={() => {
          handleSignOut();
        }}
      >
        <Text>Log Out</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 20,
    flex: 1,
    justifyContent: 'center'
  },
  input: {
    padding: 10,
    margin: 5,
    borderWidth: 1,
    borderRadius: 4,
    height: 50,
    width: 200,
    backgroundColor: '#fff'
  },
  button: {
    margin: 2,
    height: 50,
    width: 200,
  }
})