import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { RouterLink } from 'src/routes/components';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ServiceDetailsToolbar({ backLink, editLink, liveLink, sx, ...other }) {
  return (
    <>
      <Stack
        spacing={1.5}
        direction="row"
        sx={{
          mb: { xs: 3, md: 5 },
          ...sx,
        }}
        {...other}
      >
        <Button
          component={RouterLink}
          href={backLink}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
        >
          Back
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title="Go Live">
          <IconButton component={RouterLink} href={liveLink}>
            <Iconify icon="eva:external-link-fill" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Edit">
          <IconButton component={RouterLink} href={editLink}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>
      </Stack>
    </>
  );
}

ServiceDetailsToolbar.propTypes = {
  backLink: PropTypes.string,
  editLink: PropTypes.string,
  liveLink: PropTypes.string,
  sx: PropTypes.object,
};
