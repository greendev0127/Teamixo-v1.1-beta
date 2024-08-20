'use client';

import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _tours } from 'src/_mock';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import { useBoolean } from 'src/hooks/use-boolean';
import { useEffect, useState } from 'react';
import axiosInstance, { endpoints } from 'src/utils/axios';
import Loading from 'src/app/dashboard/loading';
import ServiceNewEditForm from '../service-new-edit-form';

// ----------------------------------------------------------------------

export default function ServiceEditView({ id }) {
  const settings = useSettingsContext();

  const loading = useBoolean();

  const [service, setService] = useState(null);

  useEffect(() => {
    async function getService() {
      try {
        loading.onTrue();
        const getParam = {
          id: id,
        };

        const service = await axiosInstance.post(endpoints.services.get, getParam);

        setService(service.data.service.Item);
      } catch (error) {
        console.log('Error occurred: ', error);
      } finally {
        loading.onFalse();
      }
    }

    getService();
  }, [id]);

  if (loading.value) {
    <Loading />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Service',
            href: paths.dashboard.service.root,
          },
          { name: service?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <ServiceNewEditForm currentService={service} />
    </Container>
  );
}

ServiceEditView.propTypes = {
  id: PropTypes.string,
};
