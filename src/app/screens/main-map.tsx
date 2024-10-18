import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Pressable, Linking, TouchableOpacity, TextInput, Image, FlatList, TouchableHighlight, Animated } from 'react-native';
import { Feather, Entypo } from "@expo/vector-icons";
import * as Location from 'expo-location';
import Mapbox, { Camera, PointAnnotation } from '@rnmapbox/maps';
import * as turf from '@turf/turf'
import Map from '@/src/components/Map'
import DestinationList from '@/src/components/DestinationList';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BannerInst from '@/src/components/BannerInst'

export default function MainMap() {
  const [destination, setDestination] = useState([]);
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
  const [profile, setProfile] = useState('driving');
  const [gettingDirections, setGettingDirections] = useState(false);
  const [mapBoxJson, setMapBoxJson] = useState(null)
  const [bannerLoading, setBannerLoading] = useState(true)

  const camera = useRef(null);
  
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
        console.log(location)
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


  useEffect(() => {
    if (hasLocationPermission && location) {
      loadMoreDestinations(); 
    }
  }, [hasLocationPermission, location]);

  const handleFilter = (filter: string) => {
    if(filter === 'ADA') {
      setSearchADA(!searchADA)
    } if (filter ==='unisex') {
      setSearchUnisex(!searchUnisex)
    }
  };

  const fitCameraBounds = (start, end) => {
    setCameraLocation(start);
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
      }
    } else {
      console.log('Location is not set, cannot load destinations.');
    }
  };
  
  const fetchDirections = async (profile: string , start: any[], end: any[]) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&voice_instructions=true&roundabout_exits=true&banner_instructions=true&continue_straight=true&annotations=speed,duration,congestion,closure&overview=full&geometries=geojson&access_token=${process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}`;
    setBannerLoading(true);
    console.log(url)
      try {
        const response = await fetch(url);
        const json = await response.json();
        setMapBoxJson(json);
        setRoute(json.routes[0].geometry.coordinates);
        setGettingDirections(true);
      } catch (error) {
        console.error(error);
        //TODO: add a user visibile error
        return
      } finally {
        setBannerLoading(false);
      }
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
      <BannerInst 
        mapBoxJson={mapBoxJson}
        bannerLoading={bannerLoading}
      />
      <Map 
        location={location}
        destination={destination}
        cameraLocation={cameraLocation}
        setCameraLocation={setCameraLocation}
        route={route} 
        gettingDirections={gettingDirections}
        camera={camera}
      />
      <DestinationList 
        destination={destination}
        location={location}
        setCameraLocation={setCameraLocation}
        loadMoreDestinations={loadMoreDestinations}
        searchADA={searchADA}
        searchUnisex={searchUnisex}
        handleFilter={handleFilter}
        fetchDirections={fetchDirections}
        fitCameraBounds={fitCameraBounds}
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