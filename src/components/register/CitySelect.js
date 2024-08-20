import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function CitySelect({ cities, onCityChange }) {
  return (
    <Autocomplete
      id="city-select-demo"
      fullWidth
      options={cities}
      autoHighlight
      onChange={(e, city) => {
        onCityChange(city);
      }}
      getOptionLabel={(option) => option.name}
      renderOption={(props, option, index) => {
        const { key, ...optionProps } = props;
        return (
          <Box
            key={`city+${index.index}`}
            component="li"
            sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
            {...optionProps}
          >
            {option.name}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Choose a city (optional)"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
}
