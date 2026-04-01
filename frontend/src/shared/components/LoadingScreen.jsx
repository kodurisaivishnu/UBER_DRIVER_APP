import CircularProgress from '@mui/material/CircularProgress';
import Logo from './Logo';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-uber-gray-50">
      <Logo size="lg" />
      <CircularProgress size={32} sx={{ color: '#276EF1' }} />
    </div>
  );
}
