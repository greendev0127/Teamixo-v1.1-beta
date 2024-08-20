import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Pagination, { paginationClasses } from '@mui/material/Pagination';

import { useBoolean } from 'src/hooks/use-boolean';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import ServiceItem from './service-item';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { LoadingButton } from '@mui/lab';
import { useStore } from 'src/store/commonStore';
import { NOTIFICATION_TYPE } from 'src/constant/common';

// ----------------------------------------------------------------------

export default function ServiceList({ services, onChangePage, page, setRefresh }) {
  const { setNotification } = useStore();
  const dialog = useBoolean();
  const router = useRouter();

  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleView = useCallback(
    (id) => {
      router.push(paths.dashboard.service.details(id));
    },
    [router]
  );

  const handleEdit = useCallback(
    (id) => {
      router.push(paths.dashboard.service.edit(id));
    },
    [router]
  );

  const handleDelete = useCallback(async () => {
    try {
      setLoading(true);
      const deleteParams = {
        id: selectedId,
      };

      const response = await axiosInstance.post(endpoints.services.delete, deleteParams);

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
      setLoading(false);
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
        {services.slice((page - 1) * 12, page * 12).map((service) => (
          <ServiceItem
            key={service.id}
            service={service}
            onView={() => handleView(service.id)}
            onEdit={() => handleEdit(service.id)}
            onDelete={() => {
              setSelectedId(service.id);
              dialog.onTrue();
            }}
          />
        ))}
      </Box>

      <Dialog open={dialog.value} onClose={dialog.onFalse}>
        <DialogTitle>{`Delete service?`}</DialogTitle>

        <DialogContent sx={{ color: 'text.secondary' }}>
          Are you sure you want to delete this service data?
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={dialog.onFalse}>
            Disagree
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleDelete}
            loading={loading}
            color="error"
            autoFocus
          >
            Agree
          </LoadingButton>
        </DialogActions>
      </Dialog>

      {services.length > 12 && (
        <Pagination
          count={Math.floor(services.length / 12 + 1)}
          onChange={(e, num) => onChangePage(num)}
          sx={{
            mt: 8,
            [`& .${paginationClasses.ul}`]: {
              justifyContent: 'center',
            },
          }}
        />
      )}
    </>
  );
}

ServiceList.propTypes = {
  tours: PropTypes.array,
};
