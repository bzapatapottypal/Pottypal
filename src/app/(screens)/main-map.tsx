import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Text, View, StyleSheet, ActivityIndicator, Pressable, Linking, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from "@expo/vector-icons";
//import * as Location from 'expo-location';
import Mapbox from '@rnmapbox/maps';
import * as turf from '@turf/turf';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Speech from 'expo-speech'
import * as Location from 'expo-location'; 

import Map from '@/src/components/Map';
import DestinationList from '@/src/components/DestinationList';
import SearchFilters from '@/src/components/SearchFilters';

export default function MainMap() {
  const [location, setLocation] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [destination, setDestination] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameraLocation, setCameraLocation] = useState([0, 0]);
  const [page, setPage] = useState(1);
  //const [hasMore, setHasMore] = useState(true);
  const [searchADA, setSearchADA] = useState(false);
  const [searchUnisex, setSearchUnisex] = useState(false);
  const [route, setRoute] = useState([]);
  const [profile, setProfile] = useState('driving');
  const [gettingDirections, setGettingDirections] = useState(false);
  const [mapBoxJson, setMapBoxJson] = useState(null);
  const [zoom, setZoom] = useState(10);
  const [navigating, setNavigating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [refreshingBL, setRefreshingBL]= useState(false);
  const [fetchType, setFetchType] = useState('location');
  const [isSearching, setIsSearching] = useState(false);
  const [input, onInput] = useState('')

  const maneuverRef = useRef({
    maneuverDist: 0,
    maneuverCoords:[0,0],
    currentStep: null
  });
  const lastSpoken = useRef(''); 
  const camera = useRef(null);
  const searchContent = useRef('');
  
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
    if(!navigating){
      return
    }
    if(!mapBoxJson) {
      return
    }
  
    let steps = mapBoxJson.routes[0].legs[0].steps
    let currentStep = steps[stepIndex];
    let maneuverCoords = currentStep.maneuver.location;
    maneuverRef.current.currentStep = currentStep;
    maneuverRef.current.maneuverCoords = maneuverCoords;
    if (!steps || steps.length === 0) {
      console.log('No steps available');
      return;
    };

    if(currentStep.maneuver === "arrive") {
      console.log('arrive');
      Speech.speak('You have arrived.');
      setNavigating(false);
    }

    if(stepIndex === 0) {
      Speech.speak(`Let's get started`);
      initialDirection(currentStep);
    }
    
    if(stepIndex > 0 && currentStep) {
      setTimeout(() => {
        speakManeuver(isCloseToManeuver(location, maneuverCoords));
      }, 1000)
    }
  }, [stepIndex, mapBoxJson, location]);
  
  useEffect(() => {
    if(navigating === true) {
      return
    }
    setCameraLocation(location)
  },[location])

  const handleUserLocationUpdate = (location: { coords: { longitude: any; latitude: any; }; }) => {
    const coords = [location.coords.longitude, location.coords.latitude]
    setLocation(coords);
    setHasLocationPermission(true);
    setIsLoading(false);
  };

  const initialDirection = (currentStep: { maneuver: { instruction: string; }; }) => {
    setStepIndex(1);
    Speech.speak(currentStep.maneuver.instruction);
  }

  function speakManeuver(miles: number) {
    if (maneuverRef.current.currentStep.maneuver === null) {
      console.log('was null')
    }
    const inst = maneuverRef.current.currentStep.maneuver.instruction 

    switch (true) {
      case miles < 10 && miles >= 1:
        if(lastSpoken.current === 'far' ) {
          setTimeout(() => {
            lastSpoken.current = '' 
            return
          }, 200000)
        }
        Speech.speak(`in` + `${(maneuverRef.current.maneuverDist).toFixed(0)} miles,` + `${inst}`);
        lastSpoken.current = 'far' 
        break
      case miles < 1 && miles > 0.018:
        if(lastSpoken.current === 'near' ) {
          return
        }
        Speech.speak(`in` + `${(maneuverRef.current.maneuverDist * 5280).toFixed(0)} ft,` + `${inst}`);
        lastSpoken.current = 'near' 
        break
      case miles <= 0.018 && miles < 0:
        Speech.speak(`${inst}`);
        setStepIndex(prevStep => prevStep + 1);
        break
      default:
        console.log('default swtich');
        break
    }
  }
  
  const searchSubmit = useCallback((query: string) => {
    //setFetchType('search');
    searchContent.current = String(query)
    //setPage(1);
    //setDestination([]);
    setIsSearching(true)
    //setRefreshingBL(true);
    //TODO: handle if theres no more results on the next few pages
  }, [])

  const isCloseToManeuver = (currentCoords, maneuverCoords) => {
    const to = turf.point(currentCoords);
    const from = turf.point(maneuverCoords);
    const options = { units: 'miles' };
    const distance = turf.distance(from, to, options);
    maneuverRef.current.maneuverDist = distance;
    return distance
    //TODO:if negative go to next direction
  }
  
  const handleFilter = (filter: string, query:string) => {
    if(filter === 'ADA') {
      setSearchADA(!searchADA)
    } 
    if (filter === 'unisex') {
      setSearchUnisex(!searchUnisex)
    }
  };

  const fitCameraBounds = (start: any, end: any) => {
    //setCameraLocation(start);
    camera.current?.fitBounds(start, end, [40, 40], 2000);
    //TODO: Encompass map pointer in zoom out
  }
  
  //TODO: add error handling if the api comes up with a undefined result
  //TODO: make the transition for filters removing and adding items smoother
  const loadMoreDestinations = async (fetchType: string, query: string) => {
    if (!location || !location.length) {
      console.log('Location is not set, cannot load destinations.');
    }
    try{
      let fetchURL
    
      if (fetchType === 'location') {
        fetchURL = `${REFUGE_ENDPOINT}/by_location?page=${String(page)}&per_page=20&offset=0&lat=${location[1]}&lng=${location[0]}`;
      } else {
        console.log('fetchURL if/else error');
        //TODO: Add visible error for user
        return
      }
      const response = await fetch(fetchURL);
      console.log(response)
      const fetchedData = await response.json();
      
      if (fetchedData.length === 0 || fetchedData === '' || !fetchedData) {
        //TODO: add condfition for if fetchedData.filter isnt a fucntion, likely when refuge runs out of pages to render
        //setHasMore(false);
        console.log('empty array')
        return
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
    } finally {
      //setIsLoading(false);
    }
  };

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
      <View style={{backgroundColor: '#FFF', padding: 10}}>
        <TouchableOpacity 
          style={{
            flexDirection: 'row', 
            alignItems: 'center', 
            paddingVertical: 0, 
            paddingHorizontal: 10, 
            backgroundColor: '#DDD', 
            borderRadius: 40 
          }}
        >
          <Feather 
            name="search"
            size={20}
            color="black"
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={{ flex: 1, padding: 10 }}
            onChangeText={(text)=> {
              onInput(text)
              searchSubmit(input)
            }}
            value={input}
            placeholder="Search..."
          />
        </TouchableOpacity>
      </View>
      <Map 
        //location={location}
        destination={destination}
        cameraLocation={cameraLocation}
        route={route} 
        gettingDirections={gettingDirections}
        camera={camera}
        zoom={zoom}
        navigating={navigating}
      />
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
        profile={profile}
        setProfile={setProfile}
        refreshingBL={refreshingBL}
        fetchType={fetchType}
        searchContent={searchContent}
        searchSubmit={searchSubmit}
        setPage={setPage}
        isSearching={isSearching}
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