import React from 'react';
import { Map, Satellite, Layers } from 'lucide-react';

export type MapStyle = 'standard' | 'positron' | 'dark-matter';

interface MapLayerControlsProps {
  activeStyle: MapStyle;
  onStyleChange: (style: MapStyle) => void;
}

const STYLES: { key: MapStyle; label: string; icon: React.ReactNode }[] = [
  { key: 'standard', label: 'Standard', icon: <Map size={13} /> },
  { key: 'positron', label: 'Light', icon: <Layers size={13} /> },
  { key: 'dark-matter', label: 'Dark', icon: <Satellite size={13} /> }
];

const TILE_URLS: Record<MapStyle, string> = {
  standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  positron: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  'dark-matter': 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
};

export const getTileUrl = (style: MapStyle) => TILE_URLS[style];

export const MapLayerControls: React.FC<MapLayerControlsProps> = ({ activeStyle, onStyleChange }) => {
  return (
    <div style={{
      display: 'flex',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '8px',
      padding: '3px',
      gap: '2px'
    }}>
      {STYLES.map(s => (
        <button
          type="button"
          key={s.key}
          onClick={() => onStyleChange(s.key)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.68rem',
            fontWeight: activeStyle === s.key ? 600 : 400,
            color: activeStyle === s.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
            background: activeStyle === s.key ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
            transition: 'all 0.15s ease',
            fontFamily: 'var(--font-body)'
          }}
        >
          {s.icon}
          {s.label}
        </button>
      ))}
    </div>
  );
};
