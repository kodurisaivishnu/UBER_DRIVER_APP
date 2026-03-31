import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '@/constants';

export function getDeviceId() {
  let id = localStorage.getItem(CONFIG.DEVICE_ID_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(CONFIG.DEVICE_ID_KEY, id);
  }
  return id;
}
