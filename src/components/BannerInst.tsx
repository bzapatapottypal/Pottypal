import { AntDesign, EvilIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Text, View, StyleSheet, Modal, Pressable } from "react-native";

const BannerInst = ({mapBoxJson, bannerLoading, showBanner, setShowBanner, setGettingDirections}) => {
  if(!showBanner) {
    return
  }
  if(bannerLoading) {
    return(
      <View style={styles.dropdownContainer}>
        <View style={styles.dropdown}>
          <Text style={styles.dropdownText}>...loading</Text>
        </View>
      </View>
    ) 
  }
  if (mapBoxJson === null) {
    return(
      <View style={styles.dropdownContainer}>
        <View style={styles.dropdown}>
          <Text style={styles.dropdownText}>No directions available.</Text>
        </View>
      </View>
    )
  }
  return(
    <View 
      style={styles.dropdownContainer}
    >
      {mapBoxJson && (
        <View style={styles.dropdown}>
          <Pressable
            style={{alignSelf:'flex-end', borderRadius: 20, borderColor:'red', borderStyle: 'solid', borderWidth: 1,}}
            onPressOut={() => {
              setShowBanner(!showBanner)
              setGettingDirections(false)
            }}
          >
            <AntDesign
              name="close"
              color={'red'}
              size={20}
            >
            </AntDesign>
          </Pressable>
          {mapBoxJson.routes[0].legs[0].steps.map((step, index) => (
            <Text key={index} style={styles.dropdownText}>
              {step.maneuver.instruction}
            </Text>
          ))}
        </View>
      )}
    </View>
  )   
}
const styles = StyleSheet.create({
  dropdownContainer: {
    position: 'relative',
  },
  dropdown: {
    display: 'flex',
    position: 'absolute',
    top: '100%',
    backgroundColor: 'rgba(40,40,40, .8)',
    margin: 20,
    padding: 20,
    width: '70%'
    //TODO: limit the height and make scrollable
  },
  dropdownText: {
    margin: 7,
    color: 'rgb(255,255,255)', 
    fontSize: 16
  }
})
export default BannerInst
