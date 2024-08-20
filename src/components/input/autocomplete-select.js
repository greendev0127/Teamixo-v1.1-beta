import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function CountrySelect({ countries, onCountryChange, country, error, setError }) {
  return (
    <Autocomplete
      id="country-select-demo"
      fullWidth
      options={countries}
      autoHighlight
      onChange={(e, country) => {
        onCountryChange(country);
        setError((prevError) => ({
          ...prevError,
          country: '',
        }));
      }}
      value={country}
      getOptionLabel={(option) => option.name}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <Box
            key={key}
            component="li"
            sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
            {...optionProps}
          >
            <img
              loading="lazy"
              width="20"
              srcSet={`https://flagcdn.com/w40/${option.isoCode.toLowerCase()}.png 2x`}
              src={`https://flagcdn.com/w20/${option.isoCode.toLowerCase()}.png`}
              alt=""
            />
            {option.name} ({option.isoCode}) +{option.phonecode}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Choose a country"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
          helperText={error}
          error={error ? true : false}
        />
      )}
    />
  );
}
