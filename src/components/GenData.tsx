import { useState } from "react";
import { Pressable, View, Text } from "react-native";
import firestore, {getDoc} from '@react-native-firebase/firestore';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";

const db = firestore();

export const genUser = async (user: { id: string; name: string; email: string; photo: string; familyName?: string | null; givenName?: string | null; }) => {
  const userRef = db.collection('users');
  const docSnapshot = await userRef.doc(user.id).get();
  console.log(user)
  if(!docSnapshot.exists) {
    userRef.doc(user.id).set({
      name: user.name,
      id: user.id,
      email: user.email,
      photo: user.photo
    }).then((docRef) => {
      console.log('New user created');
    })
    .catch((error) => {
      console.error('Error creating user: ', error);
    });
  } else {
    console.log('User already exists.');
  }
}

export const genReview = async (content: string, locationID) => {
    const user = auth().currentUser?.providerData[0] || null
    const reviewRef = db.collection('reviews')
    console.log(user)
    if(!user) {
      console.log('user undefined')
    }
    reviewRef.add({
      userID: user.uid,
      user: user.displayName,
      locationID: locationID,
      content: content,
      createdAt: new Date(),
      //TODO: editing capability and edited on dates
      editedAt: new Date(),
      score: 'number between 1-5'
    })
    .then((docRef) => {
      console.log('Document written with ID: ', docRef.id);
    })
    .catch((error) => {
      console.error('Error adding document: ', error);
    });
}

export function CollectData({ userData }) {
  //const [text, onChangeText] = useState('')

  {/*
    if (__DEV__) {
    firestore().useEmulator('localhost', 8080);
    }
    
  */}
  //ref.where('userId', '==', 'user1')
  
  return(
    <View>
      <TextInput 
        placeholder="write review"
        onSubmitEditing={(text) => {
          
          genReview(text.nativeEvent.text, -2)
        }}
      />
    </View>
  )
}
