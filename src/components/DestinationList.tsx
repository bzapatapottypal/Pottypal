import React from 'react';
import { Text, View, StyleSheet, ScrollView, Dimensions, TouchableOpacity, ActivityIndicator, FlatList, Pressable } from 'react-native';
import * as turf from '@turf/turf'
import SearchFilters from './SearchFilters';

const DestinationList = ({destination, location, setCameraLocation, loadMoreDestinations, searchADA, searchUnisex, handleFilter, fetchDirections}) => {
  const filteredDestinations = destination.filter(item => {
    const isAdaCompliant = searchADA ? item.accessible : true;
    const isUnisex = searchUnisex ? item.unisex : true;
    return isAdaCompliant && isUnisex;
  });

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
            // Update cameraLocation to snap to the clicked destination's coordinates
            setCameraLocation([item.longitude, item.latitude]);
            //fetchDirections('driving', location, [item.longitude, item.latitude]);
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
            <Text></Text>
            <Text></Text>
          </View>
          <Text style={styles.line}>Comment: {item.comment}</Text>
          <Text>Distance: {calculatedDistance.toFixed(2)} miles</Text>
          <Pressable 
            onPress={() => {
              fetchDirections('driving', location, [item.longitude, item.latitude]);
              setCameraLocation([item.longitude, item.latitude]);
            }}
            style={{backgroundColor: '#4681f4', width: '30%', alignItems:'center', borderRadius:30, marginTop: 8}}
          >
            <Text style={{fontSize: 16, padding: 10}}>Directions</Text>
          </Pressable>
        </TouchableOpacity>
      </View>
    );
  };
  

  return (
    <FlatList
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
  );
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
})
export default DestinationList;