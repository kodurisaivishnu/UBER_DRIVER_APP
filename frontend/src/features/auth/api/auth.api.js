import api from '@/lib/axios';
import { API } from '@/constants';
import { getDeviceId } from '@/shared/utils/deviceId';

export const registerUser = ({ email, password, name }) =>
  api.post(API.REGISTER, { email, password, name });

export const loginUser = ({ email, password }) =>
  api.post(API.LOGIN, { email, password, deviceId: getDeviceId() });

export const refreshToken = () =>
  api.post(API.REFRESH);

export const logoutUser = () =>
  api.post(API.LOGOUT);

export const logoutAll = () =>
  api.post(API.LOGOUT_ALL);

export const getMe = () =>
  api.get(API.ME);
