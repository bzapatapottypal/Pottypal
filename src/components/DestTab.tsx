import * as turf from '@turf/turf'
import { FontAwesome6, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Pressable, TouchableOpacity, View } from "react-native";
import { Rating } from '@kolking/react-native-rating';

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
        key={item.id}
        onPress={() => {
          //setCameraLocation([item.longitude, item.latitude]);
          //setShowingReviews(item.id);
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
    paddingBottom:10
  },
  highlightedTab: {
    backgroundColor: '#4b72f7',
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