import React, { useEffect, useRef } from 'react'
import Mapbox, { Camera, LocationPuck, MapView, UserTrackingMode } from '@rnmapbox/maps';
import { View } from 'react-native';

const Map = ({location, destination, cameraLocation, route, gettingDirections, camera, zoom, navigating}) => {
  return(
    <MapView 
      style={{flex: 1, zIndex: -1}}
      compassEnabled = {true}
    >
      <Camera 
        centerCoordinate = {cameraLocation}
        zoomLevel = {zoom}
        animationMode = {'flyTo'}
        animationDuration= {2000} 
        followUserLocation = {navigating}
        followZoomLevel = {15}
        followPitch = {0}
        followUserMode={UserTrackingMode.FollowWithHeading}
        ref = {camera}
        //heading={180}//in degrees
      />
      {gettingDirections && (
        <Mapbox.ShapeSource id="routeSource" shape={{type: 'LineString', coordinates: route}}>
          <Mapbox.LineLayer id="routeLine" style={{lineColor: '#4681f4', lineWidth: 6, lineCap: 'round', lineOpacity: 1}} />
        </Mapbox.ShapeSource>
      )}
      <LocationPuck
        puckBearingEnabled = {true}
        puckBearing = 'course'
      >
      </LocationPuck>
      {/* create pointers for current results */}
      {destination.map((dest: { id: string | undefined; longitude: number; latitude: number; name: string; }) => (
        <Mapbox.PointAnnotation
          key={dest.id}
          id={`destination-${dest.id}`}
          coordinate={[dest.longitude, dest.latitude]}
        >
          <View style={{ height: 20, width: 20, backgroundColor: 'red', borderRadius: 10, borderColor: 'white', borderWidth: 1 }} />
          <Mapbox.Callout title={dest.name} />
        </Mapbox.PointAnnotation>
      ))}
    </MapView>
  )
};

export default Map;