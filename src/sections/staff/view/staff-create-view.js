'use client';

import { useEffect, useState } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import Loading from 'src/app/dashboard/loading';
import StaffNewEditForm from '../staff-new-edit-form';

import { useBoolean } from 'src/hooks/use-boolean';
import { tokenDecode } from 'src/auth/context/jwt/utils';
import axiosInstance, { endpoints } from 'src/utils/axios';

// ----------------------------------------------------------------------

export default function StaffCreateView() {
  const settings = useSettingsContext();
  const loadingData = useBoolean();

  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const accessToken = sessionStorage.getItem('accessToken');

    const organizationId = tokenDecode(accessToken)['custom:organization_id'];

    async function getDepartmentData() {
      try {
        loadingData.onTrue();

        const getParams = {
          organization_id: organizationId,
        };

        const response = await axiosInstance.post(endpoints.department.list, getParams);

        setDepartments(response.data.body);
      } catch (error) {
        console.log('Error occurred: ', error);
      } finally {
        loadingData.onFalse();
      }
    }

    getDepartmentData();
  }, []);

  if (loadingData.value) {
    return <Loading />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new staff"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Staff',
            href: paths.dashboard.staff.root,
          },
          { name: 'New staff' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <StaffNewEditForm departmentData={departments} />
    </Container>
  );
}
