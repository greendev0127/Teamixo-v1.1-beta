import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { GOOGLE_MAP_API } from 'src/config-global';

export default function ServiceDetailsMap({ lat, lng }) {
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [zoom, setZoom] = useState(16);

  useEffect(() => {
    setLocation({
      lat: lat,
      lng: lng,
    });
  }, [lat, lng]);

  const libraries = ['places'];
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAP_API,
    libraries: libraries,
  });

  const mapOptions = {
    disableDefaultUI: true,
    clickableIcons: true,
    scrollwheel: true,
    draggableCursor: 'pointer', // changes cursor to pointer
    draggingCursor: 'move',
    mapTypeId: 'satellite',
  };

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '8px', // Apply border radius here
    boxShadow: '0px 0px 1px 1px rgba(0, 0, 0, 0.1)',
  };

  if (!isLoaded || !location.lat) {
    return <></>;
  }

  return (
    <GoogleMap
      options={mapOptions}
      zoom={zoom}
      center={location}
      mapContainerStyle={mapContainerStyle}
      onLoad={(map) => console.log('Map Loaded')}
    >
      <MarkerF position={location} onLoad={() => console.log('Marker Loaded')} />
    </GoogleMap>
  );
}
