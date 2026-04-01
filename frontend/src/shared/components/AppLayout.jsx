import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import LogoutIcon from '@mui/icons-material/Logout';
import useAuthStore from '@/store/authStore';
import { logoutUser } from '@/features/auth/api/auth.api';
import { toast } from '@/shared/utils/toast';
import { ROUTES, MESSAGES } from '@/constants';
import logger from '@/lib/logger';
import Logo from './Logo';

export default function AppLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const handleLogout = async () => {
    setAnchorEl(null);
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

  return (
    <div className="min-h-screen bg-uber-gray-50">
      <AppBar position="sticky" elevation={0}
        sx={{ bgcolor: 'white', borderBottom: '1px solid #E8ECF0' }}
      >
        <Toolbar className="max-w-5xl w-full mx-auto">
          <div className="flex-1">
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-3">
            <Typography variant="body2" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
              {user?.name}
            </Typography>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar sx={{
                width: 36, height: 36, fontSize: 14, fontWeight: 600,
                background: 'linear-gradient(135deg, #276EF1, #1a4fba)',
              }}>
                {initials}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
