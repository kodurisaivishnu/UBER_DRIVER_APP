import api from '@/lib/axios';
import { API } from '@/constants';
import { getDeviceId } from '@/shared/utils/deviceId';

export const registerUser = ({ email, password, name, role }) =>
  api.post(API.REGISTER, { email, password, name, role });

export const loginUser = ({ email, password, role }) =>
  api.post(API.LOGIN, { email, password, role, deviceId: getDeviceId() });

export const refreshToken = () =>
  api.post(API.REFRESH);

export const logoutUser = () =>
  api.post(API.LOGOUT);

export const logoutAll = () =>
  api.post(API.LOGOUT_ALL);

export const getMe = () =>
  api.get(API.ME);

export const getSessions = () =>
  api.get(API.SESSIONS);

export const revokeSession = (deviceId) =>
  api.delete(`${API.SESSIONS}/${deviceId}`);
