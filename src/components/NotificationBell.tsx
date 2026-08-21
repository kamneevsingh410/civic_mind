import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Upload, Shield } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'report' | 'resolved' | 'verified' | 'alert';
  message: string;
  time: string;
  read: boolean;
}

interface NotificationBellProps {
  issues: Array<{ title: string; status: string; verificationCount: number }>;
}

export const NotificationBell = ({ issues }: NotificationBellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate activities once when issues change, preserving read state
  useEffect(() => {
    setActivities(prev => {
      const generated: ActivityItem[] = issues.map((issue, idx) => {
        const existing = prev.find(a => a.id === `activity-${idx}`);
        return {
          id: `activity-${idx}`,
          type: issue.status === 'resolved' ? 'resolved' : idx % 2 === 0 ? 'report' : 'verified',
          message: issue.status === 'resolved'
            ? `"${issue.title}" has been repaired and closed.`
            : issue.verificationCount > 2
            ? `"${issue.title}" reached community consensus (${issue.verificationCount}/4).`
            : `New issue reported: "${issue.title}" — awaiting investigation.`,
          time: `${(idx + 1) * 12}m ago`,
          read: existing?.read ?? idx > 1
        };
      });
      return generated;
    });
  }, [issues]);

  const unreadCount = activities.filter(a => !a.read).length;

  const markAllRead = () => {
    setActivities(prev => prev.map(a => ({ ...a, read: true })));
  };

  const iconMap = {
    report: <Upload size={13} style={{ color: 'var(--color-primary)' }} />,
    resolved: <CheckCircle2 size={13} style={{ color: 'var(--color-healthy)' }} />,
    verified: <Shield size={13} style={{ color: 'var(--color-agent)' }} />,
    alert: <AlertTriangle size={13} style={{ color: 'var(--color-warning)' }} />
  };

  const bgMap = {
    report: 'rgba(37, 99, 235, 0.06)',
    resolved: 'rgba(5, 150, 105, 0.06)',
    verified: 'rgba(124, 58, 237, 0.06)',
    alert: 'rgba(217, 119, 6, 0.06)'
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        style={{
          padding: '8px 12px',
          position: 'relative',
          fontSize: '0.78rem'
        }}
      >
        <Bell size={16} style={{ color: 'var(--color-text-muted)' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '6px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'var(--color-critical)',
            color: 'white',
            fontSize: '0.58rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="animate-slide-up"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '340px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              Activity Feed
            </span>
            {unreadCount > 0 && (
              <span className="badge badge-info" style={{ fontSize: '0.6rem' }}>
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              style={{
                width: '100%', padding: '8px', textAlign: 'center',
                background: 'none', border: 'none', borderBottom: '1px solid var(--border-subtle)',
                cursor: 'pointer', fontSize: '0.72rem', color: 'var(--color-primary)',
                fontWeight: 500, fontFamily: 'var(--font-body)'
              }}
            >
              Mark all as read
            </button>
          )}

          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {activities.map(activity => (
              <div
                key={activity.id}
                className={`notification-item ${activity.read ? '' : 'unread'}`}
                onClick={() => {
                  setActivities(prev => prev.map(a => a.id === activity.id ? { ...a, read: true } : a));
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: bgMap[activity.type],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {iconMap[activity.type]}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-text-main)',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {activity.message}
                  </p>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-dark)', marginTop: '3px', display: 'block' }}>
                    {activity.time}
                  </span>
                </div>
                {!activity.read && (
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    flexShrink: 0,
                    marginTop: '6px'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
