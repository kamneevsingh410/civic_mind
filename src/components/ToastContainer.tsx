import { useNotifications } from '../contexts/NotificationContext';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const iconMap = {
  success: <CheckCircle size={16} />,
  error: <XCircle size={16} />,
  info: <Info size={16} />,
  warning: <AlertTriangle size={16} />
};

const colorMap = {
  success: { bg: 'rgba(5, 150, 105, 0.08)', border: 'rgba(5, 150, 105, 0.2)', text: '#059669' },
  error: { bg: 'rgba(220, 38, 38, 0.08)', border: 'rgba(220, 38, 38, 0.2)', text: '#dc2626' },
  info: { bg: 'rgba(37, 99, 235, 0.08)', border: 'rgba(37, 99, 235, 0.2)', text: '#2563eb' },
  warning: { bg: 'rgba(217, 119, 6, 0.08)', border: 'rgba(217, 119, 6, 0.2)', text: '#d97706' }
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
      gap: '8px',
      maxWidth: '380px'
    }}>
      {toasts.map(toast => {
        const colors = colorMap[toast.type];
        return (
          <div
            key={toast.id}
            className="animate-slide-up"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
              fontSize: '0.82rem',
              color: colors.text,
              fontWeight: 500,
              backdropFilter: 'blur(8px)'
            }}
          >
            <span style={{ flexShrink: 0 }}>{iconMap[toast.type]}</span>
            <span style={{ flexGrow: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: colors.text,
                opacity: 0.6,
                padding: '2px',
                flexShrink: 0
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
