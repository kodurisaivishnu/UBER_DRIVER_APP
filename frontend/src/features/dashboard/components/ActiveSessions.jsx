import { useState, useEffect, useCallback } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import LaptopIcon from '@mui/icons-material/Laptop';
import TabletIcon from '@mui/icons-material/Tablet';
import DevicesIcon from '@mui/icons-material/Devices';
import { getSessions, revokeSession } from '@/features/auth/api/auth.api';
import { toast } from '@/shared/utils/toast';
import { MESSAGES } from '@/constants';
import logger from '@/lib/logger';

function parseDevice(userAgent) {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return { type: 'Mobile', Icon: PhoneAndroidIcon };
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return { type: 'Tablet', Icon: TabletIcon };
  }
  if (ua.includes('chrome')) return { type: 'Chrome', Icon: LaptopIcon };
  if (ua.includes('firefox')) return { type: 'Firefox', Icon: LaptopIcon };
  if (ua.includes('safari')) return { type: 'Safari', Icon: LaptopIcon };
  if (ua.includes('edge')) return { type: 'Edge', Icon: LaptopIcon };
  return { type: 'Unknown', Icon: DevicesIcon };
}

function parseBrowser(userAgent) {
  const ua = userAgent;
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  return 'Browser';
}

function parseOS(userAgent) {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'macOS';
  if (userAgent.includes('Linux') && !userAgent.includes('Android')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  return '';
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ActiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await getSessions();
      setSessions(res.data.data.sessions);
    } catch (err) {
      logger.error('Failed to load sessions', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (deviceId) => {
    setRevoking(deviceId);
    try {
      await revokeSession(deviceId);
      toast.success(MESSAGES.SESSION_REVOKED);
      setSessions((prev) => prev.filter((s) => s.deviceId !== deviceId));
    } catch (err) {
      toast.error(err.response?.data?.message || MESSAGES.NETWORK_ERROR);
      logger.error('Failed to revoke session', err);
    } finally {
      setRevoking(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Active Sessions
          </Typography>
          {[1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={64} sx={{ mb: 1.5 }} />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <div className="flex items-center justify-between mb-3">
          <Typography variant="subtitle1" fontWeight={600}>
            Active Sessions
          </Typography>
          <Chip
            label={`${sessions.length} device${sessions.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{ bgcolor: '#F5F5F5' }}
          />
        </div>

        {sessions.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No active sessions found.
          </Typography>
        )}

        <div className="space-y-2">
          {sessions.map((session) => {
            const device = parseDevice(session.userAgent);
            const browser = parseBrowser(session.userAgent);
            const os = parseOS(session.userAgent);
            const DeviceIcon = device.Icon;

            return (
              <div
                key={session.deviceId}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  session.isCurrent
                    ? 'border-blue-200 bg-blue-50/50'
                    : 'border-gray-100 bg-white hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${session.isCurrent ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <DeviceIcon sx={{ fontSize: 22, color: session.isCurrent ? '#276EF1' : '#6B6B6B' }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {browser}{os ? ` on ${os}` : ''}
                    </Typography>
                    {session.isCurrent && (
                      <Chip label="This device" size="small" color="primary" variant="outlined"
                        sx={{ height: 20, fontSize: 11 }}
                      />
                    )}
                  </div>
                  <Typography variant="caption" color="text.secondary">
                    {session.ip !== 'Unknown' ? `${session.ip} · ` : ''}{timeAgo(session.createdAt)}
                  </Typography>
                </div>

                {!session.isCurrent && (
                  <Tooltip title="Logout this device">
                    <IconButton
                      size="small"
                      onClick={() => handleRevoke(session.deviceId)}
                      disabled={revoking === session.deviceId}
                      sx={{ color: '#ef4444' }}
                    >
                      <LogoutIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
