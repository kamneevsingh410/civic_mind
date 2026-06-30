import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../services/geminiService';
import { CheckCircle, Layers, Shield, Compass, Navigation } from 'lucide-react';

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
  const [localAddress, setLocalAddress] = useState<string>("Locating neighborhood...");

  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);

  // Reverse geocode user location
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

  // Dynamic Leaflet Assets Injection
  React.useEffect(() => {
    // Inject Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
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

  // Leaflet Map instance updates
  React.useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Centered at geolocated user coordinates
    const map = L.map(mapContainerRef.current, { doubleClickZoom: false }).setView([userLocation.lat, userLocation.lng], 14);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    // Plot pins
    issues.forEach(issue => {
      const isResolved = issue.status === 'resolved';
      const color = isResolved
        ? 'var(--color-healthy)'
        : issue.priorityScore > 80
          ? 'var(--color-critical)'
          : 'var(--color-warning)';

      const markerHtml = `
        <div class="${selectedIssueId === issue.id ? 'animate-pulse-glow' : ''}" style="
          width: 14px; 
          height: 14px; 
          background: ${color}; 
          border-radius: 50%; 
          border: 2px solid var(--bg-deep); 
          box-shadow: 0 0 10px ${color};
          --glow-color: ${color};
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

      // Bind popup info
      marker.bindPopup(`
        <div style="color:white; font-family:var(--font-body); font-size:0.75rem; line-height: 1.4;">
          <strong style="display:block;margin-bottom:2px;font-family:var(--font-heading); color:#ffffff">${issue.title}</strong>
          <span>Priority Rating: ${issue.priorityScore}/100</span><br/>
          <span>Status: ${issue.status.toUpperCase()}</span>
        </div>
      `, {
        closeButton: false,
        className: 'custom-leaflet-popup'
      });

      if (selectedIssueId === issue.id) {
        map.panTo([issue.latitude, issue.longitude]);
      }
    });

    // Add double-click coordinates node picker
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
              <div style="color:white; font-family:var(--font-body); font-size:0.72rem; min-width:150px; line-height:1.4;">
                <strong style="color:var(--color-primary); display:block; margin-bottom:4px;">📍 Selected GPS Node</strong>
                <span>Street: ${street}</span><br/>
                <span>City: ${city}</span><br/>
                <span style="color:var(--color-text-dark); font-size:0.65rem; display:block; margin-bottom:6px;">Coords: ${lat.toFixed(5)}, ${lng.toFixed(5)}</span>
                <button id="report-here-btn" style="
                  width: 100%;
                  padding: 6px;
                  background: var(--color-primary);
                  border: none;
                  border-radius: 4px;
                  color: white;
                  font-weight: 600;
                  cursor: pointer;
                  font-size: 0.7rem;
                ">⚠️ Report Issue Here</button>
              </div>
            `)
            .openOn(map);
        })
        .catch(() => {
          L.popup()
            .setLatLng(e.latlng)
            .setContent(`
              <div style="color:white; font-size:0.75rem; min-width:150px; line-height:1.4;">
                <span>Coordinate: ${lat.toFixed(5)}, ${lng.toFixed(5)}</span><br/>
                <button id="report-here-btn" style="
                  margin-top: 8px;
                  width: 100%;
                  padding: 6px;
                  background: var(--color-primary);
                  border: none;
                  border-radius: 4px;
                  color: white;
                  font-weight: 600;
                  cursor: pointer;
                  font-size: 0.7rem;
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
  }, [mapLoaded, issues, selectedIssueId, userLocation]);

  // Compute dynamic health indices for the local district based on unresolved active issues
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
          <h2 style={{ fontSize: '1.4rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={22} style={{ color: 'var(--color-primary)' }} />
            CivicMind AI — Real-World GIS Map
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Dynamic geolocation overlay. Centered around your neighborhood node with active municipal telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <Navigation size={14} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>GPS: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', flexGrow: 1 }}>
        {/* Map Rendering Container */}
        <div style={{
          position: 'relative',
          background: 'rgba(5, 7, 16, 0.6)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '12px',
          overflow: 'hidden',
          minHeight: '420px',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)',
          display: 'flex'
        }}>
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '420px', zIndex: 1 }} />
        </div>

        {/* Sidebar Info - Local stats and telemetry summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.01)', flexGrow: 1, padding: '16px' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Compass size={14} /> Local District Node
              </div>
              <h3 style={{ fontSize: '1rem', color: 'white', marginTop: '6px', wordBreak: 'break-word' }}>
                {localAddress}
              </h3>
            </div>

            {/* Overall District Health */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: getHealthColor(overallHealth) }}>
                {overallHealth}%
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>District Integrity Score</span>
                <span style={{ fontSize: '0.65rem', color: getHealthColor(overallHealth), fontWeight: 600 }}>
                  {overallHealth >= 85 ? 'Healthy Grid Status' : overallHealth >= 65 ? 'Elevated Alert Level' : 'Critical Grid Outage'}
                </span>
              </div>
            </div>

            {/* Local Health Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Road & Transport Health</span>
                  <span style={{ fontWeight: 600, color: getHealthColor(roadHealth) }}>{roadHealth}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', background: getHealthColor(roadHealth), width: `${roadHealth}%`, borderRadius: '2px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Water & Utilities Integrity</span>
                  <span style={{ fontWeight: 600, color: getHealthColor(waterHealth) }}>{waterHealth}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', background: getHealthColor(waterHealth), width: `${waterHealth}%`, borderRadius: '2px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Electrical & Lighting Grid</span>
                  <span style={{ fontWeight: 600, color: getHealthColor(electricalHealth) }}>{electricalHealth}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
                  <div style={{ height: '100%', background: getHealthColor(electricalHealth), width: `${electricalHealth}%`, borderRadius: '2px' }} />
                </div>
              </div>
            </div>

            {/* Asset Safety Safe-Zones */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={14} style={{ color: 'var(--color-primary)' }} />
                Active Proximity Cases ({activeIssues.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeIssues.length > 0 ? (
                  activeIssues.map(issue => (
                    <div
                      key={issue.id}
                      onClick={() => onSelectIssue(issue)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '8px 10px',
                        background: selectedIssueId === issue.id ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${selectedIssueId === issue.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)'}`,
                        borderRadius: '6px',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{ color: 'white', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '140px' }}>
                        {issue.title}
                      </span>
                      <span className={`badge ${issue.priorityScore > 80 ? 'badge-critical' : 'badge-warning'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                        P: {issue.priorityScore}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-healthy)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> Telemetry running green. No active anomalies.
                  </div>
                )}
              </div>
            </div>

            {/* Resolved History */}
            {resolvedIssues.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'white', marginBottom: '8px' }}>
                  Recently Resolved ({resolvedIssues.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {resolvedIssues.map(issue => (
                    <div
                      key={issue.id}
                      onClick={() => onSelectIssue(issue)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '6px 10px',
                        background: 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '6px',
                        color: 'var(--color-healthy)',
                        cursor: 'pointer',
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
