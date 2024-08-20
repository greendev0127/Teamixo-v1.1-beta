import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { GoogleMap, useLoadScript, MarkerF, Autocomplete, MapTypeId } from '@react-google-maps/api';
import { GOOGLE_MAP_API } from 'src/config-global';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { error } from 'src/theme/palette';

export default function ServiceMap({ setServiceInfo, serviceInfo, addressError, setError }) {
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [address, setAddress] = useState('');
  const [zoom, setZoom] = useState(11);

  useEffect(() => {
    if (serviceInfo.lat) {
      setLocation({ lat: serviceInfo.lat, lng: serviceInfo.lng });
      setAddress(serviceInfo.address);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }, [serviceInfo]);

  const getAddress = (lat, lng) =>
    new Promise((resolve, reject) => {
      const latlng = new google.maps.LatLng(lat, lng);
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ latLng: latlng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve('No results found');
          }
        } else {
          reject(new Error(`Geocoder failed due to: ${status}`));
        }
      });
    });

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
    MapTypeId: 'satellite',
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: 1.0, // Style of the control
      position: 3.0, // Position of the control
      mapTypeIds: ['roadmap', 'satellite'], // Map types available
    },
  };

  const onMapClick = React.useCallback(
    async (event) => {
      setLocation({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
      const address = await getAddress(event.latLng.lat(), event.latLng.lng());
      setServiceInfo({
        ...serviceInfo,
        address: address,
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
      setError({
        ...error,
        address: '',
      });
      setAddress(address);
    },
    [setServiceInfo, setError, serviceInfo, error]
  );

  const autocompleteRef = useRef(null);

  const onPlaceChanged = React.useCallback(
    async (event) => {
      if (autocompleteRef.current) {
        const place = autocompleteRef.current.getPlace();
        setLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        const address = await getAddress(
          place.geometry.location.lat(),
          place.geometry.location.lng()
        );
        setServiceInfo({
          ...serviceInfo,
          address: address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
        setError({
          ...error,
          address: '',
        });
        setAddress(address);
        setZoom(16);
      }
    },
    [setServiceInfo, setError, serviceInfo, error]
  );

  const mapContainerStyle = {
    width: '100%',
    height: '324px',
    borderRadius: '8px', // Apply border radius here
    boxShadow: '0px 0px 1px 1px rgba(0, 0, 0, 0.1)',
  };

  const renderAutocomplete = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        top: 8,
        left: 8,
        zIndex: 9,
        borderRadius: 1,
        position: 'absolute',
        typography: 'subtitle2',
      }}
    >
      <Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={onPlaceChanged}
        className="sm:col-span-2"
      >
        <TextField
          name="address"
          placeholder="Search address ..."
          size="small"
          sx={{
            border: '1px solid #94A8D0',
            borderRadius: 1,
            bgcolor: '#0090cd90',
            width: '300px',
          }}
          className="custom-map-autocomplete-input"
        />
      </Autocomplete>
    </Stack>
  );

  if (!isLoaded) {
    return <></>;
  }

  return (
    <Stack spacing={0.5} direction="column">
      <Stack flexGrow={1} sx={{ position: 'relative' }}>
        {renderAutocomplete}
        <GoogleMap
          options={mapOptions}
          zoom={zoom}
          center={location}
          mapContainerStyle={mapContainerStyle}
          onLoad={(map) => console.log('Map Loaded')}
          onClick={onMapClick}
        >
          <MarkerF position={location} onLoad={() => console.log('Marker Loaded')} />
        </GoogleMap>
      </Stack>
      <Typography variant="body2">{address}</Typography>
      <Typography variant="caption" color="#FF5630">
        {addressError}
      </Typography>
    </Stack>
  );
}
