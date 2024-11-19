import { useEffect, useState } from "react";
import { Text, View, StyleSheet, Button, TextInput, Pressable } from "react-native";
import { FIREBASE_AUTH } from "../../../firebaseConfig"
import { getAuth, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signInWithRedirect, signOut } from "firebase/auth";
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

  const auth = FIREBASE_AUTH;
  auth.useDeviceLanguage();
   
  useEffect(() => {
    GoogleSignin.configure({
      //offlineAccess: true,
  
      webClientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ['profile', 'email'],
      offlineAccess: true
    });
  }, []);

  useEffect(() => {
    const subscriber = onAuthStateChanged(onAuthStateChanged);
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
      const response = await GoogleSignin.signIn();
      const googleCredential = GoogleAuthProvider.credential(response.data?.idToken);
      setUser(response.data);
      setLoggedIn(true);
      
      return signInWithCredential(auth, googleCredential);
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            break;
          default:
          // some other error happened
        }
      } else {
        // an error that's not related to google sign in occurred
      }
    }
    setInProgress(false);
  };

  const handleSignOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      signOut(auth)
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