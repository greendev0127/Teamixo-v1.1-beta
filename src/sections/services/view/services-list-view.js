'use client';

import orderBy from 'lodash/orderBy';
import { useState, useCallback, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { fTimestamp } from 'src/utils/format-time';

import { SERVICE_TYPE_OPTIONS } from 'src/_mock';
import { SERVICE_SORT_OPTIONS } from 'src/_mock';

import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import ServiceList from '../service-list';
import ServiceSort from '../service-sort';
import ServiceFilters from '../service-filters';
import ServiceSearch from '../service-search';
import ServiceFiltersResult from '../service-filters-result';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { tokenDecode } from 'src/auth/context/jwt/utils';
import Loading from 'src/app/dashboard/loading';
import { filter, isEqual } from 'lodash';

// ----------------------------------------------------------------------

const defaultFilters = {
  type: 'all',
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function ServiceListView() {
  const settings = useSettingsContext();

  const openFilters = useBoolean();

  const [initServices, setInitServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest');
  const [refresh, setRefresh] = useState(new Date());

  const [search, setSearch] = useState({
    query: '',
    results: [],
  });

  const [pageNumber, setPageNumber] = useState(1);

  const [filters, setFilters] = useState(defaultFilters);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const dataFiltered = applyFilter({
    inputData: initServices,
    filters,
    sortBy,
    dateError,
  });

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = !dataFiltered.length;

  useEffect(() => {
    const accessToken = sessionStorage.getItem('accessToken');

    const organizationId = tokenDecode(accessToken)['custom:organization_id'];

    async function getServices() {
      try {
        setLoading(true);
        const response = await axiosInstance.post(endpoints.services.list, {
          organizationId: organizationId,
        });

        setInitServices(response.data.body);
      } catch (error) {
        console.log('Error occurred: ', error);
      } finally {
        setLoading(false);
      }
    }

    getServices();
  }, [refresh]);

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleSortBy = useCallback((newValue) => {
    setSortBy(newValue);
  }, []);

  const handleSetPageNumber = useCallback((newValue) => {
    setPageNumber(newValue);
  }, []);

  const handleSearch = useCallback(
    (inputValue) => {
      setSearch((prevState) => ({
        ...prevState,
        query: inputValue,
      }));

      if (inputValue) {
        const results = initServices.filter(
          (tour) => tour.name.toLowerCase().indexOf(search.query.toLowerCase()) !== -1
        );

        setSearch((prevState) => ({
          ...prevState,
          results,
        }));
      }
    },
    [search.query]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
    >
      <ServiceSearch
        query={search.query}
        results={search.results}
        onSearch={handleSearch}
        hrefItem={(id) => paths.dashboard.service.details(id)}
      />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <ServiceFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          //
          filters={filters}
          onFilters={handleFilters}
          //
          canReset={canReset}
          onResetFilters={handleResetFilters}
          //
          typeOptions={['all', ...SERVICE_TYPE_OPTIONS.map((option) => option.label)]}
          //
          dateError={dateError}
        />

        <ServiceSort sort={sortBy} onSort={handleSortBy} sortOptions={SERVICE_SORT_OPTIONS} />
      </Stack>
    </Stack>
  );

  const renderResults = (
    <ServiceFiltersResult
      filters={filters}
      onResetFilters={handleResetFilters}
      //
      canReset={canReset}
      onFilters={handleFilters}
      //
      results={dataFiltered.length}
    />
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
            name: 'Service',
            href: paths.dashboard.service.root,
          },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.service.create}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Service
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

        {canReset && renderResults}
      </Stack>

      {notFound && <EmptyContent title="No Data" filled sx={{ py: 10 }} />}

      <ServiceList
        services={dataFiltered}
        onChangePage={handleSetPageNumber}
        page={pageNumber}
        setRefresh={setRefresh}
      />
    </Container>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({ inputData, filters, sortBy, dateError }) => {
  const { startDate, endDate, type } = filters;

  // SORT BY
  if (sortBy === 'latest') {
    inputData = orderBy(inputData, ['createAt'], ['desc']);
  }

  if (sortBy === 'oldest') {
    inputData = orderBy(inputData, ['createAt'], ['asc']);
  }

  // FILTERS
  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (service) =>
          fTimestamp(service.createAt) >= fTimestamp(startDate) &&
          fTimestamp(service.createAt) <= fTimestamp(endDate)
      );
    }
  }

  if (type !== 'all') {
    inputData = inputData.filter((service) =>
      type === 'Remote' ? service.remote : !service.remote
    );
  }

  return inputData;
};
