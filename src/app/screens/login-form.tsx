import { useState } from "react";
import { Text, View, StyleSheet, Button, TextInput } from "react-native";
import { FIREBASE_AUTH } from "../../../firebaseConfig"
import { getAuth, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signInWithRedirect } from "firebase/auth";

export default function FormTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const auth = FIREBASE_AUTH;
  auth.useDeviceLanguage();
 
  getRedirectResult(auth)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access Google APIs.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      // The signed-in user info.
      const user = result.user;
      // IdP data available using getAdditionalUserInfo(result)
      // ...
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    });
    
    onAuthStateChanged(auth, function (user) {
      if (user) {
        // User is signed in.
        const displayName = user.displayName;
        const email = user.email;
        const emailVerified = user.emailVerified;
        const photoURL = user.photoURL;
        const isAnonymous = user.isAnonymous;
        const uid = user.uid;
        const providerData = user.providerData;
        
      } else {
        // User is signed out.

      }
      //enable sign out button
    });
  const signIn = () => {
    if(!auth.currentUser) {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
      provider.setCustomParameters({
        'login_hint': 'user@example.com'
      });
      signInWithRedirect(auth, provider);
    }
    
  }

  return(
    <View style={styles.container}>
      <TextInput 
        style = {styles.input}
        value = {email}
        placeholder = "email"
        placeholderTextColor = "gray"
        autoCapitalize="none"
        onChangeText={(text) => setEmail(text)}
      >
      </TextInput>
      <TextInput 
        style = {styles.input}
        secureTextEntry = {true}
        value = {password}
        placeholder = "password"
        placeholderTextColor = "gray"
        autoCapitalize="none"
        onChangeText={(text) => setPassword(text)}
      >
      </TextInput>
      <View style= {styles.button}>
        <Button title="Sign Up" onPress={() => signUp()}></Button>
      </View>
      <View style= {styles.button}>
       <Button title="Login" onPress={() => signIn()}></Button>
      </View>
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