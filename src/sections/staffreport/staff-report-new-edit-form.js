import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller } from 'react-hook-form';
import { useMemo, useEffect, useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { useRouter } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFAutocomplete } from 'src/components/hook-form';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { tokenDecode } from 'src/auth/context/jwt/utils';
import { useBoolean } from 'src/hooks/use-boolean';
import { DateTimePicker } from '@mui/x-date-pickers';
import { REPORT_TIME_STATUS } from 'src/_mock/_report';
import { timeCalc } from 'src/utils/format-time';
import { useStore } from 'src/store/commonStore';
import { NOTIFICATION_TYPE } from 'src/constant/common';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function StaffReportNewEditForm({ currentReport, track_id }) {
  const router = useRouter();

  const { setNotification } = useStore();

  const loadingInitData = useBoolean();

  const [staffData, setStaffData] = useState([]);

  const [serviceData, setServiceData] = useState([]);

  const mdUp = useResponsive('up', 'md');

  const NewTourSchema = Yup.object().shape({
    staff: Yup.object().required('Staff is required'),
    service: Yup.object().required('Service is required'),
    //
    available: Yup.object().shape({
      startDate: Yup.mixed().nullable().required('Start date is required'),
      breakDate: Yup.mixed()
        .nullable()
        .when('startDate', (startDate, schema) => {
          if (!startDate[0]) {
            return schema;
          }
          return schema.test(
            'break-date-validation',
            'Break date must be later than start date',
            (value) => {
              if (!value) {
                return true; // If there is no break date, validation passes
              }
              // If break date is less than start date, validation fails
              return new Date(value).getTime() > new Date(startDate[0]).getTime();
            }
          );
        }),
      restartDate: Yup.mixed()
        .nullable()
        .when(['startDate', 'breakDate'], (previousDate, schema) => {
          if (previousDate[1]) {
            return schema.test(
              'restart-date-validation',
              'Restart date must be later than break date',
              (value) => {
                if (!value) {
                  return true; // If there is no break date, validation passes
                }
                // If break date is less than start date, validation fails
                return new Date(value).getTime() > new Date(previousDate[1]).getTime();
              }
            );
          }
          if (previousDate[0]) {
            return schema.test(
              'restart-date-validation',
              'Restart date must be later than start date',
              (value) => {
                if (!value) {
                  return true; // If there is no break date, validation passes
                }
                // If break date is less than start date, validation fails
                return new Date(value).getTime() > new Date(previousDate[0]).getTime();
              }
            );
          }
          return schema;
        }),
      endDate: Yup.mixed()
        .required('End date is required')
        .when(['startDate', 'breakDate', 'restartDate'], (previousDate, schema) => {
          if (previousDate[2]) {
            return schema.test(
              'end-date-validation',
              'End date must be later than restart date',
              (value) => {
                if (!value) {
                  return true; // If there is no break date, validation passes
                }
                // If break date is less than start date, validation fails
                return new Date(value).getTime() > new Date(previousDate[2]).getTime();
              }
            );
          }
          if (previousDate[1]) {
            return schema.test(
              'end-date-validation',
              'End date must be later than break date',
              (value) => {
                if (!value) {
                  return true; // If there is no break date, validation passes
                }
                // If break date is less than start date, validation fails
                return new Date(value).getTime() > new Date(previousDate[1]).getTime();
              }
            );
          }
          if (previousDate[0]) {
            return schema.test(
              'end-date-validation',
              'End date must be later than start date',
              (value) => {
                if (!value) {
                  return true; // If there is no break date, validation passes
                }
                // If break date is less than start date, validation fails
                return new Date(value).getTime() > new Date(previousDate[0]).getTime();
              }
            );
          }
          return schema;
        }),
    }),
  });

  const defaultValues = useMemo(
    () => ({
      staff: currentReport?.staff || null,
      service: currentReport?.service || null,
      available: {
        startDate: currentReport?.available.startDate
          ? new Date(currentReport?.available.startDate)
          : null,
        breakDate: currentReport?.available.breakDate
          ? new Date(currentReport?.available.breakDate)
          : null,
        restartDate: currentReport?.available.restartDate
          ? new Date(currentReport?.available.restartDate)
          : null,
        endDate: currentReport?.available.endDate
          ? new Date(currentReport?.available.endDate)
          : null,
      },
    }),
    [currentReport]
  );

  const methods = useForm({
    resolver: yupResolver(NewTourSchema),
    defaultValues,
  });

  const {
    watch,
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  useEffect(() => {
    const accessToken = sessionStorage.getItem('accessToken');

    const organizationId = tokenDecode(accessToken)['custom:organization_id'];

    async function getInitData() {
      try {
        loadingInitData.onTrue();

        const services = await axiosInstance.post(endpoints.services.list, {
          organizationId: organizationId,
        });

        const staffs = await axiosInstance.post(endpoints.staff.list, {
          organization_id: organizationId,
        });

        setStaffData(staffs.data.body);
        setServiceData(services.data.body);
      } catch (error) {
        console.log('Error occurred: ', error);
      } finally {
        loadingInitData.onFalse();
      }
    }

    getInitData();
  }, []);

  useEffect(() => {
    if (currentReport) {
      reset(defaultValues);
    }
  }, [currentReport, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      let timeList = REPORT_TIME_STATUS.map((status) => ({
        status: status,
        start_date: new Date(data.available[status + 'Date']).getTime(),
      })).filter((item) => item.start_date);

      const resultData = timeList.map((item, index) => {
        const endDate = index !== timeList.length - 1 ? timeList[index + 1].start_date : null;
        const total = index !== timeList.length - 1 ? timeCalc(endDate, item.start_date) : 0;
        return { ...item, end_date: endDate, total_time: total };
      });

      const createReportParams = {
        tableName: data.service.table_name,
        site: data.service,
        staff: data.staff,
        dateList: resultData,
      };

      const response = await axiosInstance.post(endpoints.report.create, createReportParams);

      if (currentReport) {
        const result = await axiosInstance.post(endpoints.report.delete, {
          tableName: data.service.table_name,
          track_id: Number(track_id),
        });
      }

      reset();

      router.push(paths.dashboard.staffreport.root);

      setNotification({
        state: new Date().getTime(),
        type: NOTIFICATION_TYPE.SUCCESS,
        message: !currentReport
          ? response.data.message
          : 'Track data has been successfully updated',
      });
    } catch (error) {
      console.error(error);

      setNotification({
        state: new Date().getTime(),
        type: NOTIFICATION_TYPE.ERROR,
        message: error.message,
      });
    }
  });

  const renderDetails = (
    <>
      {mdUp && (
        <Grid md={4}>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Details
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Staff && Service
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Details" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Staff</Typography>
              <RHFAutocomplete
                name="staff"
                placeholder="Staff"
                options={staffData}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disableClearable
                renderOption={(props, option) => {
                  const { id, name, avatar } = option;

                  if (!name) {
                    return null;
                  }

                  return (
                    <li {...props} key={id}>
                      <Avatar
                        key={id}
                        alt={name}
                        src={avatar}
                        sx={{ width: 24, height: 24, flexShrink: 0, mr: 1 }}
                      />
                      {name}
                    </li>
                  );
                }}
              />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Service</Typography>
              <RHFAutocomplete
                name="service"
                placeholder="Service"
                options={serviceData}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disableClearable
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
            Time data
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Start, End, Break, Restart time...
          </Typography>
        </Grid>
      )}

      <Grid xs={12} md={8}>
        <Card>
          {!mdUp && <CardHeader title="Properties" />}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Stack>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Start Work
              </Typography>

              <Controller
                name="available.startDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DateTimePicker
                    {...field}
                    format="dd/MM/yyyy HH:mm"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />
            </Stack>
            <Stack>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Break
              </Typography>

              <Controller
                name="available.breakDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DateTimePicker
                    {...field}
                    format="dd/MM/yyyy HH:mm"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />
            </Stack>
            <Stack>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Restart
              </Typography>

              <Controller
                name="available.restartDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DateTimePicker
                    {...field}
                    format="dd/MM/yyyy HH:mm"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />
            </Stack>
            <Stack>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                End Work
              </Typography>

              <Controller
                name="available.endDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <DateTimePicker
                    {...field}
                    format="dd/MM/yyyy HH:mm"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!error,
                        helperText: error?.message,
                      },
                    }}
                  />
                )}
              />
            </Stack>
          </Stack>
        </Card>
      </Grid>
    </>
  );

  const renderActions = (
    <>
      {mdUp && <Grid md={4} />}
      <Grid xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          loading={isSubmitting}
          sx={{ ml: 'auto' }}
        >
          {!currentReport ? 'Create Report' : 'Save Changes'}
        </LoadingButton>
      </Grid>
    </>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {renderDetails}

        {renderProperties}

        {renderActions}
      </Grid>
    </FormProvider>
  );
}

StaffReportNewEditForm.propTypes = {
  currentReport: PropTypes.object,
};
