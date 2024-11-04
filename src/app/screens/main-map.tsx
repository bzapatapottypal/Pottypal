import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, Pressable, Linking, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from "@expo/vector-icons";
//import * as Location from 'expo-location';
import Mapbox from '@rnmapbox/maps';
import * as turf from '@turf/turf';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Speech from 'expo-speech'
import * as Location from 'expo-location'; 

//import { useLocation } from '@/src/hooks/useLocation';


import Map from '@/src/components/Map';
import DestinationList from '@/src/components/DestinationList';

export default function MainMap() {
  const [location, setLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [destination, setDestination] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameraLocation, setCameraLocation] = useState([0, 0]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchADA, setSearchADA] = useState(false);
  const [searchUnisex, setSearchUnisex] = useState(false);
  const [route, setRoute] = useState([]);
  const [profile, setProfile] = useState('driving');
  const [gettingDirections, setGettingDirections] = useState(false);
  const [mapBoxJson, setMapBoxJson] = useState(null);
  const [zoom, setZoom] = useState(10);
  const [navigating, setNavigating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const camera = useRef(null);
  
  Mapbox.setAccessToken(String(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN));

  const REFUGE_ENDPOINT = process.env.EXPO_PUBLIC_REFUGE_ENDPOINT;
  
  useEffect(() => {
    let subscription: { remove: any; }
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('This app needs location permissions. Please enable in the settings.');
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
        setErrorMsg('Could not get the location. Please try again.');
        //TODO: ADD RELOAD BUTTON
      } finally {
      }
      return () => subscription.remove();
    })();
  }, [])

  useEffect(() => {
    if (hasLocationPermission && location) {
      loadMoreDestinations(); 
    }
  }, [hasLocationPermission, location]);

  useEffect(() => {
    if(!navigating){
      return
    }
    let steps = mapBoxJson.routes[0].legs[0].steps
    let currentStep = steps[stepIndex];
    let maneuverCoords = currentStep.maneuver.location;
    if (!steps || steps.length === 0) {
      console.log('No steps available');
      return;
    };
    if(stepIndex === 0) {
      initialDirection(currentStep);
    }
    if(currentStep.maneuver === "arrive") {
      console.log('arrive')
    }
    if(stepIndex > 0 && isCloseToManeuver(location, maneuverCoords)) {
      Speech.speak(currentStep.maneuver.instruction);
      setStepIndex(prevStep => prevStep + 1);
    }
  }, [stepIndex, mapBoxJson, location]);
  
  useEffect(() => {
    if(navigating === true) {
      return
    }
    setCameraLocation(location)
  },[location])

  const handleUserLocationUpdate = (location: { coords: { longitude: any; latitude: any; }; }) => {
    //console.log('getting location', location)
    const coords = [location.coords.longitude, location.coords.latitude]
    setLocation(coords);
    setHasLocationPermission(true);
    setIsLoading(false)
  };

  const initialDirection = (currentStep: number) => {
    setStepIndex(1);
    Speech.speak(currentStep.maneuver.instruction)
  }

  const handleFilter = (filter: string) => {
    if(filter === 'ADA') {
      setSearchADA(!searchADA)
    } if (filter ==='unisex') {
      setSearchUnisex(!searchUnisex)
    }
  };

  const fitCameraBounds = (start, end) => {
    //setCameraLocation(start);
    camera.current?.fitBounds(start, end, [40, 40], 2000);
    //TODO: Encompass map pointer in zoom out
  }
  
  //TODO: add error handling if the api comes up with a undefined result
  //TODO: make the transition for filters removing and adding items smoother
  const loadMoreDestinations = async () => {
    if (location && location.length) {
      try{
        const response = await fetch(`${REFUGE_ENDPOINT}/by_location?page=${String(page)}&per_page=10&offset=0&lat=${location[1]}&lng=${location[0]}` );
        const fetchedData = await response.json();
        if (fetchedData === '') {
          console.log('empty array')
        }
        if (fetchedData.length === 0) {
          setHasMore(false);
        } else {
          setDestination((prevDestinations) => {
            const newDestinations = fetchedData.filter(newDest => 
              !prevDestinations.some(prevDest => prevDest.id === newDest.id)
            );
            return [...prevDestinations, ...newDestinations];
          });
          setPage(prevPage => prevPage + 1);
        } 
      } catch(error) {
        console.error('Error fetching data:', error);
      }
    } else {
      console.log('Location is not set, cannot load destinations.');
    }
  };
  
  const isCloseToManeuver = (currentCoords, maneuverCoords, threshold = .1) => {
    const to = turf.point(currentCoords);
    const from = turf.point(maneuverCoords);
    const options = { units: 'miles' };
    const distance = turf.distance(from, to, options);

    return distance < threshold
    //TODO:if negative go to next direction
  }

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }
  
  if (!hasLocationPermission) {
    return (
      <View style={styles.noPermContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Pressable onPress={() => {Linking.openSettings();}}>
          <Text style={styles.settingsButton}>Settings</Text>
        </Pressable>
      </View>
    )
  }

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  return(
    <GestureHandlerRootView style={styles.container}> 
      <View style={{
        backgroundColor: '#FFF', 
        padding: 10
      }}>
        <TouchableOpacity style={{
          flexDirection: 'row', 
          alignItems: 'center', 
          paddingVertical: 0, 
          paddingHorizontal: 10, 
          backgroundColor: '#DDD', 
          borderRadius: 40 
        }}>
          <Feather 
            name="search"
            size={20}
            color="black"
            style={{ marginRight: 10 }}
          />
          <TextInput 
            style={{ 
              flex: 1, 
              padding: 10 
            }}
            placeholder="Search..."
          />
        </TouchableOpacity>
      </View>
      <Map 
        location={location}
        destination={destination}
        cameraLocation={cameraLocation}
        route={route} 
        gettingDirections={gettingDirections}
        camera={camera}
        zoom={zoom}
        navigating={navigating}
      />
      {/*navigating && (
        <Pressable
          style={{
            position: 'absolute',
            bottom: 100,
            margin: 10,
            backgroundColor: '#4681f4', 
            width: '30%', 
            alignItems:'center', 
            borderRadius: 30 
          }}
          onPress={() => {
            if (camera.current) {
              camera.current.followUserLocation = false
              setCameraLocation(location)
            }
          }}
        >
          <Text
            style={{
              fontSize: 16, 
              padding: 10, 
              color: 'white'
            }}
          >
            Re-center
          </Text>
        </Pressable>
      )*/}
      <DestinationList 
        destination={destination}
        location={location}
        setCameraLocation={setCameraLocation}
        loadMoreDestinations={loadMoreDestinations}
        searchADA={searchADA}
        searchUnisex={searchUnisex}
        handleFilter={handleFilter}
        fitCameraBounds={fitCameraBounds}
        setStepIndex={setStepIndex}
        gettingDirections={gettingDirections}
        mapBoxJson={mapBoxJson}
        setNavigating={setNavigating}
        setGettingDirections={setGettingDirections}
        setMapBoxJson={setMapBoxJson}
        setRoute={setRoute}
        navigating={navigating}
      />
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  resultName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  line: {
    fontSize: 14,
    color: '#333', 
    marginVertical: 2,
  },
  infoContainer: {
    marginVertical: 10,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e86de',
    marginTop: 10,
  },
  noPermContainer: {
    padding: 16,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    fontSize: 18,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingsButton: {
    fontSize: 20,
    padding: 20,
    backgroundColor: '#1A43BF',
    borderRadius: 50,
    color: '#FFF'
  },
  button: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#333',
  },
  toggleContainer: {
    flexDirection: 'row'
  },
});