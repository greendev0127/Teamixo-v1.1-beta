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

import StaffNewEditForm from '../staff-new-edit-form';
import { tokenDecode } from 'src/auth/context/jwt/utils';

// ----------------------------------------------------------------------

export default function StaffEditView({ id }) {
  const settings = useSettingsContext();

  const loading = useBoolean();

  const [staff, setStaff] = useState(null);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const accessToken = sessionStorage.getItem('accessToken');

    const organizationId = tokenDecode(accessToken)['custom:organization_id'];

    async function getStaff() {
      try {
        loading.onTrue();

        const getParam = {
          id: id,
        };

        const getDepartmentParam = {
          organization_id: organizationId,
        };

        const response = await axiosInstance.post(endpoints.department.list, getDepartmentParam);
        const staff = await axiosInstance.post(endpoints.staff.get, getParam);

        setDepartments(response.data.body);
        setStaff(staff.data.staff.Item);
      } catch (error) {
        console.log('Error occurred: ', error);
      } finally {
        loading.onFalse();
      }
    }

    getStaff();
  }, [id]);

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
            name: 'Staff',
            href: paths.dashboard.staff.root,
          },
          { name: staff?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <StaffNewEditForm currentUser={staff} departmentData={departments} />
    </Container>
  );
}

StaffEditView.propTypes = {
  id: PropTypes.string,
};
