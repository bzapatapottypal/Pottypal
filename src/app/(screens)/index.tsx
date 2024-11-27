import { useState } from "react";
import { Pressable, View, Text } from "react-native";
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";
import firestore, {getDoc} from '@react-native-firebase/firestore';
import {CollectData} from "@/src/components/GenData";
import FirebaseSignIn from "../../components/GoogleSignIn"

export default function LoginPage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  return(
      <GestureHandlerRootView>
        <View>
          <CollectData 
            userData={userData}
          />
          <FirebaseSignIn 
            user={user}
            setUser={setUser}
            setUserData={setUserData}
            setLoggedIn={setLoggedIn}
          />
        </View>
      </GestureHandlerRootView>
    
  )
}
