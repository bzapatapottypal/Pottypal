import React, { useRef, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Pressable, Share, Alert, Easing } from 'react-native';
import * as turf from '@turf/turf'
import SearchFilters from './SearchFilters';
import BottomSheet, { BottomSheetFlatList, useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet'
import { AntDesign } from '@expo/vector-icons';

const DestinationList = ({destination, location, setCameraLocation, loadMoreDestinations, searchADA, searchUnisex, handleFilter, fetchDirections, fitCameraBounds, setStepIndex, gettingDirections, mapBoxJson, setNavigating, setGettingDirections}) => {
  const bottomSheetRef = useRef(null);
  const [currentDest, setCurrentDest] = useState('')

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  const filteredDestinations = destination.filter(item => {
    const isAdaCompliant = searchADA ? item.accessible : true;
    const isUnisex = searchUnisex ? item.unisex : true;
    return isAdaCompliant && isUnisex;
  });

  function minuteCalc(num: number)  {
    const minutes = num/60
    if(minutes > 60) {
      const hours = minutes/60
      return Math.ceil(hours) + 'hours'
    }
    return Math.ceil(minutes)
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
    
    return(
      <View key={item.id} style={styles.resultContainer}>
        <TouchableOpacity
          key={destination.id}
          onPress={() => {
            setCameraLocation([item.longitude, item.latitude]);
          }}
        >
          {/*TODO: Add images of places*/}
          <Text style={styles.resultName}>{item.name}</Text>
          <Text style={styles.line}>Rating: {
            item.upvote - item.downvote > 0 
            ? `${item.upvote - item.downvote}`
            :item.upvote - item.downvote < 0
            ? `${item.upvote - item.downvote}`
            : '0'
          }
          </Text>     
          <View>
            <Text style={styles.line}>Unisex: {item.unisex ? 'Yes' : 'No'}</Text>
            <Text style={styles.line}>ADA Accessible: {item.accessible ? 'Yes' : 'No'}</Text>
            <Text style={styles.line}>Changing Table: {item.changing_table ? 'Yes' : 'No'}</Text>
          </View>
          <Text style={styles.line}>Comment: {item.comment}</Text>
          <Text>Distance: {calculatedDistance.toFixed(2)} miles</Text>
          <Pressable 
            onPressOut={() => {
              bottomSheetRef.current.collapse();
            }}
            onPress={() => {
              fetchDirections('driving', location, [item.longitude, item.latitude]);
              fitCameraBounds(location, [item.longitude, item.latitude]);
              setStepIndex(0);
              setCurrentDest(item)
              setTimeout(() => {
                bottomSheetRef.current.snapToIndex(1);
              }, 600)
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
    const manueverDistance = (item.distance * 0.0006213712).toFixed(1)

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
            {manueverDistance} mi
          </Text>
          <View style={{flex: 1, height: 1, backgroundColor: 'gray'}} />
        </View>
      </View>
    )
  }

  return(
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={[450, 300, 30]}
      index={1}
      enablePanDownToClose={false}
      backgroundStyle={{backgroundColor: 'rgba(255, 255, 255, 0.9)'}}
      animateOnMount={true}
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
      {gettingDirections ? (
        <BottomSheetFlatList
          data={mapBoxJson.routes[0].legs[0].steps}
          keyExtractor={(item) => item.index}
          renderItem={renderDirections}
          ListFooterComponent={
            <View style={{
              flex: 1,
              marginBottom: 30,
              flexDirection: 'row',
              gap: 10
            }}>
              <Pressable 
                style={styles.pressable}
                onPress={() => {
                  setNavigating(true);
                  bottomSheetRef.current.collapse();
                }}
              >
                <Text style={styles.buttonText}>Start</Text>
              </Pressable>
              <Pressable 
                style={styles.pressable}
                onPress={() => {
                  handleShare();
                }}
              >
                <Text style={styles.buttonText}>Share</Text>
              </Pressable>
            </View>
          }
          ListHeaderComponent={
            <View style={{margin: 5}}>
              <Pressable
                style={{
                  alignSelf:'flex-end', 
                  borderRadius: 20, 
                  borderColor:'red', 
                  borderStyle: 'solid', 
                  borderWidth: 1
                }}
                onPressOut={() => {
                  bottomSheetRef.current.collapse();
                }}
                onPress={() => {
                  setTimeout(() => {
                    setGettingDirections((wasGetting:boolean) => {
                      bottomSheetRef.current.snapToIndex(1, animationConfigs);
                      return !wasGetting
                    });
                  }, 600)
                }}
              >
                <AntDesign name="close" color={'red'} size={20} />
              </Pressable>
              <Text style={{fontSize: 22}}>Drive</Text>
              <Text>Time: {minuteCalc(mapBoxJson.routes[0].legs[0].duration)} min</Text>
            </View>
          }
        />
      ) : (
        <BottomSheetFlatList
          data={filteredDestinations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDestination}
          onEndReached={loadMoreDestinations}
          onEndReachedThreshold={0.5}
          ListFooterComponent={<ActivityIndicator />}
          ListHeaderComponent={
            <SearchFilters
              handleFilter={handleFilter}
              searchADA={searchADA}
              searchUnisex={searchUnisex}
            />
          }
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
  }
})
export default DestinationList;