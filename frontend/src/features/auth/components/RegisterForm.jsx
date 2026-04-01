import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import { registerSchema } from '../validation/authSchemas';
import { registerUser } from '../api/auth.api';
import { toast } from '@/shared/utils/toast';
import { ROUTES, MESSAGES } from '@/constants';
import logger from '@/lib/logger';
import PasswordInput from './PasswordInput';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse(form);
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
      await registerUser(form);
      toast.success(MESSAGES.REGISTER_SUCCESS);
      logger.info('Registration success', { email: form.email });
      navigate(ROUTES.LOGIN);
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      const backendErrors = err.response?.data?.errors;

      if (status === 409) {
        toast.error(MESSAGES.EMAIL_EXISTS);
      } else if (status === 400 && backendErrors) {
        const fieldErrors = {};
        backendErrors.forEach(({ field, message }) => {
          fieldErrors[field] = message;
        });
        setErrors(fieldErrors);
      } else {
        toast.error(message || MESSAGES.NETWORK_ERROR);
      }
      logger.error('Registration failed', { status, message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1 className="text-2xl font-semibold text-uber-gray-800 mb-1">
        Create your account
      </h1>
      <p className="text-sm text-uber-gray-600 mb-6">
        Join the Uber Driver platform
      </p>

      <div className="space-y-4">
        <TextField
          label="Full Name"
          value={form.name}
          onChange={handleChange('name')}
          error={!!errors.name}
          helperText={errors.name}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />

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
          showStrength
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{ height: 48, mt: 1 }}
        >
          {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Create Account'}
        </Button>
      </div>

      <p className="text-center text-sm text-uber-gray-600 mt-6">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-uber-blue font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
