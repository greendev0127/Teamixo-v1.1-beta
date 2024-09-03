'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import StaffReportNewEditForm from '../staff-report-new-edit-form';

// ----------------------------------------------------------------------

export default function StaffReportCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new report"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Report',
            href: paths.dashboard.staffreport.root,
          },
          { name: 'New report' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <StaffReportNewEditForm />
    </Container>
  );
}
