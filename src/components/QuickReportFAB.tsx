import React, { useState } from 'react';
import { Plus, X, Camera, MapPin, Mic } from 'lucide-react';

interface QuickReportFABProps {
  onNavigateToReport: () => void;
}

export const QuickReportFAB: React.FC<QuickReportFABProps> = ({ onNavigateToReport }) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: <Camera size={16} />, label: 'Photo Report', color: 'var(--color-primary)', onClick: onNavigateToReport },
    { icon: <MapPin size={16} />, label: 'Pin Location', color: 'var(--color-healthy)', onClick: onNavigateToReport },
    { icon: <Mic size={16} />, label: 'Voice Report', color: 'var(--color-warning)', onClick: onNavigateToReport }
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '28px',
      right: '28px',
      zIndex: 9000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px'
    }}>
      {isOpen && (
        <div className="animate-slide-up" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'center'
        }}>
          {actions.map((action, idx) => (
            <div
              key={idx}
              className="animate-slide-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animationDelay: `${idx * 50}ms`
              }}
            >
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 500,
                color: 'var(--color-text-main)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                padding: '4px 10px',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
              }}>
                {action.label}
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  action.onClick();
                }}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--bg-card)',
                  border: `1.5px solid ${action.color}30`,
                  color: action.color,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.15s ease'
                }}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: isOpen ? 'var(--color-text-main)' : 'var(--color-primary)',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(37, 99, 235, 0.3)',
          transition: 'all 0.25s ease',
          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
      >
        {isOpen ? <X size={22} /> : <Plus size={22} />}
      </button>
    </div>
  );
};
