import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Logo from './Logo';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: 'linear-gradient(135deg, #F8F9FA 0%, #E8ECF0 100%)' }}
    >
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <div className="flex justify-center mb-8">
            <Logo size="md" />
          </div>
          {children}
        </CardContent>
        <div className="text-center pb-4">
          <span className="text-xs text-uber-gray-400">Uber Driver App</span>
        </div>
      </Card>
    </div>
  );
}
