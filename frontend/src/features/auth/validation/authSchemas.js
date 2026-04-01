import { z } from 'zod';
import { PASSWORD_RULES } from '@/constants';

const { MIN_LENGTH, PATTERNS } = PASSWORD_RULES;

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['driver', 'admin', 'rider'], { required_error: 'Please select a role' }),
  password: z
    .string()
    .min(MIN_LENGTH, `At least ${MIN_LENGTH} characters`)
    .regex(PATTERNS.UPPERCASE, 'Must contain an uppercase letter')
    .regex(PATTERNS.LOWERCASE, 'Must contain a lowercase letter')
    .regex(PATTERNS.DIGIT, 'Must contain a number')
    .regex(PATTERNS.SPECIAL, 'Must contain a special character'),
});
