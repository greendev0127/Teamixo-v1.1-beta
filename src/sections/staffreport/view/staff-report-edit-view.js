'use client';

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { _userList } from 'src/_mock';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import axiosInstance, { endpoints } from 'src/utils/axios';
import Loading from 'src/app/dashboard/loading';

import { tokenDecode } from 'src/auth/context/jwt/utils';
import StaffReportNewEditForm from '../staff-report-new-edit-form';

// ----------------------------------------------------------------------

export default function StaffReportEditView({ id }) {
  const settings = useSettingsContext();

  const loading = useBoolean();

  const [currentTrack, setCurrentTrack] = useState(null);

  useEffect(() => {
    let available = {
      startDate: null,
      breakDate: null,
      restartDate: null,
      endDate: null,
    };
    const accessToken = sessionStorage.getItem('accessToken');

    const organizationId = tokenDecode(accessToken)['custom:organization_id'];

    async function getTractData() {
      try {
        loading.onTrue();
        const getTrackParams = {
          table_name: `record_${organizationId}`,
          track_id: Number(id),
        };

        const response = await axiosInstance.post(endpoints.report.gettrack, getTrackParams);

        response.data.tracks.map((item) => {
          available[item.status + 'Date'] = item.start_date;
        });

        setCurrentTrack({
          staff: response.data.staff,
          service: response.data.service,
          available: available,
        });
      } catch (error) {
        console.log(error);
      } finally {
        loading.onFalse();
      }
    }
    getTractData();
  }, []);

  if (loading.value) {
    return <Loading />;
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
            name: 'Report',
            href: paths.dashboard.staff.root,
          },
          { name: id },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <StaffReportNewEditForm currentReport={currentTrack} track_id={id} />
    </Container>
  );
}

StaffReportEditView.propTypes = {
  id: PropTypes.string,
};
