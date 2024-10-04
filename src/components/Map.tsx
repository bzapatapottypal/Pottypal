import React from 'react'
import Mapbox from '@rnmapbox/maps';
import { View } from 'react-native';

const Map = ({location, destination, cameraLocation, setCameraLocation }) => {
  return(
    <Mapbox.MapView style={{flex: 1}}>
        <Mapbox.Camera 
            centerCoordinate= {cameraLocation}
            zoomLevel= {10}
            animationMode={'flyTo'} // Smooth camera movement
            animationDuration={2000} // Duration of the camera snap
        />
        <Mapbox.PointAnnotation
          id='current location'
          coordinate={location}
        >
          <View style={{ height: 30, width: 30, backgroundColor: 'blue', borderRadius: 15, borderColor: 'white', borderWidth: 2 }} />
          <Mapbox.Callout title="You are here!" /> 
        </Mapbox.PointAnnotation>
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
      </Mapbox.MapView>
  )
};

export default Map;