import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../services/geminiService';
import { MapLayerControls, getTileUrl, type MapStyle } from './MapLayerControls';
import { CheckCircle, Layers, Shield, Compass, Navigation as NavigationIcon } from 'lucide-react';

interface DigitalTwinMapProps {
  issues: AnalysisResult[];
  onSelectIssue: (issue: AnalysisResult) => void;
  selectedIssueId?: string;
  userLocation: { lat: number; lng: number };
  onReportAtCoords: (lat: number, lng: number) => void;
}

export const DigitalTwinMap: React.FC<DigitalTwinMapProps> = ({
  issues,
  onSelectIssue,
  selectedIssueId,
  userLocation,
  onReportAtCoords
}) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState<MapStyle>('positron');
  const [localAddress, setLocalAddress] = useState<string>("Locating neighborhood...");

  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);

  useEffect(() => {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lng}`)
      .then(res => res.json())
      .then(data => {
        const road = data.address.road || "";
        const suburb = data.address.suburb || data.address.neighbourhood || data.address.village || "";
        const city = data.address.city || data.address.town || data.address.county || "";
        const formatted = [road, suburb, city].filter(Boolean).join(", ") || "Active City Core";
        setLocalAddress(formatted);
      })
      .catch(() => {
        setLocalAddress(`${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`);
      });
  }, [userLocation]);

  React.useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      if ((window as any).L) {
        setMapLoaded(true);
      }
    }
  }, []);

  React.useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, { doubleClickZoom: false }).setView([userLocation.lat, userLocation.lng], 14);
    mapInstanceRef.current = map;

    const tileUrl = getTileUrl(mapStyle);
    const tileLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);
    (map as any)._tileLayer = tileLayer;

    issues.forEach(issue => {
      const isResolved = issue.status === 'resolved';
      const color = isResolved
        ? '#059669'
        : issue.priorityScore > 80
          ? '#dc2626'
          : '#d97706';

      const markerHtml = `
        <div style="
          width: 14px; 
          height: 14px; 
          background: ${color}; 
          border-radius: 50%; 
          border: 2.5px solid white; 
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        "></div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: markerHtml,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon });
      marker.on('click', () => {
        onSelectIssue(issue);
      });
      marker.addTo(map);

      marker.bindPopup(`
        <div style="color: var(--color-text-main, #1e293b); font-size: 0.75rem; line-height: 1.4;">
          <strong style="display:block;margin-bottom:2px; color: #1e293b">${issue.title}</strong>
          <span>Priority: ${issue.priorityScore}/100</span><br/>
          <span>Status: ${issue.status.toUpperCase()}</span>
        </div>
      `, {
        closeButton: false,
      });

      if (selectedIssueId === issue.id) {
        map.panTo([issue.latitude, issue.longitude]);
      }
    });

    map.on('dblclick', (e: any) => {
      const { lat, lng } = e.latlng;

      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          const street = data.address.road || data.address.suburb || data.address.neighbourhood || "Unnamed Street";
          const city = data.address.city || data.address.town || data.address.county || "City Core";

          L.popup()
            .setLatLng(e.latlng)
            .setContent(`
              <div style="font-size:0.72rem; min-width:150px; line-height:1.4;">
                <strong style="color:#2563eb; display:block; margin-bottom:4px;">📍 Selected GPS Node</strong>
                <span>Street: ${street}</span><br/>
                <span>City: ${city}</span><br/>
                <span style="color:#94a3b8; font-size:0.65rem; display:block; margin-bottom:6px;">Coords: ${lat.toFixed(5)}, ${lng.toFixed(5)}</span>
                <button id="report-here-btn" style="
                  width: 100%;
                  padding: 6px;
                  background: #2563eb;
                  border: none;
                  border-radius: 6px;
                  color: white;
                  font-weight: 600;
                  cursor: pointer;
                  font-size: 0.72rem;
                ">⚠️ Report Issue Here</button>
              </div>
            `)
            .openOn(map);
        })
        .catch(() => {
          L.popup()
            .setLatLng(e.latlng)
            .setContent(`
              <div style="font-size:0.75rem; min-width:150px; line-height:1.4;">
                <span>Coordinate: ${lat.toFixed(5)}, ${lng.toFixed(5)}</span><br/>
                <button id="report-here-btn" style="
                  margin-top: 8px;
                  width: 100%;
                  padding: 6px;
                  background: #2563eb;
                  border: none;
                  border-radius: 6px;
                  color: white;
                  font-weight: 600;
                  cursor: pointer;
                  font-size: 0.72rem;
                ">⚠️ Report Issue Here</button>
              </div>
            `)
            .openOn(map);
        });
    });

    map.on('popupopen', (e: any) => {
      const btn = document.getElementById('report-here-btn');
      if (btn) {
        btn.onclick = () => {
          const latlng = e.popup.getLatLng();
          onReportAtCoords(latlng.lat, latlng.lng);
        };
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapLoaded, issues, selectedIssueId, userLocation, mapStyle]);

  const activeIssues = issues.filter(i => i.status !== 'resolved');
  const resolvedIssues = issues.filter(i => i.status === 'resolved');
  
  const roadHealth = Math.max(50, 100 - (activeIssues.filter(i => i.category === 'Road & Transport').length * 15));
  const waterHealth = Math.max(50, 100 - (activeIssues.filter(i => i.category === 'Water & Utilities').length * 15));
  const electricalHealth = Math.max(50, 100 - (activeIssues.filter(i => i.category === 'Electrical & Lighting').length * 15));
  const overallHealth = Math.round((roadHealth + waterHealth + electricalHealth) / 3);

  const getHealthColor = (health: number) => {
    if (health >= 85) return 'var(--color-healthy)';
    if (health >= 65) return 'var(--color-warning)';
    return 'var(--color-critical)';
  };

  return (
    <div className="glass-panel col-12" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '560px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} style={{ color: 'var(--color-primary)' }} />
            CivicMind — Real-World GIS Map
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Dynamic geolocation overlay centered around your neighborhood with active municipal telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <MapLayerControls activeStyle={mapStyle} onStyleChange={setMapStyle} />
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            alignItems: 'center', 
            background: 'var(--bg-deep)', 
            padding: '8px 14px', 
            borderRadius: '10px', 
            border: '1px solid var(--border-subtle)' 
          }}>
            <NavigationIcon size={13} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
              GPS: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', flexGrow: 1 }}>
        {/* Map Container */}
        <div style={{
          position: 'relative',
          background: '#e8ecf0',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          overflow: 'hidden',
          minHeight: '420px',
          display: 'flex'
        }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '420px', zIndex: 1 }} />
        </div>

        {/* Sidebar Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="glass-panel" style={{ flexGrow: 1, padding: '16px' }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <Compass size={13} /> Local District Node
              </div>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--color-text-main)', marginTop: '6px', wordBreak: 'break-word' }}>
                {localAddress}
              </h3>
            </div>

            {/* Overall Health */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              background: 'var(--bg-deep)', 
              padding: '12px', 
              borderRadius: '10px', 
              marginBottom: '16px', 
              border: '1px solid var(--border-subtle)' 
            }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: getHealthColor(overallHealth) }}>
                {overallHealth}%
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>District Integrity</span>
                <span style={{ fontSize: '0.65rem', color: getHealthColor(overallHealth), fontWeight: 600 }}>
                  {overallHealth >= 85 ? 'Healthy Grid' : overallHealth >= 65 ? 'Elevated Alert' : 'Critical Outage'}
                </span>
              </div>
            </div>

            {/* Health Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Road & Transport', value: roadHealth },
                { label: 'Water & Utilities', value: waterHealth },
                { label: 'Electrical Grid', value: electricalHealth }
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: getHealthColor(item.value) }}>{item.value}%</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px' }}>
                    <div className="health-bar-fill" style={{ height: '100%', background: getHealthColor(item.value), width: `${item.value}%`, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Active Cases */}
            <div style={{ marginTop: '18px' }}>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--color-text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Shield size={13} style={{ color: 'var(--color-primary)' }} />
                Active Cases ({activeIssues.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeIssues.length > 0 ? (
                  activeIssues.map(issue => (
                    <div
                      key={issue.id}
                      onClick={() => onSelectIssue(issue)}
                      className="map-sidebar-card"
                      style={{
                        fontSize: '0.72rem',
                        padding: '8px 10px',
                        background: selectedIssueId === issue.id ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-deep)',
                        border: `1px solid ${selectedIssueId === issue.id ? 'rgba(37, 99, 235, 0.15)' : 'var(--border-subtle)'}`,
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ 
                        color: 'var(--color-text-main)', 
                        fontWeight: 500,
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        maxWidth: '140px' 
                      }}>
                        {issue.title}
                      </span>
                      <span className={`badge ${issue.priorityScore > 80 ? 'badge-critical' : 'badge-warning'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                        P: {issue.priorityScore}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-healthy)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={13} /> All clear — no active anomalies.
                  </div>
                )}
              </div>
            </div>

            {/* Resolved */}
            {resolvedIssues.length > 0 && (
              <div style={{ marginTop: '14px' }}>
                <h4 style={{ fontSize: '0.78rem', color: 'var(--color-text-main)', marginBottom: '8px' }}>
                  Recently Resolved ({resolvedIssues.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {resolvedIssues.map(issue => (
                    <div
                      key={issue.id}
                      onClick={() => onSelectIssue(issue)}
                      className="map-sidebar-card"
                      style={{
                        fontSize: '0.72rem',
                        padding: '6px 10px',
                        background: 'rgba(5, 150, 105, 0.03)',
                        border: '1px solid rgba(5, 150, 105, 0.12)',
                        borderRadius: '8px',
                        color: 'var(--color-healthy)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '180px' }}>
                        ✓ {issue.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
