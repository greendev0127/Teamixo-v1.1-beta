import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  department: icon('ic_department'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: 'beta v1.1',
        items: [{ title: 'dashboard', path: paths.dashboard.root, icon: ICONS.dashboard }],
      },

      // REPORTING
      // ----------------------------------------------------------------------
      {
        subheader: 'reporting',
        items: [
          {
            title: 'site report',
            path: paths.dashboard.sitereport.root,
            icon: ICONS.file,
            children: [
              { title: 'list', path: paths.dashboard.sitereport.root },
              { title: 'Create', path: paths.dashboard.sitereport.create },
            ],
          },
        ],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: 'management',
        items: [
          {
            title: 'staff ',
            path: paths.dashboard.staff.root,
            icon: ICONS.user,
            children: [
              { title: 'list', path: paths.dashboard.staff.root },
              { title: 'create', path: paths.dashboard.staff.create },
            ],
          },
          {
            title: 'service',
            path: paths.dashboard.service.root,
            icon: ICONS.job,
            children: [
              { title: 'list', path: paths.dashboard.service.root },
              { title: 'create', path: paths.dashboard.service.create },
            ],
          },
          {
            title: 'department',
            path: paths.dashboard.department.root,
            icon: ICONS.department,
            children: [{ title: 'list', path: paths.dashboard.department.root }],
          },
        ],
      },
    ],
    []
  );

  return data;
}
