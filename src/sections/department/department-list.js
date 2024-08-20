import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import DepartmentItem from './department-item';
import { useBoolean } from 'src/hooks/use-boolean';
import { useStore } from 'src/store/commonStore';
import { LoadingButton } from '@mui/lab';
import { Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { NOTIFICATION_TYPE } from 'src/constant/common';

// ----------------------------------------------------------------------

export default function DepartmentList({ departments, staffs, setRefresh }) {
  const { setNotification } = useStore();
  const dialog = useBoolean();
  const editDialog = useBoolean();

  const loading = useBoolean();

  const [selectedId, setSelectedId] = useState('');
  const [departmentName, setDepartmentName] = useState('');

  const handleEdit = useCallback(async () => {
    try {
      loading.onTrue();
      const updateStaffList = staffs.filter(
        (item) => item.role === departments.find((item) => item.id === selectedId).role
      );

      const promise = updateStaffList.map(async (item) => {
        const params = {
          id: item.id,
          department: departmentName,
        };

        await axiosInstance.post(endpoints.staff.updaterole, params);
      });

      await Promise.all(promise);

      const updateDepartmentParams = {
        id: selectedId,
        department: departmentName,
      };

      const response = await axiosInstance.post(
        endpoints.department.update,
        updateDepartmentParams
      );
      editDialog.onFalse();
      setRefresh(new Date());
      setNotification({
        state: new Date().getTime(),
        type: NOTIFICATION_TYPE.SUCCESS,
        message: response.data.message,
      });
    } catch (error) {
      console.log('Error occurred:', error);
      setNotification({
        state: new Date().getTime(),
        type: NOTIFICATION_TYPE.ERROR,
        message: error.message,
      });
    } finally {
      loading.onFalse();
    }
  }, [departmentName]);

  const handleDelete = useCallback(async () => {
    try {
      loading.onTrue();
      const deleteParams = {
        id: selectedId,
      };

      const response = await axiosInstance.post(endpoints.department.delete, deleteParams);

      setRefresh(new Date());

      setNotification({
        state: new Date().getTime(),
        type: NOTIFICATION_TYPE.SUCCESS,
        message: response.data.message,
      });
    } catch (error) {
      console.log('Error occurred: ', error);
      setNotification({
        state: new Date().getTime(),
        type: NOTIFICATION_TYPE.ERROR,
        message: error,
      });
    } finally {
      loading.onFalse();
      dialog.onFalse();
    }
  }, [selectedId]);

  return (
    <>
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
      >
        {departments.map((department) => (
          <DepartmentItem
            key={department.id}
            department={department}
            staffs={staffs}
            onEdit={() => {
              setSelectedId(department.id);
              setDepartmentName(department.role);
              editDialog.onTrue();
            }}
            onDelete={() => {
              setSelectedId(department.id);
              dialog.onTrue();
            }}
          />
        ))}
      </Box>
      <Dialog open={dialog.value} onClose={dialog.onFalse}>
        <DialogTitle>{`Delete department?`}</DialogTitle>

        <DialogContent sx={{ color: 'text.secondary' }}>
          Are you sure you want to delete this department data?
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={dialog.onFalse}>
            Disagree
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleDelete}
            color="error"
            autoFocus
            loading={loading.value}
          >
            Agree
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <Dialog open={editDialog.value} onClose={editDialog.onFalse}>
        <DialogTitle>{`Create New Department`}</DialogTitle>

        <DialogContent sx={{ color: 'text.secondary' }}>
          <Stack width={300} mt={0}>
            <Typography variant="body2">Input new department name to below</Typography>
            <TextField
              label="New Department"
              margin="normal"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={editDialog.onFalse}>
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            color="primary"
            autoFocus
            onClick={handleEdit}
            loading={loading.value}
          >
            Update
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

DepartmentList.propTypes = {
  departments: PropTypes.array,
};
