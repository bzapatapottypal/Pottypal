import React from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";

const BannerInst = ({mapBoxJson, bannerLoading}) => {
  if(bannerLoading) {
    return (
      <View style={styles.dropdown}>
        <Text>loading</Text>
      </View>
    )
  }
  if (mapBoxJson === null) {
    console.log(mapBoxJson.length)
    return(
      <View style={styles.dropdown}>
        <Text>No data available.</Text>
      </View>
    )
  }
  console.log(mapBoxJson)
  return(
    <View style={styles.dropdown}>
      {mapBoxJson && (
        <View style={{backgroundColor: 'rgba(225,225,225, 0)'}}>
          {mapBoxJson.routes[0].legs[0].steps.map((step, index) => (
            <Text key={index}>
              {step.maneuver.instruction}
            </Text>
          ))}
        </View>
      )}
    </View>
  )   
}
const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: 'rgba(225,225,225, 0.1)',
    elevation: 5,
    padding: 20,
  },
})
export default BannerInst
