'use client';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TextField } from '@mui/material';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { LoadingButton } from '@mui/lab';

import { City, Country } from 'country-state-city';
import { useEffect, useState } from 'react';
import PhoneInput from 'react-phone-input-2';

import 'react-phone-input-2/lib/material.css';

import CountrySelect from 'src/components/register/CountrySelect';
import CitySelect from 'src/components/register/CitySelect';
import axios from 'axios';
import { validateEmail } from 'src/utils/validate-email';
import { REGISTER_STEP } from 'src/constant/common';

// ----------------------------------------------------------------------

export default function JwtCompanyView({ setRegisterStep, setCompanyData }) {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  const [country, setCountry] = useState(null);
  const [city, setCity] = useState(null);
  const [phone, setPhone] = useState(null);
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [addressSec, setAddressSec] = useState('');
  const [postCode, setPostCode] = useState('');

  const [error, setError] = useState({
    email: '',
    companyName: '',
    country: '',
  });

  useEffect(() => {
    let countries = Country.getAllCountries();

    setCountries(countries);

    async function getIpInfo() {
      const IpInfo = await axios.get('https://ipapi.co/json');

      const country = Country.getCountryByCode(IpInfo.data.country_code);

      let cities = [];

      if (country) {
        cities = City.getCitiesOfCountry(country.isoCode);
      }

      setCountry(Country.getCountryByCode(IpInfo.data.country_code));
      setCities(cities);
    }

    getIpInfo();
  }, []);

  function validationCheck(email, companyName, country) {
    let hasError = false;

    setError((prevError) => ({
      ...prevError,
      email: !email.trim()
        ? 'Email is required'
        : !validateEmail(email)
        ? 'Email format is not correct'
        : '',
      companyName: !companyName.trim() ? 'Company name is required.' : '',
      country: !country ? 'Country is required' : '',
    }));

    if (!email.trim() || !validateEmail(email) || !companyName.trim() || !country) {
      hasError = true;
    }

    return hasError;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    if (validationCheck(email, companyName, country)) {
      return;
    }

    const companyData = {
      email: email,
      name: companyName,
      city: city?.name || null,
      country: country.name,
      currency: country.currency,
      timeZone: country.timezones[0].zoneName,
      address: address,
      address_sec: addressSec,
      postCode: postCode,
      telePhone: phone,
    };

    setCompanyData(companyData);
    setRegisterStep(REGISTER_STEP.PROFILE);
  };

  const handleChangeCountry = (countryData) => {
    setCountry(countryData);

    let cities = [];
    if (countryData) {
      cities = City.getCitiesOfCountry(countryData.isoCode);
    }
    setCities(cities);
  };

  const handleChangeCity = (cityData) => {
    setCity(cityData);
  };

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
    setError((prevError) => ({
      ...prevError,
      email: '',
    }));
  };

  const handleChangeCompanyName = (e) => {
    setCompanyName(e.target.value);
    setError((prevError) => ({
      ...prevError,
      companyName: '',
    }));
  };

  const handleChangePosetCode = (e) => {
    setPostCode(e.target.value);
  };

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 3, position: 'relative' }}>
      <Typography variant="h4">Company Information</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2"> Already have an account? </Typography>

        <Link href={paths.auth.jwt.login} component={RouterLink} variant="subtitle2">
          Sign in
        </Link>
      </Stack>
    </Stack>
  );

  const renderTerms = (
    <Typography
      component="div"
      sx={{
        color: 'text.secondary',
        mt: 2.5,
        typography: 'caption',
        textAlign: 'center',
      }}
    >
      {'By signing up, I agree to '}
      <Link underline="always" color="text.primary">
        Terms of Service
      </Link>
      {' and '}
      <Link underline="always" color="text.primary">
        Privacy Policy
      </Link>
      .
    </Typography>
  );

  const renderForm = (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2.5}>
        <TextField
          size="medium"
          id="company_email"
          label="Company Email"
          onChange={handleChangeEmail}
          helperText={error.email}
          error={error.email ? true : false}
        />
        <TextField
          id="company_name"
          label="Company Name"
          fullWidth
          onChange={handleChangeCompanyName}
          helperText={error.companyName}
          error={error.companyName ? true : false}
        />
        <CountrySelect
          countries={countries}
          onCountryChange={handleChangeCountry}
          country={country}
          error={error.country}
          setError={setError}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <CitySelect cities={cities} onCityChange={handleChangeCity} />
          <TextField
            id="postcode"
            label="Post code (optional)"
            fullWidth
            onChange={handleChangePosetCode}
          />
        </Stack>
        <TextField
          id="address"
          label="Address line 1 (optional)"
          onChange={(e) => setAddress(e.target.value)}
        />
        <TextField
          id="address_sec"
          label="Address line 2 (optional)"
          onChange={(e) => setAddressSec(e.target.value)}
        />
        <PhoneInput
          onChange={(phone) => setPhone(phone)}
          country={country?.isoCode.toLowerCase()}
          specialLabel="Telephone"
          inputStyle={{
            paddingTop: '15.5px',
            paddingBottom: '15.5px',
            width: '100%',
            borderColor: '#CACACA75',
          }}
        />

        <LoadingButton variant="contained" size="large" color="inherit" type="submit">
          Submit
        </LoadingButton>
      </Stack>
    </form>
  );

  return (
    <>
      {renderHead}

      {renderForm}

      {renderTerms}
    </>
  );
}
