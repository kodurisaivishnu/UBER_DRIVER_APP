import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import LoadingScreen from '@/shared/components/LoadingScreen';
import { ROUTES } from '@/constants';

export default function ProtectedRoute() {
  const { accessToken, user, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) return <LoadingScreen />;

  if (!accessToken || !user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
