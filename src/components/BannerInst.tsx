import React from "react";
import { FlatList, Text, View } from "react-native";

const BannerInst = ({mapBoxJson, bannerLoading}) => {
  if(bannerLoading) {
    console.log('loading')
    console.log(mapBoxJson)
    return (
      <View>
        <Text>no banner</Text>
      </View>
    )
  }
  if (mapBoxJson === null) {
    console.log(mapBoxJson.length)
    return(
      <View>
        <Text>No data available.</Text>
      </View>
    )
  }
  console.log(mapBoxJson)
  return(
    <View>
      {mapBoxJson && (
        <>
          {mapBoxJson.routes[0].legs[0].steps.map((step, index) => (
            <Text key={index}>
              {step.maneuver.instruction}
            </Text>
          ))}
        </>
      )}
    </View>
  )   
}

export default BannerInst
