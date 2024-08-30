import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { Chip } from '@mui/material';
import axiosInstance, { endpoints } from 'src/utils/axios';
import { useStore } from 'src/store/commonStore';
import { NOTIFICATION_TYPE } from 'src/constant/common';
import { LoadingButton } from '@mui/lab';

// ----------------------------------------------------------------------

export default function StaffTableRow({ row, selected, onEditRow, onSelectRow, onDeleteRow }) {
  const {
    id,
    name,
    avatar,
    level,
    role,
    clocked_state,
    password_state,
    block_state,
    email,
    pin,
    break_state,
    state,
  } = row;

  const { setNotification } = useStore();

  const confirm = useBoolean();

  const deleteLoading = useBoolean();

  const popover = usePopover();

  const handleDeleteStaff = async () => {
    try {
      deleteLoading.onTrue();

      const response = await axiosInstance.post(endpoints.staff.delete, {
        id: id,
        email: email,
        state: state,
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
        message: error,
      });
    } finally {
      confirm.onFalse();
      deleteLoading.onFalse();
    }
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar alt={name} src={avatar} sx={{ mr: 2 }} />

          <ListItemText
            primary={name}
            secondary={email}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{
              component: 'span',
              color: 'text.disabled',
            }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{pin}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{role}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{level === 3 ? 'Member' : 'Owner'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>
          <Chip
            variant="outlined"
            color={!clocked_state ? 'error' : break_state ? 'warning' : 'success'}
            size="small"
            icon={
              <Iconify
                icon={
                  !clocked_state
                    ? 'tabler:home-filled'
                    : break_state
                      ? 'mynaui:coffee'
                      : 'ic:baseline-work'
                }
              />
            }
            label={!clocked_state ? 'Clock out' : break_state ? 'Break' : 'Clock in'}
          />
        </TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={block_state ? 'error' : password_state ? 'success' : 'warning'}
          >
            {block_state ? 'Banned' : password_state ? 'Active' : 'Pending'}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
            disabled={level === 1}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

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
            onEditRow();
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
            onClick={handleDeleteStaff}
            loading={deleteLoading.value}
          >
            Delete
          </LoadingButton>
        }
      />
    </>
  );
}

StaffTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
