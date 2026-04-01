import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { ROUTES } from '@/constants';

export default function GuestRoute() {
  const { accessToken, user, isInitialized } = useAuthStore();

  if (!isInitialized) return <LoadingScreen />;

  if (accessToken && user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}
