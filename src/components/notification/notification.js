'use client';
import { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NOTIFICATION_TYPE } from 'src/constant/common';
import { useStore } from 'src/store/commonStore';

export default function Notification() {
  const { notification } = useStore();

  useEffect(() => {
    handleNotification(notification.type, notification.message);
  }, [notification.state]);

  const handleNotification = (type, message) => {
    switch (type) {
      case NOTIFICATION_TYPE.SUCCESS:
        toast.success(message, toastOptions);
        break;
      case NOTIFICATION_TYPE.ERROR:
        toast.error(message, toastOptions);
        break;
      case NOTIFICATION_TYPE.INFO:
        toast.info(message, toastOptions);
        break;
      default:
        break;
    }
  };

  const toastOptions = {
    position: 'top-right',
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'light',
  };

  return (
    <ToastContainer
      position="top-right"
      autoClose={1000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
}
