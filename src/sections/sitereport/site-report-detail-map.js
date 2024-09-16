import { Typography } from '@mui/material';
import { GoogleMap, useLoadScript, MarkerF, InfoWindow } from '@react-google-maps/api';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { GOOGLE_MAP_API } from 'src/config-global';

export default function SiteReportDetailMap({ locations }) {
  const [zoom, setZoom] = useState(3);

  const [selectedMarker, setSelectedMarker] = useState(null);

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
    mapTypeId: 'hybrid',
  };

  const mapContainerStyle = {
    width: '100%',
    height: '600px',
    borderRadius: '8px', // Apply border radius here
    boxShadow: '0px 0px 1px 1px rgba(0, 0, 0, 0.1)',
  };

  if (!isLoaded) {
    return <></>;
  }

  return (
    <GoogleMap
      options={mapOptions}
      zoom={zoom}
      center={{ lat: locations[0]?.lat, lng: locations[0]?.lng }}
      mapContainerStyle={mapContainerStyle}
      onLoad={(map) => console.log('Map Loaded')}
    >
      {locations.map((item, index) => (
        <MarkerF
          key={index}
          position={{ lat: item.lat, lng: item.lng }}
          onLoad={() => console.log('Marker Loaded')}
          onClick={() => setSelectedMarker(item)}
        />
      ))}

      {selectedMarker !== null && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div>
            <Typography>Time</Typography>
            <Typography>{format(new Date(selectedMarker.time), 'dd MMM yyyy HH:mm')}</Typography>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
