import { create } from 'zustand';

export const useStore = create((set) => ({
  notification: {},
  setNotification: (notification) => set({ notification: notification }),
}));
