import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Rating } from '@kolking/react-native-rating';
import firestore from '@react-native-firebase/firestore';

const FirebaseContext = createContext(null)

export const FirebaseProvider = ({ children }) =>{
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    const subscriber = firestore()
      .collection('reviews')
      .onSnapshot(querySnapshot => {
        const reviews: ((prevState: never[]) => never[]) | { key: string }[] = [];
  
        querySnapshot.forEach(documentSnapshot => {
          reviews.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });
        setReviews(reviews);
      });
      console.log('context works')
    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);
 
  return(
    <FirebaseContext.Provider value={{ reviews, setReviews }}>
      {children}
    </FirebaseContext.Provider>
  )
}

export const useFirebase = () => useContext(FirebaseContext)