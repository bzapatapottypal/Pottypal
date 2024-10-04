import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";


// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAUd4Fhun400LVelLFSjQxPa1mhyVQfsjM',
  authDomain: "test-fireabse-600bb.firebaseapp.com",
  projectId: "test-fireabse-600bb",
  storageBucket: "test-fireabse-600bb.appspot.com",
  messagingSenderId: "785998053190",
  appId: "1:785998053190:web:edff3bb11109d1b5756f47"
};

const app = initializeApp(firebaseConfig);

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
