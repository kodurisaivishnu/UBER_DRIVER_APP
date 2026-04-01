import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { loginUser } from '../api/auth.api';
import useAuthStore from '@/store/authStore';
import { toast } from '@/shared/utils/toast';
import { ROUTES, MESSAGES } from '@/constants';
import logger from '@/lib/logger';
import PasswordInput from './PasswordInput';

const ROLE_ICONS = {
  rider: PersonPinIcon,
  driver: DirectionsCarIcon,
};

export default function LoginForm() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Role selection state — shown only when backend returns multiple roles
  const [availableRoles, setAvailableRoles] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  const doLogin = async (role) => {
    setLoading(true);
    try {
      const loginRes = await loginUser({ ...form, role });
      const data = loginRes.data;

      // Backend says: multiple roles exist, pick one
      if (data.status === 'role_required') {
        setAvailableRoles(data.data.roles);
        setLoading(false);
        return;
      }

      const { accessToken, user } = data.data;
      setAuth(accessToken, user);
      logger.info('Login success', { userId: user.id, role: user.role });
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 401) {
        toast.error(MESSAGES.LOGIN_FAILED);
      } else if (status === 429) {
        toast.error(MESSAGES.TOO_MANY_ATTEMPTS);
      } else {
        toast.error(message || MESSAGES.NETWORK_ERROR);
      }
      logger.error('Login failed', { status, message });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setAvailableRoles(null);
    setSelectedRole('');

    if (!form.email || !form.password) {
      const fieldErrors = {};
      if (!form.email) fieldErrors.email = 'Valid email is required';
      if (!form.password) fieldErrors.password = 'Password is required';
      setErrors(fieldErrors);
      return;
    }

    // First attempt without role — backend decides
    await doLogin(undefined);
  };

  const handleRoleSubmit = async () => {
    if (!selectedRole) return;
    await doLogin(selectedRole);
  };

  // Step 2: Role selection screen
  if (availableRoles) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-uber-gray-800 mb-1">
          Choose your role
        </h1>
        <p className="text-sm text-uber-gray-600 mb-6">
          You have multiple accounts. Which one do you want to use?
        </p>

        <ToggleButtonGroup
          value={selectedRole}
          exclusive
          onChange={(_e, val) => val && setSelectedRole(val)}
          fullWidth
          orientation="vertical"
          sx={{
            gap: 1.5,
            '& .MuiToggleButton-root': {
              py: 2,
              borderRadius: '12px !important',
              border: '1px solid #E8ECF0 !important',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              justifyContent: 'flex-start',
              px: 3,
              '&.Mui-selected': {
                bgcolor: '#000',
                color: '#fff',
                borderColor: '#000 !important',
                '&:hover': { bgcolor: '#1A1A1A' },
              },
            },
          }}
        >
          {availableRoles.map((role) => {
            const Icon = ROLE_ICONS[role] || PersonPinIcon;
            return (
              <ToggleButton key={role} value={role}>
                <Icon sx={{ mr: 1.5, fontSize: 24 }} />
                <span className="capitalize">{role}</span>
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outlined"
            onClick={() => { setAvailableRoles(null); setSelectedRole(''); }}
            sx={{ flex: 1 }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleRoleSubmit}
            disabled={!selectedRole || loading}
            sx={{ flex: 1, height: 48 }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Continue'}
          </Button>
        </div>
      </div>
    );
  }

  // Step 1: Email + Password
  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 className="text-2xl font-semibold text-uber-gray-800 mb-1">
        Welcome back
      </h1>
      <p className="text-sm text-uber-gray-600 mb-6">
        Sign in to continue to your dashboard
      </p>

      <div className="space-y-4">
        <TextField
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange('email')}
          error={!!errors.email}
          helperText={errors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

        <PasswordInput
          label="Password"
          value={form.password}
          onChange={handleChange('password')}
          error={!!errors.password}
          helperText={errors.password}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ height: 48, mt: 1 }}
        >
          {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Sign In'}
        </Button>
      </div>

      <p className="text-center text-sm text-uber-gray-600 mt-6">
        Don&apos;t have an account?{' '}
        <Link to={ROUTES.REGISTER} className="text-uber-blue font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
