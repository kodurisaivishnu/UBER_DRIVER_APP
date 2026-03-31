import { create } from 'zustand';

const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  isInitialized: false,

  setAuth: (accessToken, user) =>
    set({ accessToken, user }),

  clearAuth: () =>
    set({ accessToken: null, user: null }),

  setInitialized: () =>
    set({ isInitialized: true }),
}));

export default useAuthStore;
