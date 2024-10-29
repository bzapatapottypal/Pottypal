import { View, StyleSheet, Button } from 'react-native';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import * as Location from 'expo-location'

const VoiceInst = (mapBoxJson) => {
  const [voiceInst, setVoiceInst] = useState('words')
  const currentStepIndex = 0;
  
  const speak = () => {
    Speech.speak(voiceInst)
  }
  
  const startLocationUpdate = async () => {
    let locationSubscription;
    if(mapBoxJson.routes.legs.steps.maneuver) {
      locationSubscription = await Location.watchPositionAsync(
        { 
          accuracy: Location.Accuracy.High, 
          timeInterval: 1000, 
          distanceInterval: 5 
        },
        handleUserLocationUpdate
      );
    }

  }

  const handleUserLocationUpdate = () => {
    
  }

}