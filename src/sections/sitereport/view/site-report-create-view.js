'use client';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import SiteReportNewEdit from '../site-report-new-edit-form';

// ----------------------------------------------------------------------

export default function SiteReportCreateView() {
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
            href: paths.dashboard.sitereport.root,
          },
          { name: 'New report' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <SiteReportNewEdit />
    </Container>
  );
}
