import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Pressable, Linking, TouchableOpacity, TextInput, Image, FlatList, TouchableHighlight } from 'react-native';
import { Feather, Entypo } from "@expo/vector-icons";
import * as Location from 'expo-location';
import Mapbox, { Camera, PointAnnotation } from '@rnmapbox/maps';
import * as turf from '@turf/turf'
import Map from '@/src/components/Map'
import DestinationList from '@/src/components/DestinationList';

export default function MainMap() {
  const [calculatedDistances, setCalculatedDistances] = useState([]);
  const [destination, setDestination] = useState([]);
  const [currentDest, setCurrentDest] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [cameraLocation, setCameraLocation] = useState([0, 0]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchADA, setSearchADA] = useState(false);
  const [searchUnisex, setSearchUnisex] = useState(false);
  const [route, setRoute] = useState([]);
  const [profile, setProfile] = useState('driving')
  const [gettingDirections, setGettingDirections] = useState(false)

  Mapbox.setAccessToken(String(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN));

  const REFUGE_ENDPOINT = process.env.EXPO_PUBLIC_REFUGE_ENDPOINT;
  
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('This app needs location permissions. Please enable in the settings.');
        return;
      } try {
        let location = await Location.getCurrentPositionAsync({});
        const coords = [location.coords.longitude, location.coords.latitude]
        setLocation(coords);
        setCameraLocation(coords);
        console.log(coords)
        setHasLocationPermission(true);
      } catch (error) {
        setErrorMsg('Could not get the location. Please try again.');
        //TODO: ADD RELOAD BUTTON
      } finally {
        setIsLoading(false)
      }
    })();
  }, []);

  const handleFilter = (filter: string) => {
    if(filter === 'ADA') {
      setSearchADA(!searchADA)
    } if (filter ==='unisex') {
      setSearchUnisex(!searchUnisex)
    }
  };

  //TODO: add error handling if the api comes up with a undefined result
  //TODO: make the transition for filters removing and adding items smoother
  const loadMoreDestinations = async () => {
    if (location && location.length) {
      //setIsLoading(true);
      try{
        const response = await fetch(`${REFUGE_ENDPOINT}/by_location?page=${String(page)}&per_page=10&offset=0&lat=${location[1]}&lng=${location[0]}` );
        const fetchedData = await response.json();
  
        if (fetchedData.length === 0) {
          setHasMore(false); // No more data to load
        } else {
          // Append new data to current destinations
          setDestination((prevDestinations) => {
            const newDestinations = fetchedData.filter(newDest => 
              !prevDestinations.some(prevDest => prevDest.id === newDest.id)
            );
            return [...prevDestinations, ...newDestinations];
          });
          setPage(page + 1);
        } 
      } catch(error) {
        console.error('Error fetching data:', error);
      } finally {
        //setIsLoading(false);
      }
    } else {
      console.log('Location is not set or undefined, cannot load destinations.');
    }
  };
  
  const fetchDirections = async (profile: string , start: any[], end: any[]) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}`;
    
      try {
        const response = await fetch(url);
        console.log(url);
        const json = await response.json();
        const currentRoute = json.routes[0].geometry.coordinates;
        setRoute(currentRoute)
        setGettingDirections(true);
      } catch (error) {
        console.error(error);
        //TODO: add a user visibile error
      } 
  }

  useEffect(() => {
    if (hasLocationPermission && location) {
      loadMoreDestinations(); 
    }
  }, [hasLocationPermission, location]);

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
    <View style={styles.container}> 
      <View style={{backgroundColor: '#FFF', padding: 10}}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 0, paddingHorizontal: 10, backgroundColor: '#DDD', borderRadius: 40 }}>
          <Feather 
            name="search"
            size={20}
            color="black"
            style={{ marginRight: 10 }}
          />
          <TextInput 
            style={{ flex: 1, padding: 10 }}
            placeholder="Search..."
          />
        </View>
      </View>
      <Map 
        location={location}
        destination={destination}
        cameraLocation={cameraLocation}
        setCameraLocation={setCameraLocation}
        route={route} 
        gettingDirections={gettingDirections}
      />
      <View style={styles.overlayContainer}>
        <DestinationList 
          destination={destination}
          location={location}
          setCameraLocation={setCameraLocation}
          loadMoreDestinations={loadMoreDestinations}
          searchADA={searchADA}
          searchUnisex={searchUnisex} 
          handleFilter={handleFilter}
          fetchDirections={fetchDirections}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    
  },
  searchBar: {
  },
  overlayContainer: {
    position: 'absolute', // Absolute positioning to overlay the map
    bottom: 0, // Pin to the bottom of the screen
    left: 0,
    right: 0,
    height: Dimensions.get('window').height * 0.4, // Height of the overlay (40% of screen)
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white background
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 10,
    elevation: 5, // For Android shadow
  },
  resultContainer: {
    padding: 16,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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