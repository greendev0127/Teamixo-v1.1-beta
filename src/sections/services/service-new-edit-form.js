import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useResponsive } from 'src/hooks/use-responsive';

import { MenuItem, Radio, RadioGroup, Select, TextField } from '@mui/material';
import ServiceMap from './service-map';
import { useEffect, useState } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import { tokenDecode } from 'src/auth/context/jwt/utils';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useStore } from 'src/store/commonStore';
import { NOTIFICATION_TYPE } from 'src/constant/common';

// ----------------------------------------------------------------------

export default function ServiceNewEditForm({ currentService }) {
  const router = useRouter();

  const { user } = useAuthContext();
  const { setNotification } = useStore();

  const organization_id = tokenDecode(user.accessToken)['custom:organization_id'];
  const mdUp = useResponsive('up', 'md');

  const [loading, setLoading] = useState(false);

  const [serviceInfo, setServiceInfo] = useState({
    name: '',
    description: '',
    lat: null,
    lng: null,
    address: '',
    roundTime: 5,
    range: 500,
    remote: 'remote',
  });

  const [error, setError] = useState({
    name: '',
    description: '',
    address: '',
    range: '',
  });

  useEffect(() => {
    if (currentService?.id) {
      setServiceInfo({
        name: currentService.name,
        description: currentService.description,
        lat: currentService.lat,
        lng: currentService.lng,
        address: currentService.address,
        roundTime: currentService.round,
        range: currentService.radius,
        remote: currentService.remote ? 'remote' : 'onsite',
      });
    }
  }, [currentService]);

  function validationCheck(name, description, address, range) {
    let hasError = false;

    setError((prevError) => ({
      ...prevError,
      name: !name.trim() ? 'Name is required.' : '',
      description: !description.trim() ? 'Description is required.' : '',
      address: !address.trim() ? 'Address is required.' : '',
      range: !range ? 'Range is required.' : '',
    }));

    if (!name.trim() || !description.trim() || !address.trim() || !range) {
      hasError = true;
    }

    return hasError;
  }

  const handleChangeServiceName = (e) => {
    setServiceInfo({
      ...serviceInfo,
      name: e.target.value,
    });
    setError({
      ...error,
      name: '',
    });
  };

  const handleChangeServiceDescription = (e) => {
    setServiceInfo({
      ...serviceInfo,
      description: e.target.value,
    });
    setError({
      ...error,
      description: '',
    });
  };

  const handleChangeRoundTime = (e) => {
    setServiceInfo({
      ...serviceInfo,
      roundTime: e.target.value,
    });
  };

  const handleChangeRange = (e) => {
    setServiceInfo({
      ...serviceInfo,
      range: e.target.value,
    });
    setError({
      ...error,
      range: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      validationCheck(
        serviceInfo.name,
        serviceInfo.description,
        serviceInfo.address,
        serviceInfo.range
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const createServiceParams = {
        name: serviceInfo.name,
        description: serviceInfo.description,
        organization_id: organization_id,
        round: serviceInfo.roundTime,
        remote: serviceInfo.remote === 'remote' ? true : false,
        radius: serviceInfo.range,
        address: serviceInfo.address,
        lat: serviceInfo.lat,
        lng: serviceInfo.lng,
      };

      const response = await axiosInstance.post(endpoints.services.create, createServiceParams);

      setNotification({
        state: new Date().getTime(),
        type: NOTIFICATION_TYPE.SUCCESS,
        message: response.data.message,
      });
      router.push(paths.dashboard.service.root);
    } catch (error) {
      console.log('Error occurred: ', error);
      setNotification({
        state: new Date().getTime(),
        type: NOTIFICATION_TYPE.ERROR,
        message: error,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (
      validationCheck(
        serviceInfo.name,
        serviceInfo.description,
        serviceInfo.address,
        serviceInfo.range
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const updateServiceParams = {
        id: currentService.id,
        name: serviceInfo.name,
        description: serviceInfo.description,
        round: serviceInfo.roundTime,
        remote: serviceInfo.remote === 'remote' ? true : false,
        radius: serviceInfo.range,
        address: serviceInfo.address,
        lat: serviceInfo.lat,
        lng: serviceInfo.lng,
      };

      console.log(updateServiceParams);

      const response = await axiosInstance.post(endpoints.services.update, updateServiceParams);

      setNotification({
        state: new Date().getTime(),
        type: NOTIFICATION_TYPE.SUCCESS,
        message: response.data.message,
      });
      router.push(paths.dashboard.service.root);
    } catch (error) {
      console.log('Error occurred: ', error);
      setNotification({
        state: new Date().getTime(),
        type: NOTIFICATION_TYPE.ERROR,
        message: error,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeType = (e) => {
    setServiceInfo({
      ...serviceInfo,
      remote: e.target.value,
    });
  };

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Name, Description, Address...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Name</Typography>
              <TextField
                name="name"
                placeholder="Ex: Ablou facility company..."
                value={serviceInfo.name}
                onChange={handleChangeServiceName}
                helperText={error.name}
                error={error.name ? true : false}
              />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Description</Typography>
              <TextField
                name="description"
                placeholder="Ex: Clean and secure service ..."
                multiline
                value={serviceInfo.description}
                onChange={handleChangeServiceDescription}
                rows={6}
                helperText={error.description}
                error={error.description ? true : false}
              />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Address</Typography>
              <ServiceMap
                setServiceInfo={setServiceInfo}
                serviceInfo={serviceInfo}
                addressError={error.address}
                setError={setError}
              />
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderProperties = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Properties
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Additional info and attributes...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Properties" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Round time
              </Typography>

              <Select
                placeholder="Select round time..."
                value={serviceInfo.roundTime}
                onChange={handleChangeRoundTime}
              >
                <MenuItem value={5}>5 minutes</MenuItem>
                <MenuItem value={10}>10 minutes</MenuItem>
                <MenuItem value={15}>15 minutes</MenuItem>
                <MenuItem value={30}>30 minutes</MenuItem>
              </Select>
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Accessible range (m)</Typography>
              <TextField
                name="range"
                placeholder="Accessible limit range. e.x 200..."
                type="number"
                value={serviceInfo?.range}
                onChange={handleChangeRange}
                helperText={error.range}
                error={error.range ? true : false}
              />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Service type</Typography>
              <RadioGroup onChange={handleChangeType} value={serviceInfo.remote}>
                <Stack spacing={2} direction="row">
                  <Stack border={1} paddingX={2} paddingY={1} borderRadius={1} borderColor="gray">
                    <FormControlLabel value="remote" control={<Radio />} label="Remote" />
                    <Typography variant="caption">Staff can work anywhere</Typography>
                  </Stack>
                  <Stack border={1} paddingX={2} paddingY={1} borderRadius={1} borderColor="gray">
                    <FormControlLabel value="onsite" control={<Radio />} label="On Site" />
                    <Typography variant="caption">Staff can work within range</Typography>
                  </Stack>
                </Stack>
              </RadioGroup>
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          sx={{ ml: 2 }}
          loading={loading}
          onClick={currentService ? handleSave : handleSubmit}
        >
          {!currentService ? 'Create Service' : 'Save Changes'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <Grid container spacing={3}>
      {renderDetails}

      {renderProperties}

      {renderActions}
    </Grid>
  );
}

ServiceNewEditForm.propTypes = {
  currentService: PropTypes.object,
};
