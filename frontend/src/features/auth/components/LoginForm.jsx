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
import { loginSchema } from '../validation/authSchemas';
import { loginUser } from '../api/auth.api';
import useAuthStore from '@/store/authStore';
import { toast } from '@/shared/utils/toast';
import { ROUTES, MESSAGES } from '@/constants';
import logger from '@/lib/logger';
import PasswordInput from './PasswordInput';

export default function LoginForm() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '', role: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  const handleRoleChange = (_e, newRole) => {
    if (newRole) {
      setForm({ ...form, role: newRole });
      if (errors.role) setErrors({ ...errors, role: undefined });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const loginRes = await loginUser(form);
      const { accessToken, user } = loginRes.data.data;

      setAuth(accessToken, user);
      logger.info('Login success', { userId: user.id });
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

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 className="text-2xl font-semibold text-uber-gray-800 mb-1">
        Welcome back
      </h1>
      <p className="text-sm text-uber-gray-600 mb-6">
        Sign in to continue to your dashboard
      </p>

      <div className="space-y-4">
        {/* Role Selector */}
        <div>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Login as
          </Typography>
          <ToggleButtonGroup
            value={form.role}
            exclusive
            onChange={handleRoleChange}
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                py: 1.5,
                borderRadius: '8px !important',
                textTransform: 'none',
                fontWeight: 500,
                border: errors.role ? '1px solid #d32f2f' : undefined,
                '&.Mui-selected': {
                  bgcolor: '#000',
                  color: '#fff',
                  '&:hover': { bgcolor: '#1A1A1A' },
                },
              },
            }}
          >
            <ToggleButton value="rider">
              <PersonPinIcon sx={{ mr: 1, fontSize: 20 }} />
              Rider
            </ToggleButton>
            <ToggleButton value="driver">
              <DirectionsCarIcon sx={{ mr: 1, fontSize: 20 }} />
              Driver
            </ToggleButton>
          </ToggleButtonGroup>
          {errors.role && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
              {errors.role}
            </Typography>
          )}
        </div>

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
