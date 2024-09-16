import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';

import { countries } from 'src/assets/data';

import Iconify from 'src/components/iconify';
import FormProvider, {
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
  RHFSelect,
} from 'src/components/hook-form';
import {
  alpha,
  Divider,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { STAFF_TYPE_OPTIONS } from 'src/_mock/_staff';
import { PinCodeGeneration } from 'src/utils/pin-code';
import { useAuthContext } from 'src/auth/hooks';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useStore } from 'src/store/commonStore';
import { NOTIFICATION_TYPE } from 'src/constant/common';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useBoolean } from 'src/hooks/use-boolean';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export default function StaffNewEditForm({ currentUser, departmentData }) {
  const router = useRouter();

  const confirm = useBoolean();

  const deleteLoading = useBoolean();

  const { user } = useAuthContext();

  const { setNotification } = useStore();

  const [optionalData, setOptionalData] = useState({
    salary: null,
    emergencyEmployee: '',
    emergencyName: '',
    emergencyPhone: '',
    gender: '',
    birth: null,
  });
  const [pinCode, setPinCode] = useState('0000');

  useEffect(() => {
    if (currentUser) {
      setPinCode(currentUser.pin);
      setOptionalData({
        ...optionalData,
        salary: currentUser.salary || 0,
        emergencyName: currentUser.emergency_name || '',
        emergencyPhone: currentUser.emergency_phone || '',
        emergencyEmployee: currentUser.emergency_employee || '',
        gender: currentUser.gender || '',
        birth: currentUser.birth ? new Date(currentUser.birth) : null,
      });
    } else {
      setPinCode(PinCodeGeneration());
    }
  }, []);

  const NewUserSchema = Yup.object().shape({
    first_name: Yup.string().required('First name is required'),
    last_name: Yup.string().required('Last name is required'),
    email: Yup.string()
      .required('Email is required')
      .matches(
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        'Email must be a valid email address'
      ),
    phoneNumber: Yup.string().required('Phone number is required'),
    country: Yup.string().required('Country is required'),
    city: Yup.string().required('City is required'),
    address: Yup.string().required('Address is required'),
    zipCode: Yup.string().required('Zip code is required'),
    department: Yup.string().required('Department is required'),
    staffType: Yup.string().required('Staff type is required'),
    avatarUrl: Yup.mixed().nullable().required('Avatar is required'),
    // not required
  });

  const defaultValues = useMemo(
    () => ({
      first_name: currentUser?.first_name || '',
      last_name: currentUser?.last_name || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phone || '',
      country: currentUser?.country || '',
      city: currentUser?.city || '',
      address: currentUser?.address || '',
      zipCode: currentUser?.postcode || '',
      department: currentUser?.role || '',
      staffType: currentUser?.type || '',
      avatarUrl: currentUser?.avatar || null,
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const handleDeleteStaff = async () => {
    try {
      deleteLoading.onTrue();

      const response = await axiosInstance.post(endpoints.staff.delete, {
        id: currentUser.id,
        email: currentUser.email,
        state: currentUser.state,
      });

      router.push(paths.dashboard.staff.root);

      setNotification({
        state: new Date().getTime(),
        type: NOTIFICATION_TYPE.SUCCESS,
        message: response.data.message,
      });
    } catch (error) {
      console.log('Error is occurred: ', error.message);
      setNotification({
        state: new Date().getTime(),
        type: NOTIFICATION_TYPE.ERROR,
        message: error,
      });
    } finally {
      confirm.onFalse();
      deleteLoading.onFalse();
    }
  };

  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const onSubmit = handleSubmit(async (data) => {
    try {
      let base64 = '';
      if (data.avatarUrl !== currentUser?.avatar) {
        base64 = await convertBase64(data.avatarUrl);
      }

      let staffParams = {
        ...data,
        ...optionalData,
        avatar: {
          avatarUrl: currentUser,
          base64: base64,
        },
        pin: pinCode,
        name: data.first_name + ' ' + data.last_name,
        organization_id: user.organization_id,
      };

      staffParams.type = staffParams.staffType;
      staffParams.role = staffParams.department;
      staffParams.postcode = staffParams.zipCode;
      staffParams.phone = staffParams.phoneNumber;
      staffParams.emergency_name = staffParams.emergencyName;
      staffParams.emergency_phone = staffParams.emergencyPhone;
      staffParams.emergency_employee = staffParams.emergencyEmployee;

      if (currentUser) {
        staffParams.id = currentUser.id;
      }

      delete staffParams.zipCode;
      delete staffParams.avatarUrl;
      delete staffParams.staffType;
      delete staffParams.department;
      delete staffParams.phoneNumber;
      delete staffParams.emergencyName;
      delete staffParams.emergencyPhone;
      delete staffParams.emergencyEmployee;

      const respose = await axiosInstance.post(
        !currentUser ? endpoints.staff.create : endpoints.staff.update,
        staffParams
      );

      setNotification({
        state: new Date(),
        type: NOTIFICATION_TYPE.SUCCESS,
        message: respose.data.message,
      });
      router.push(paths.dashboard.staff.root);
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('avatarUrl', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handleChangeOptionalData = (e) => {
    setOptionalData({
      ...optionalData,
      [e.target.name]: e.target.value,
    });
  };

  if (!departmentData.length) {
    return (
      <Box
        sx={{
          mt: 5,
          width: 1,
          height: 320,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          border: (theme) => `dashed 1px ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack spacing={2} alignItems={'center'}>
          <Typography variant="h4">Not found any department data.</Typography>
          <Button
            component={RouterLink}
            href={paths.dashboard.department.root}
            variant="contained"
            sx={{
              width: 'fit-content',
            }}
          >
            Create Department
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            <Box sx={{ mb: 5 }}>
              <RHFUploadAvatar
                name="avatarUrl"
                maxSize={3145728}
                onDrop={handleDrop}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
            </Box>
            <Divider variant="middle" />
            <Stack direction="column" gap={2} alignItems="center" mt={4}>
              <Typography variant="body1">Pin code</Typography>
              <TextField
                fullWidth
                InputProps={{
                  readOnly: true,
                  inputProps: {
                    style: {
                      textAlign: 'center',
                    },
                  },
                }}
                value={pinCode}
                size="small"
              />
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  setPinCode(PinCodeGeneration());
                }}
              >
                Re-generation
              </Button>
            </Stack>
            {currentUser && (
              <Stack justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                <Button
                  variant="soft"
                  color="error"
                  onClick={() => {
                    confirm.onTrue();
                  }}
                >
                  Delete User
                </Button>
              </Stack>
            )}
          </Card>
        </Grid>

        <Grid xs={12} md={8} spacing={3}>
          <Card sx={{ p: 3 }}>
            <Typography>Required Data</Typography>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              mt={5}
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <RHFTextField name="first_name" label="First Name" />
              <RHFTextField name="last_name" label="Last Name" />
              <RHFTextField name="email" label="Email Address" />
              <RHFTextField name="phoneNumber" label="Phone Number" />

              <RHFAutocomplete
                name="country"
                label="Country"
                options={countries.map((country) => country.label)}
                getOptionLabel={(option) => option}
                isOptionEqualToValue={(option, value) => option === value}
                renderOption={(props, option) => {
                  const { code, label, phone } = countries.filter(
                    (country) => country.label === option
                  )[0];

                  if (!label) {
                    return null;
                  }

                  return (
                    <li {...props} key={label}>
                      <Iconify
                        key={label}
                        icon={`circle-flags:${code.toLowerCase()}`}
                        width={28}
                        sx={{ mr: 1 }}
                      />
                      {label} ({code}) +{phone}
                    </li>
                  );
                }}
              />

              <RHFTextField name="city" label="City" />
              <RHFTextField name="address" label="Address" />
              <RHFTextField name="zipCode" label="Zip/Code" />
              <RHFSelect name="department" label="Department">
                {departmentData.map((department) => (
                  <MenuItem key={department.role} value={department.role}>
                    {department.role}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect name="staffType" label="Staff Type">
                {STAFF_TYPE_OPTIONS.map((staffType) => (
                  <MenuItem key={staffType.value} value={staffType.value}>
                    {staffType.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>
          </Card>
          <Stack mt={4}></Stack>
          <Card sx={{ p: 3 }}>
            <Typography>Optional Data</Typography>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              mt={5}
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
              }}
            >
              <TextField
                type="number"
                name="salary"
                label="Salary"
                value={optionalData.salary || 0}
                onChange={handleChangeOptionalData}
                InputProps={{
                  endAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <TextField
                name="emergencyEmployee"
                label="Emergency Employee"
                value={optionalData.emergencyEmployee}
                onChange={handleChangeOptionalData}
              />
              <TextField
                name="emergencyName"
                label="Emergency Name"
                value={optionalData.emergencyName}
                onChange={handleChangeOptionalData}
              />
              <TextField
                name="emergencyPhone"
                label="Emergency Phone"
                value={optionalData.emergencyPhone}
                onChange={handleChangeOptionalData}
              />
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Gender</Typography>
                <RadioGroup
                  name="gender"
                  onChange={handleChangeOptionalData}
                  value={optionalData.gender}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <Stack
                      border={1}
                      paddingX={2}
                      paddingY={1}
                      borderRadius={1}
                      borderColor="#80808060"
                    >
                      <FormControlLabel value="male" control={<Radio />} label="Male" />
                    </Stack>
                    <Stack
                      border={1}
                      paddingX={2}
                      paddingY={1}
                      borderRadius={1}
                      borderColor="#80808060"
                    >
                      <FormControlLabel value="female" control={<Radio />} label="Female" />
                    </Stack>
                  </div>
                </RadioGroup>
              </Stack>
              <Stack spacing={1.5}>
                <Typography variant="body2">Birthday</Typography>
                <DatePicker
                  value={optionalData.birth}
                  onChange={(e) =>
                    setOptionalData({
                      ...optionalData,
                      birth: e,
                    })
                  }
                  format="dd/MM/yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Stack>
            </Box>
          </Card>

          <Stack alignItems="flex-end" sx={{ mt: 3 }}>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              {!currentUser ? 'Create User' : 'Save Changes'}
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <LoadingButton
            variant="contained"
            color="error"
            onClick={handleDeleteStaff}
            loading={deleteLoading.value}
          >
            Delete
          </LoadingButton>
        }
      />
    </FormProvider>
  );
}

StaffNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
