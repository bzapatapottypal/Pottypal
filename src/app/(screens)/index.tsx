import { useState } from "react";
import { Pressable, View, Text, SafeAreaView } from "react-native";
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import firestore, {getDoc} from '@react-native-firebase/firestore';
import FirebaseSignIn from "../../components/FirebaseSignIn"

export default function LoginPage(testGlobal, setTestGlobal) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  return(
    <GestureHandlerRootView
      style={{
        flex: 1,
        backgroundColor: 'white',
      }}
    >
      <FirebaseSignIn 
        user={user}
        setUser={setUser}
        setUserData={setUserData}
        setLoggedIn={setLoggedIn}
        testGlobal={testGlobal}
        setTestGlobal={setTestGlobal}
      />
    </GestureHandlerRootView>
  )
}
