import React, { useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, Pressable, Share, Alert, RefreshControl, TextInput } from 'react-native';
import * as turf from '@turf/turf'
import BottomSheet, { BottomSheetFlatList, BottomSheetFooter, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet'
import { AntDesign, MaterialCommunityIcons, MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { BottomSheetDefaultFooterProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types';
import { Rating } from '@kolking/react-native-rating';
import firestore from '@react-native-firebase/firestore';

import SearchFilters from './SearchFilters';
import WriteReview, { RenderReview } from '../app/(screens)/Details';
import { CloseButton } from './CloseButton';

const DestinationList = ({destination, location, setCameraLocation, loadMoreDestinations, searchADA, searchUnisex, handleFilter, fitCameraBounds, setStepIndex, gettingDirections, mapBoxJson, setNavigating, setGettingDirections, setMapBoxJson, setRoute, navigating, profile, setProfile, refreshingBL, fetchType, searchContent, searchSubmit, setPage, isSearching}) => {
  const bottomSheetRef = useRef(null);
  const [currentDest, setCurrentDest] = useState('');
  const [travelTime, setTravelTime] = useState<number | string>('0 hours');
  const [drivingDist, setDrivingDist] = useState('0 miles');
  const [currentETA, setCurrentETA] = useState('00:00');
  const [overview, openOverview] = useState(false)
  const [fbUsers, setFbUsers] = useState()
  const [reviews, setReviews] = useState([]);
  const [showingReviews, setShowingReviews] = useState(false);
  const [isPressing, setPressing] = useState(false);

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });
  
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
  
    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  const filteredDestinations = destination.filter(item => {
    const isAdaCompliant = searchADA ? item.accessible : true;
    const isUnisex = searchUnisex ? item.unisex : true;
    //TODO: add changing table filter
    if (!searchContent.current) {
      console.log('search undefined')
      return isAdaCompliant && isUnisex
    }
    const isSearchName = isSearching && item.name.toLowerCase().includes(searchContent.current.toLowerCase())

    if(!item.comment) {
      return isAdaCompliant && isUnisex && isSearchName
    } 

    const isSearchComment = isSearching && item.comment.toLowerCase().includes(searchContent.current.toLowerCase())
    return isAdaCompliant && isUnisex && (isSearchName || isSearchComment);
  });

  const fetchDirections = async (profile: string , start: any[], end: any[]) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&voice_instructions=true&roundabout_exits=true&banner_instructions=true&continue_straight=true&annotations=speed,duration,congestion&overview=full&geometries=geojson&access_token=${process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}`;
    console.log('directions' + url)
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
        return
      }
  }

  const fetchMatrix = async (profile: any, start: any[], end: any[]) => {
    const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?&annotations=distance,duration&access_token=${process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}`
    console.log('duration' + url)
      try {
        const response = await fetch(url);
        const json = await response.json();
        const calcTime = minuteCalc(json.durations[0][1]);
        setTravelTime(() => {
          return calcTime;
        })
        setDrivingDist(() => {
          const calcDist = mileCalc(json.distances[0][1]);
          return calcDist;
        })
        const slicedTime = Number(calcTime.slice(0,2));
        setCurrentETA(calcETA(slicedTime))
      } catch (error) {
        console.error(error);
        //TODO: add a user visibile error
      } finally {
        return
      }
  }

  const renderFooter = (props: React.JSX.IntrinsicAttributes & BottomSheetDefaultFooterProps) => (
    <BottomSheetFooter {...props}>
      <View style={styles.footerView}>
        <Pressable 
          style={styles.pressable}
          onPressOut={() => {
            bottomSheetRef.current.collapse();
          }}
          onPress={() => {
            setNavigating(true);
            setGettingDirections((wasGetting:boolean) => {
              bottomSheetRef.current.snapToIndex(1, animationConfigs);
              return !wasGetting
            });
            fetchMatrix(profile, location, [currentDest.longitude, currentDest.latitude]);
          }}
        >
          <Text style={styles.buttonText}>Start</Text>
        </Pressable>
        <Pressable 
          style={styles.pressable}
          onPress={() => {handleShare();}}
        >
          <Text style={styles.buttonText}>Share</Text>
        </Pressable>
      </View>
    </BottomSheetFooter>
  )

  const renderHeader = () => {
    return(
      <View
        style={{
          margin: 5,
          justifyContent:'space-between'
        }}
      >
        {gettingDirections ? (
          <View>
            <Pressable
              style={
                ({pressed}) => [
                  {backgroundColor: pressed ? '#999' : '#ddd'}, 
                  styles.closeContainer
                ]
              }
              onPressOut={() => {
                bottomSheetRef.current.collapse();
              }}
              onPress={() => {
                setTimeout(() => {
                  setGettingDirections((wasGetting:boolean) => {
                    bottomSheetRef.current.snapToIndex(2, animationConfigs);
                    return !wasGetting
                  });
                }, 600)
              }}
            >
              <CloseButton />
            </Pressable>
            <Text style={{fontSize: 22}}>Drive</Text>
            <View
              style={{
                justifyContent: 'space-between',
                flexDirection: 'row',
                marginTop: 10
              }}
            >
              <View style={styles.directContainer}>
                <Pressable
                  style={styles.directTab}
                  onPress={() => {
                    if(profile === 'driving') {
                      return;
                    };
                    setProfile('driving');
                    fetchDirections('driving', location, [currentDest.longitude, currentDest.latitude]);
                  }}
                >
                  <AntDesign name="car" color={'blue'} size={20} style={{marginRight:5}}/>
                  <Text>{profile === 'driving' && minuteCalc(mapBoxJson.routes[0].legs[0].duration)}</Text>
                </Pressable>
                {profile === 'driving' && <View style={styles.highlightedTab} />}
              </View>
              <View style={styles.directContainer}>
                <Pressable
                  style={styles.directTab}
                  onPress={() => {
                    if(profile === 'cycling') {
                      return;
                    };
                    setProfile('cycling');
                    fetchDirections('cycling', location, [currentDest.longitude, currentDest.latitude]);
                  }}
                >
                  <MaterialCommunityIcons name="bike" color={'blue'} size={20} style={{marginRight:5}}/>
                  <Text>{profile === 'cycling' && minuteCalc(mapBoxJson.routes[0].legs[0].duration)}</Text>
                </Pressable>
                {profile === 'cycling' && <View style={styles.highlightedTab} />}
              </View>
              <View style={styles.directContainer}>
                <Pressable
                  style={styles.directTab}
                  onPress={() => {
                    if(profile === 'walking') {
                      return;
                    };
                    setProfile('walking');
                    fetchDirections('walking', location, [currentDest.longitude, currentDest.latitude]);
                  }}
                >
                  <MaterialCommunityIcons name="walk" color={'blue'} size={20} style={{marginRight:5}}/>
                  <Text>{profile === 'walking' && minuteCalc(mapBoxJson.routes[0].legs[0].duration)}</Text>
                </Pressable>
                {profile === 'walking' && <View style={styles.highlightedTab} />}
              </View>
            </View>     
          </View>
        ) : (
          <View>
            <Pressable
              style={
                ({pressed}) => [
                  {backgroundColor: pressed ? '#999' : '#ddd'}, 
                  styles.closeContainer
                ]
              }
              onPressOut={() => {
                bottomSheetRef.current.collapse();
              }}
              /*TODO:  turn this and other variants into a reuseable function */
              onPress={() => {
                setTimeout(() => {
                  setShowingReviews(() => {
                    bottomSheetRef.current.snapToIndex(2, animationConfigs);
                    return false
                  });
                }, 600)
              }}
            >
              <CloseButton />
            </Pressable>
            <Text style={{fontSize: 22}}>Reviews</Text>
          </View>
        )}
      </View>
    )
  }
  
  
  function minuteCalc(num: number)  {
    const minutes = num/60
    if(minutes > 1440) {
      const days = minutes/1440
      return Math.ceil(days) + ' days'
    }
    if(minutes > 60) {
      const hours = minutes/60
      return Math.ceil(hours) + ' hours'
    }
    return Math.ceil(minutes) + ' min'
  }

  function mileCalc(num: number) {
    const miles = num * 0.0006213712
    if(miles > 1) {
      return miles.toFixed(1) + ' mi'
    } else {
      const feet = miles/5280
      return feet.toFixed(1) + ' ft'
    }
  }

  function calcETA(estDrivTime: number) {
    const currentTime = new Date();
    const etaTime = new Date(currentTime.getTime() + estDrivTime * 60 * 1000);
    let h = etaTime.getHours();
    let m = etaTime.getMinutes().toString().padStart(2, '0');
    if(etaTime.getHours() >= 12) {
      if(etaTime.getHours() >= 13) {
        h = h-12;
      }
      let strH = h.toString().padStart(2, '0');
      return(`${strH}:${m} PM`);
    } if(etaTime.getHours() <= 12){
      let strH = h.toString().padStart(2, '0');
      return(`${strH}:${m} AM`);
    }; 
  }

  const handleShare = async() => {
    try{
      const result = await Share.share({
        message: `${currentDest.name}, ${currentDest.street}, ${currentDest.city}, ${currentDest.state}`,
        title: 'Sharing Location'
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error:any) {
      Alert.alert(error.message);
    }
  }

  const renderDestination = ({ item }) => {
    const to = turf.point([item.longitude, item.latitude])
    const from = turf.point(location)

    var options = { units: "miles" };

    if (!item.latitude || !item.longitude) {
      console.error(`Missing coordinates for destination ID: ${item.id}`, item);
      return null; // Skip rendering this item if coordinates are missing
    }

    const calculatedDistance = turf.distance(to, from, options);

    //TODO: add actual review fucntionality
    const placeholderRatingValue = (Math.random() * 4) + 1
    const placeholderIconRandomizer = (Math.random() * 1) 
    
    return(
      <View key={item.id} style={styles.resultContainer}>
        <TouchableOpacity
          key={destination.id}
          onPress={() => {
            setCameraLocation([item.longitude, item.latitude]);
            setShowingReviews(item.id); 
            console.log(showingReviews)
            
          }}
        >
          {/*TODO: Add images of places*/}
          <Text style={styles.resultName}>{item.name}</Text>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              gap: 5
            }}
          >
            <Text>{placeholderRatingValue.toFixed(1)}</Text>
            <Rating 
              disabled={true}
              size={10} 
              rating={placeholderRatingValue}
              scale={1.1}
              style={{
                paddingBottom: 5
              }}
            />
          </View>
          <View>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                gap: 5
              }}
            >
              <MaterialCommunityIcons 
                name="wheelchair-accessibility" 
                color={'black'} 
                size={item.accessible ? 20: 0}
                disabled={true}
              />
              {/*
                this is currently random; refuge doesnt have this parameter
                TODO:Add custom implementation for filter
              */}
              <MaterialIcons
                name="family-restroom" 
                color={'black'} 
                size={placeholderIconRandomizer > 0.7 ? 20: 0}
                disabled={false}
                style={{
                  alignItems:'center'
                }}
              />

              {item.unisex ? (
                <FontAwesome6 
                name="restroom"
                color={'black'} 
                size={15}
                iconStyle={{
                  alignItems:'center'
                }}
                />
              ):(
                <></>
              )}
              {item.changing_table ? (
                <MaterialCommunityIcons 
                  name="human-baby-changing-table"
                />
              ): (
                <></>
              )}
            </View>
            
          </View>
          <Text style={styles.line}>Comment: {item.comment}</Text>
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
        </TouchableOpacity>
          
          <Text>Distance: {calculatedDistance.toFixed(2)} miles</Text>
          <Pressable 
            onPressOut={() => {
              bottomSheetRef.current.collapse();
              fetchDirections(profile, location, [item.longitude, item.latitude]);
            }}
            onPress={() => {
              fitCameraBounds(location, [item.longitude, item.latitude]);
              setStepIndex(0);
              setCurrentDest(item);
              setTimeout(() => {
                bottomSheetRef.current.snapToIndex(2);
              }, 300)
            }}
            style={styles.pressable}
          >
            <Text style={styles.buttonText}>Directions</Text>
          </Pressable>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDirections = ({ item }) => {
    const dirDistance = (item.distance * 0.0006213712).toFixed(1)

    return(
      <View 
        style={{
          flex: 1,
          flexDirection: 'column',
          marginBottom: 5
        }}
        key={item.index}
      >
        <Text style={{
          fontSize: 16,
          flexWrap: 'wrap',
          alignSelf: 'flex-start',
          marginLeft: 70
        }}>
        {item.maneuver.instruction}
        </Text>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center'
          }}
        >
          <Text
            style={{
              width: 70,
              marginRight: 5,
              fontSize: 16,
              textAlign:'center'
            }}
          >
            {dirDistance} mi
          </Text>
          <View style={{flex: 1, height: 1, backgroundColor: 'gray'}} />
        </View>
      </View>
    )
  }

  return(
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={[450, 300, 100, 30]}
      index={3}
      enablePanDownToClose={false}
      backgroundStyle={{backgroundColor: 'rgba(255, 255, 255, 0.9)'}}
      animateOnMount={true}
      footerComponent={gettingDirections ? renderFooter : undefined} 
      keyboardBehavior={'extend'}
      style={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 10,
        elevation: 5
      }}
    > 
      {navigating ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}
        >
          <Pressable
            style={{
              alignSelf:'flex-start', 
              borderRadius: 50, 
              borderColor: 'black', 
              borderStyle: 'solid', 
              borderWidth: 1
            }}
            onPressOut={() => {
              bottomSheetRef.current.collapse();
              
            }}
            onPress={() => {
              setTimeout(() => {
                setNavigating((wasNavigating:boolean) => {
                  bottomSheetRef.current.snapToIndex(1, animationConfigs);
                  return !wasNavigating
                });
              }, 600)
            }}
          >
            <AntDesign name="close" color={'black'} size={50} />
          </Pressable>
          <View style={{alignItems: 'center'}}>
            <Text style={{fontSize: 22}}>{travelTime}</Text>
            <View style={{flexDirection: 'row'}}>
              <Text>{drivingDist}</Text>
              <Text
                style={{
                  marginHorizontal: 5
                }}
              >·</Text>
              <Text>{currentETA}</Text>
            </View>
          </View>
          <View>
            <AntDesign name="close" color={'transparent'} size={50} />
          </View>
        </View>
      ): overview ? (
        <View>
          <View>
            <Text>Title</Text>
          </View>
          <Pressable
            style={
              ({pressed}) => [
                {backgroundColor: pressed ? '#999' : '#ddd'}, 
                styles.closeContainer
              ]
            }
            onPressOut={() => {
              bottomSheetRef.current.collapse();
            }}
            onPress={() => {
              setTimeout(() => {
                setGettingDirections((wasGetting:boolean) => {
                  bottomSheetRef.current.snapToIndex(2, animationConfigs);
                  return !wasGetting
                });
              }, 600)
            }}
          >
            <CloseButton />
          </Pressable>
          <Pressable
            style={styles.directTab}
            onPress={() => {
              if(profile === 'driving') {
                return;
              };
              setProfile('driving');
              fetchDirections('driving', location, [currentDest.longitude, currentDest.latitude]);
            }}
          ></Pressable>
          <View>
            <View>
              <Text>Reviews</Text>
            </View>
            
          </View>
        </View>
      ): showingReviews ? (
        <BottomSheetFlatList
          data={reviews}
          renderItem={({ item }) => <RenderReview item={item} destID={showingReviews}/>}
          ListHeaderComponent={renderHeader}
        />
      ):
      gettingDirections ? (
        <BottomSheetFlatList
          data={mapBoxJson.routes[0].legs[0].steps}
          keyExtractor={(item) => item.index}
          renderItem={renderDirections}
          ListHeaderComponent={renderHeader}
        />
      ): 
      (
        <BottomSheetFlatList
          data={filteredDestinations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDestination}
          onEndReached={() => {
            loadMoreDestinations(fetchType, searchContent.current);
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={<ActivityIndicator />}
          ListHeaderComponent={
            <SearchFilters
              handleFilter={handleFilter}
              searchADA={searchADA}
              searchUnisex={searchUnisex}
            />
          }
          refreshing={refreshingBL} 
          onRefresh={searchSubmit}
          
        />
      )}
    </BottomSheet>
  )
};

const styles = StyleSheet.create({
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
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pressable: {
    backgroundColor: '#4681f4', 
    width: '30%', 
    alignItems:'center', 
    borderRadius: 30, 
    marginTop: 8
  },
  buttonText: {
    fontSize: 16, 
    padding: 10, 
    color: 'white'
  }, 
  footerView: {
    paddingBottom: 20,
    paddingHorizontal: 0,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    backgroundColor: 'white',
    elevation: 8
  },
  directTab: {
    flexDirection: 'row',
    width: 80,
  },
  highlightedTab: {
    backgroundColor: 'blue',
    width: '70%',
    height: 5,
    borderRadius: 50,
    alignSelf: 'center'
  },
  directContainer: {
    flexDirection: 'column'
  },
  closeContainer: {
    alignSelf:'flex-end',
    padding: 3,
    opacity: .5, 
    borderRadius: 20, 
    //borderColor:'lightgray', 
    //borderStyle: 'solid', 
    //borderWidth: 1
  }, 
  pressedCloseContainer: {
    alignSelf:'flex-end',
    padding: 3,
    opacity: 1, 
    borderRadius: 20,
  }
})
export default DestinationList;