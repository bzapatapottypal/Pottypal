import { initializeApp } from '@react-native-firebase/app';
import { getReactNativePersistence, initializeAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';


// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};



// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

// Initialize Firebase Authentication and get a reference to the service

export const fbApp = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(fbApp, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const FIREBASE_FIRESTORE = getFirestore(fbApp)

