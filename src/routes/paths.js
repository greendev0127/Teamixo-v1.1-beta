// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // AUTH
  auth: {
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    staff: {
      root: `${ROOTS.DASHBOARD}/staff`,
      create: `${ROOTS.DASHBOARD}/staff/create`,
      edit: (id) => `${ROOTS.DASHBOARD}/staff/${id}/edit`,
    },
    service: {
      root: `${ROOTS.DASHBOARD}/services`,
      create: `${ROOTS.DASHBOARD}/services/create`,
      details: (id) => `${ROOTS.DASHBOARD}/services/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/services/${id}/edit`,
    },
    department: {
      root: `${ROOTS.DASHBOARD}/department`,
    },
  },
};
