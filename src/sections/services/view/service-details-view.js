'use client';

import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { SERVICE_DETAILS_TABS } from 'src/_mock';

import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';

import { useBoolean } from 'src/hooks/use-boolean';
import Loading from 'src/app/dashboard/loading';
import axiosInstance, { endpoints } from 'src/utils/axios';
import ServiceDetailsToolbar from '../service-details-toolbar';
import ServiceDetailsContent from '../service-details-content';

// ----------------------------------------------------------------------

export default function ServiceDetailsView({ id }) {
  const settings = useSettingsContext();

  const [loading, setLoading] = useState(false);

  const [currentService, setCurrentService] = useState(null);

  const [currentTab, setCurrentTab] = useState('content');

  useEffect(() => {
    async function getService() {
      try {
        setLoading(true);
        const getParam = {
          id: id,
        };

        const service = await axiosInstance.post(endpoints.services.get, getParam);

        setCurrentService(service.data.service.Item);
      } catch (error) {
        console.log('Error occurred: ', error);
      } finally {
        setLoading(false);
      }
    }

    getService();
  }, [id]);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {SERVICE_DETAILS_TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={tab.value === 'bookers' ? <Label variant="filled">{'pending feature'}</Label> : ''}
          disabled={tab.value === 'bookers'}
        />
      ))}
    </Tabs>
  );

  if (loading) {
    <Loading />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <ServiceDetailsToolbar
        backLink={paths.dashboard.service.root}
        editLink={paths.dashboard.service.edit(`${currentService?.id}`)}
        liveLink="#"
      />
      {renderTabs}

      {currentTab === 'content' && <ServiceDetailsContent service={currentService} />}

      {/* {currentTab === 'bookers' && <TourDetailsBookers bookers={currentTour?.bookers} />} */}
    </Container>
  );
}

ServiceDetailsView.propTypes = {
  id: PropTypes.string,
};
