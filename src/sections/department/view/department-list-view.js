'use client';

import orderBy from 'lodash/orderBy';
import { useState, useCallback, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { paths } from 'src/routes/paths';

import { DEPARTMENT_SORT_OPTIONS } from 'src/_mock/_department';

import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { tokenDecode } from 'src/auth/context/jwt/utils';
import axiosInstance, { endpoints } from 'src/utils/axios';

import DepartmentList from '../department-list';
import DepartmentSort from '../department-sort';
import DepartmentSearch from '../department-search';
import { useBoolean } from 'src/hooks/use-boolean';
import { LoadingButton } from '@mui/lab';
import { TextField, Typography } from '@mui/material';
import Loading from 'src/app/dashboard/loading';

// ----------------------------------------------------------------------

const defaultFilters = {
  roles: [],
  locations: [],
  benefits: [],
  experience: 'all',
  employmentTypes: [],
};

// ----------------------------------------------------------------------

export default function DepartmentListView() {
  const settings = useSettingsContext();

  const dialog = useBoolean();
  const createLoading = useBoolean();

  const [initDepartments, setInitDepartments] = useState([]);
  const [initStaffs, setInitStaffs] = useState([]);

  const [departmentName, setDepartmentName] = useState('');

  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');

  const [refresh, setRefresh] = useState(new Date());

  const [search, setSearch] = useState('');

  const dataFiltered = applyFilter({
    inputData: initDepartments,
    search,
    sortBy,
  });

  const notFound = !dataFiltered.length;

  useEffect(() => {
    const accessToken = sessionStorage.getItem('accessToken');

    const organizationId = tokenDecode(accessToken)['custom:organization_id'];

    async function getDatas() {
      try {
        setLoading(true);

        const getParams = {
          organization_id: organizationId,
        };

        const response = await axiosInstance.post(endpoints.department.list, getParams);
        const staffResponse = await axiosInstance.post(endpoints.staff.list, getParams);

        setInitDepartments(response.data.body);
        setInitStaffs(staffResponse.data.body);
      } catch (error) {
        console.log('Error occurred: ', error);
      } finally {
        setLoading(false);
      }
    }

    getDatas();
  }, [refresh]);

  const handleSortBy = useCallback((newValue) => {
    setSortBy(newValue);
  }, []);

  const handleSearch = useCallback(
    (inputValue) => {
      setSearch(inputValue.target.value);
    },
    [search]
  );

  const handleCreateDepartment = useCallback(async () => {
    try {
      createLoading.onTrue();
      const accessToken = sessionStorage.getItem('accessToken');

      const organizationId = tokenDecode(accessToken)['custom:organization_id'];
      const createDepartmentParams = {
        department: departmentName,
        organization_id: organizationId,
      };

      await axiosInstance.post(endpoints.department.create, createDepartmentParams);
      setRefresh(new Date());
      dialog.onFalse();
    } catch (error) {
    } finally {
      createLoading.onFalse();
    }
  }, [departmentName]);

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
    >
      <DepartmentSearch query={search} onSearch={handleSearch} />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <DepartmentSort sort={sortBy} onSort={handleSortBy} sortOptions={DEPARTMENT_SORT_OPTIONS} />
      </Stack>
    </Stack>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: 'Department',
            href: paths.dashboard.department.root,
          },
          { name: 'List' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => dialog.onTrue()}
          >
            New Department
          </Button>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Stack
        spacing={2.5}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {renderFilters}
      </Stack>

      {notFound && <EmptyContent filled title="No Data" sx={{ py: 10 }} />}

      <DepartmentList departments={dataFiltered} staffs={initStaffs} setRefresh={setRefresh} />
      <Dialog open={dialog.value} onClose={dialog.onFalse}>
        <DialogTitle>{`Create New Department`}</DialogTitle>

        <DialogContent sx={{ color: 'text.secondary' }}>
          <Stack width={300} mt={0}>
            <Typography variant="body2">Input new department name to below</Typography>
            <TextField
              label="New Department"
              margin="normal"
              onChange={(e) => setDepartmentName(e.target.value)}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={dialog.onFalse}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="primary"
            autoFocus
            loading={createLoading.value}
            onClick={handleCreateDepartment}
          >
            Create
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({ inputData, search, sortBy }) => {
  // SORT BY
  if (sortBy === 'latest') {
    inputData = orderBy(inputData, ['createAt'], ['desc']);
  }

  if (sortBy === 'oldest') {
    inputData = orderBy(inputData, ['createAt'], ['asc']);
  }

  if (search) {
    inputData = inputData.filter(
      (department) => department.role.toLowerCase().indexOf(search.toLowerCase()) !== -1
    );
  }

  return inputData;
};
