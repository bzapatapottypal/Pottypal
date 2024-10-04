import { useState } from "react";
import { Text, View, StyleSheet, Button, TextInput } from "react-native";
import { FIREBASE_AUTH } from "../../../firebaseConfig"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function FormTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    try {
      const response = signInWithEmailAndPassword(auth, email, password);
      console.log(response)
    } catch (error: any) {
      alert('Sign In failed!')
      console.log(error)
    }
  }
  const signUp = async () => {
    try{
      const response = createUserWithEmailAndPassword(auth, email, password);
      alert('Check your emails!')
    } catch (error: any) {
      alert('Registration failed!')
      console.log(error)
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