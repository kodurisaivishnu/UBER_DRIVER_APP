import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LogoutIcon from '@mui/icons-material/Logout';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SettingsIcon from '@mui/icons-material/Settings';
import useAuthStore from '@/store/authStore';
import { logoutUser, logoutAll } from '@/features/auth/api/auth.api';
import { toast } from '@/shared/utils/toast';
import { ROUTES, MESSAGES } from '@/constants';
import logger from '@/lib/logger';
import UserProfileCard from '../components/UserProfileCard';
import ActiveSessions from '../components/ActiveSessions';

const comingSoonSections = [
  { icon: DirectionsCarIcon, title: 'My Trips', desc: 'View trip history and active rides' },
  { icon: AttachMoneyIcon, title: 'Earnings', desc: 'Track your earnings and payouts' },
  { icon: SettingsIcon, title: 'Settings', desc: 'Manage your account preferences' },
];

export default function DashboardPage() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
      clearAuth();
      toast.success(MESSAGES.LOGOUT_SUCCESS);
      navigate(ROUTES.LOGIN);
    } catch (err) {
      logger.error('Logout failed', err);
      clearAuth();
      navigate(ROUTES.LOGIN);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAll();
      clearAuth();
      toast.success(MESSAGES.LOGOUT_ALL_SUCCESS);
      navigate(ROUTES.LOGIN);
    } catch (err) {
      logger.error('Logout all failed', err);
      clearAuth();
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Card sx={{ borderLeft: '4px solid #276EF1' }}>
        <CardContent sx={{ py: 2.5, px: 3 }}>
          <Typography variant="h6" fontWeight={600}>
            Welcome back, {user?.name?.split(' ')[0]}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your profile and account
          </Typography>
        </CardContent>
      </Card>

      {/* Profile */}
      <UserProfileCard user={user} />

      {/* Active Sessions */}
      <ActiveSessions />

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outlined"
          color="primary"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          disabled={loggingOut}
        >
          Logout
        </Button>
        <Button
          variant="text"
          color="error"
          startIcon={<WarningAmberIcon />}
          onClick={handleLogoutAll}
        >
          Logout from all devices
        </Button>
      </div>

      {/* Coming Soon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {comingSoonSections.map(({ icon: Icon, title, desc }) => (
          <Card
            key={title}
            variant="outlined"
            sx={{ borderStyle: 'dashed', borderColor: '#d1d5db', opacity: 0.7 }}
          >
            <CardContent className="text-center py-6">
              <Icon sx={{ fontSize: 32, color: '#AFAFAF', mb: 1 }} />
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                {desc}
              </Typography>
              <Chip label="Coming Soon" size="small" sx={{ bgcolor: '#F5F5F5', color: '#AFAFAF' }} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
