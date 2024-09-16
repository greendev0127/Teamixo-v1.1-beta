'use client';

import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';

import { useBoolean } from 'src/hooks/use-boolean';
import Loading from 'src/app/dashboard/loading';
import axiosInstance, { endpoints } from 'src/utils/axios';
import SiteReportDetailMap from '../site-report-detail-map';

// ----------------------------------------------------------------------

export default function SiteReportDetailsView({ id }) {
  const settings = useSettingsContext();

  const loading = useBoolean();

  const [locations, setLocations] = useState([]);

  useEffect(() => {
    try {
      loading.onTrue();

      async function getLocationData() {
        const locationData = await axiosInstance.post(endpoints.report.getlocation, { id });
        console.log(locationData);
        setLocations(locationData.data.Item.locations);
      }

      getLocationData();
    } catch (error) {
      console.log('Error is occurred in get location data: ', error.message);
    } finally {
      loading.onFalse();
    }
  }, []);

  if (loading.value) {
    <Loading />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <SiteReportDetailMap locations={locations} />
    </Container>
  );
}

SiteReportDetailsView.propTypes = {
  id: PropTypes.string,
};
