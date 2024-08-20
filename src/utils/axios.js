import axios from 'axios';

import { HOST_API, OFFLINE_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/v1/server/auth/getMe',
    login: '/api/v1/server/auth/login',
    register: '/api/v1/server/auth/signup',
    verify: '/api/v1/server/auth/verify-email',
  },
  company: {
    create: '/api/v1/server/company/create',
  },
  services: {
    list: '/api/v1/server/service/list',
    create: '/api/v1/server/service/create',
    delete: '/api/v1/server/service/delete',
    update: '/api/v1/server/service/update',
    get: '/api/v1/server/service/getservice',
  },
  department: {
    list: '/api/v1/server/department/list',
    create: '/api/v1/server/department/create',
    update: '/api/v1/server/department/update',
    delete: '/api/v1/server/department/delete',
  },
  staff: {
    list: '/api/v1/server/staff/list',
    get: '/api/v1/server/staff/getstaff',
    create: '/api/v1/server/staff/create',
    update: '/api/v1/server/staff/update',
    delete: '/api/v1/server/staff/delete',
    updaterole: '/api/v1/server/staff/update_role',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};
