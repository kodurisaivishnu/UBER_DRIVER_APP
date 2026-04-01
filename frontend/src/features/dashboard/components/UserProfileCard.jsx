import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';

export default function UserProfileCard({ user }) {
  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : '';

  const roleColor = user?.role === 'admin' ? 'primary' : 'success';

  return (
    <Card>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <Avatar
            sx={{
              width: 72,
              height: 72,
              fontSize: 24,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #276EF1, #1a4fba)',
            }}
          >
            {initials}
          </Avatar>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-2">
              <Typography variant="h6" fontWeight={600}>
                {user?.name}
              </Typography>
              <Chip
                label={user?.role}
                color={roleColor}
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-uber-gray-600">
                <EmailOutlined sx={{ fontSize: 16 }} />
                <Typography variant="body2">{user?.email}</Typography>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-uber-gray-600">
                <CalendarTodayOutlined sx={{ fontSize: 16 }} />
                <Typography variant="body2">Member since {memberSince}</Typography>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
