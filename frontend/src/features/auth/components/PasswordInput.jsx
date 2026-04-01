import { useState } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlined from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { PASSWORD_RULES } from '@/constants';

const { PATTERNS, LABELS } = PASSWORD_RULES;

const rules = [
  { key: 'length', label: LABELS.MIN_LENGTH, test: (v) => v.length >= PASSWORD_RULES.MIN_LENGTH },
  { key: 'upper', label: LABELS.UPPERCASE, test: (v) => PATTERNS.UPPERCASE.test(v) },
  { key: 'lower', label: LABELS.LOWERCASE, test: (v) => PATTERNS.LOWERCASE.test(v) },
  { key: 'digit', label: LABELS.DIGIT, test: (v) => PATTERNS.DIGIT.test(v) },
  { key: 'special', label: LABELS.SPECIAL, test: (v) => PATTERNS.SPECIAL.test(v) },
];

export default function PasswordInput({ value, onChange, error, helperText, showStrength = false, ...props }) {
  const [visible, setVisible] = useState(false);

  const passedCount = showStrength ? rules.filter((r) => r.test(value || '')).length : 0;
  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#22c55e'];
  const strengthColor = passedCount > 0 ? strengthColors[passedCount - 1] : '#e5e7eb';

  return (
    <div>
      <TextField
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        error={error}
        helperText={!showStrength ? helperText : undefined}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockOutlined sx={{ color: 'text.secondary', fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setVisible(!visible)} edge="end" size="small">
                {visible ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        {...props}
      />

      {showStrength && value && (
        <div className="mt-2 space-y-2">
          {/* Strength bar */}
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-colors duration-200"
                style={{ backgroundColor: i < passedCount ? strengthColor : '#e5e7eb' }}
              />
            ))}
          </div>

          {/* Rules checklist */}
          <div className="space-y-1">
            {rules.map((rule) => {
              const passed = rule.test(value);
              return (
                <div key={rule.key} className="flex items-center gap-1.5">
                  {passed ? (
                    <CheckCircleIcon sx={{ fontSize: 14, color: '#22c55e' }} />
                  ) : (
                    <RadioButtonUncheckedIcon sx={{ fontSize: 14, color: '#d1d5db' }} />
                  )}
                  <span className={`text-xs ${passed ? 'text-green-600' : 'text-gray-400'}`}>
                    {rule.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
