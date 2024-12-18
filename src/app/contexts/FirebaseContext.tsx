import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Rating } from '@kolking/react-native-rating';
import firestore from '@react-native-firebase/firestore';
import { Alert } from "react-native";
import * as Location from 'expo-location'; 

const FirebaseContext = createContext(null)

export const FirebaseProvider = ({ children }) =>{
  const [reviews, setReviews] = useState([]);
  const [location, setLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  useEffect(() => {
    let subscription: { remove: any; }
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error Alert', 'This app needs location permissions. Please enable in the settings.', [
          {
            text: 'OK', onPress: () => console.log('OK pressed')
          }
        ]);
        return;
      } try {
        subscription = await Location.watchPositionAsync(
          { 
            accuracy: Location.Accuracy.High, 
            timeInterval: 6000, 
            distanceInterval: 20 
          },
          handleUserLocationUpdate
        );
      } catch (error) {
        Alert.alert('Error Alert', 'Could not get the location. Please try again.', [
          {
            text: 'OK', onPress: () => console.log('OK pressed')
          }
        ]);
        //TODO: ADD RELOAD BUTTON
      } finally {
      }
      return () => subscription.remove();
    })();
  }, []);
  
  const handleUserLocationUpdate = (location: { coords: { longitude: any; latitude: any; }; }) => {
    const coords = [location.coords.longitude, location.coords.latitude]
    setLocation(coords);
    setHasLocationPermission(true);
    setIsLoading(false);
  };
  return(
    <FirebaseContext.Provider value={{ 
      reviews, 
      setReviews, 
      location, 
      setLocation, 
      hasLocationPermission, 
      setHasLocationPermission, 
      isLoading, 
      setIsLoading 
    }}>
      {children}
    </FirebaseContext.Provider>
  )
}

export const useFirebase = () => useContext(FirebaseContext)