import { format } from 'date-fns';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { convertMillisToTime } from 'src/utils/format-time';
import { LoadingButton } from '@mui/lab';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useStore } from 'src/store/commonStore';
import { NOTIFICATION_TYPE } from 'src/constant/common';
import { Typography } from '@mui/material';

// ----------------------------------------------------------------------

export default function StaffReportTableRow({
  row,
  index,
  selected,
  onViewRow,
  onSelectRow,
  onDeleteRow,
  service,
}) {
  const { id, sub_data, status, break_time, end_time, no, start_time, work_time } = row;

  const { setNotification } = useStore();

  const confirm = useBoolean();

  const deleteLoading = useBoolean();

  const collapse = useBoolean();

  const handleDeleteReport = async () => {
    try {
      deleteLoading.onTrue();

      const response = await axiosInstance.post(endpoints.report.delete, {
        tableName: `record_${service.organization_id}`,
        track_id: id,
      });

      setNotification({
        state: new Date().getTime(),
        type: NOTIFICATION_TYPE.SUCCESS,
        message: response.data.message,
      });

      onDeleteRow();
    } catch (error) {
      console.log('Error is occurred: ', error.message);
      setNotification({
        state: new Date().getTime(),
        type: NOTIFICATION_TYPE.ERROR,
        message: error.message,
      });
    } finally {
      confirm.onFalse();
      deleteLoading.onFalse();
    }
  };

  const popover = usePopover();

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell>
        <Box
          onClick={onViewRow}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {no}
        </Box>
      </TableCell>

      <TableCell>
        <Typography>{service.name}</Typography>
      </TableCell>

      <TableCell>
        <ListItemText
          primary={format(new Date(start_time), 'dd MMM yyyy')}
          secondary={format(new Date(start_time), 'p')}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      </TableCell>

      <TableCell>
        {end_time ? (
          <ListItemText
            primary={format(new Date(end_time || null), 'dd MMM yyyy')}
            secondary={format(new Date(end_time || null), 'p')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        ) : (
          <Label
            variant="soft"
            color={(status === 'start' && 'success') || (status === 'break' && 'warning')}
          >
            {(status === 'start' && 'Working') || (status === 'break' && 'Breaking')}
          </Label>
        )}
      </TableCell>

      <TableCell>{convertMillisToTime(work_time)}</TableCell>

      <TableCell>{convertMillisToTime(break_time)}</TableCell>

      <TableCell>
        <Label
          variant="soft"
          color={
            (status === 'start' && 'success') || (status === 'break' && 'warning') || 'default'
          }
        >
          {(status === 'start' && 'Working') ||
            (status === 'break' && 'Breaking') ||
            (status === 'end' && 'Done')}
        </Label>
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton
          color={collapse.value ? 'inherit' : 'default'}
          onClick={collapse.onToggle}
          sx={{
            ...(collapse.value && {
              bgcolor: 'action.hover',
            }),
          }}
        >
          <Iconify icon="eva:arrow-ios-downward-fill" />
        </IconButton>

        <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  const renderSecondary = (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={9}>
        <Collapse
          in={collapse.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Stack component={Paper} sx={{ m: 1.5 }}>
            {sub_data.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                alignItems="center"
                sx={{
                  p: (theme) => theme.spacing(1.5, 2, 1.5, 1.5),
                  '&:not(:last-of-type)': {
                    borderBottom: (theme) => `solid 2px ${theme.palette.background.neutral}`,
                  },
                }}
              >
                {/* <Avatar
                  src={item.coverUrl}
                  variant="rounded"
                  sx={{ width: 48, height: 48, mr: 2 }}
                /> */}

                <Avatar
                  variant="rounded"
                  sx={{ width: 48, height: 48, mr: 2, bgcolor: 'lightblue' }}
                >
                  <Iconify
                    icon={
                      (item.status === 'start' && 'ic:baseline-work') ||
                      (item.status === 'break' && 'mynaui:coffee') ||
                      (item.status === 'end' && 'tabler:home-filled') ||
                      'ic:baseline-work'
                    }
                    width={32}
                  />
                </Avatar>

                <ListItemText
                  primary={
                    (item.status === 'start' && 'Start work') ||
                    (item.status === 'break' && 'Breaking') ||
                    (item.status === 'end' && 'End work') ||
                    'Restart Work'
                  }
                  secondary={format(new Date(item.start_date), 'dd/MM/yyyy HH:mm')}
                  primaryTypographyProps={{
                    typography: 'body2',
                  }}
                  secondaryTypographyProps={{
                    component: 'span',
                    color: 'text.disabled',
                    mt: 0.5,
                  }}
                />
              </Stack>
            ))}
          </Stack>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}

      {renderSecondary}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            onViewRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <LoadingButton
            variant="contained"
            color="error"
            onClick={handleDeleteReport}
            loading={deleteLoading.value}
          >
            Delete
          </LoadingButton>
        }
      />
    </>
  );
}

StaffReportTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
