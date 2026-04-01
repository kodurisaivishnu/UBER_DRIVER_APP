import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';
import { refreshToken, getMe } from '@/features/auth/api/auth.api';
import logger from '@/lib/logger';

export default function useAuthInit() {
  const { setAuth, setInitialized } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      try {
        const refreshRes = await refreshToken();
        const { accessToken } = refreshRes.data.data;

        const meRes = await getMe();
        const { user } = meRes.data.data;

        setAuth(accessToken, user);
        logger.info('Auth restored from cookie');
      } catch {
        logger.debug('No active session');
      } finally {
        setInitialized();
      }
    };

    init();
  }, [setAuth, setInitialized]);
}
