import { useState, useEffect, useCallback, useMemo } from 'react';
import { MOCK_ISSUES, generateAgentLogs } from './services/geminiService';
import type { AnalysisResult, PredictionNode, RepairPlan } from './services/geminiService';
import { DigitalTwinMap } from './components/DigitalTwinMap';
import { SmartDetection } from './components/SmartDetection';
import { AgentCommandCenter } from './components/AgentCommandCenter';
import { AuthorityPortal } from './components/AuthorityPortal';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { CommunityHero } from './components/CommunityHero';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { ToastContainer } from './components/ToastContainer';
import { NotificationBell } from './components/NotificationBell';
import { IssueSearchBar } from './components/IssueSearchBar';
import { IssueTimeline } from './components/IssueTimeline';
import { IssueComments } from './components/IssueComments';
import { ExportButton } from './components/ExportButton';
import { QuickReportFAB } from './components/QuickReportFAB';
import { LocationPicker } from './components/LocationPicker';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  DEFAULT_COORDS, TAB_ROUTES, TAB_SHORTCUTS,
  ROLE_TABS, STORAGE_KEYS, POINTS, reverseGeocode
} from './config';
import {
  Layers, Upload, Cpu, Clipboard, BarChart2, Award,
  Sparkles, Key, Shield, ChevronLeft, ChevronRight,
  Navigation as NavigationIcon
} from 'lucide-react';
import './App.css';

const createInitialIssues = (userLat: number, userLng: number): AnalysisResult[] => {
  const timestamp = new Date().toISOString();

  const potholeLat = userLat + 0.0018;
  const potholeLng = userLng - 0.0034;
  const potholePreset = MOCK_ISSUES['pothole']!;
  const potholeLogs = generateAgentLogs(potholePreset.title!, potholePreset.category!, potholeLat, potholeLng, potholePreset.severity!, 120, 740);

  const leakageLat = userLat - 0.0035;
  const leakageLng = userLng + 0.0049;
  const leakagePreset = MOCK_ISSUES['leakage']!;
  const leakageLogs = generateAgentLogs(leakagePreset.title!, leakagePreset.category!, leakageLat, leakageLng, leakagePreset.severity!, 820, 910);

  const lightLat = userLat + 0.0069;
  const lightLng = userLng - 0.0070;
  const lightPreset = MOCK_ISSUES['streetlight']!;
  const lightLogs = generateAgentLogs(lightPreset.title!, lightPreset.category!, lightLat, lightLng, lightPreset.severity!, 610, 180);

  return [
    {
      id: 'issue-1', title: potholePreset.title!, category: potholePreset.category!,
      severity: potholePreset.severity!, confidence: potholePreset.confidence!,
      infrastructure: potholePreset.infrastructure!, description: potholePreset.description!,
      hazards: potholePreset.hazards!, latitude: potholeLat, longitude: potholeLng,
      priorityScore: 92, agentLogs: potholeLogs,
      predictions: potholePreset.predictions as PredictionNode[],
      plan: potholePreset.plan as RepairPlan, status: 'investigated',
      imageBefore: potholePreset.imageBefore!, verificationCount: 2, trustScore: 88, createdAt: timestamp
    },
    {
      id: 'issue-2', title: leakagePreset.title!, category: leakagePreset.category!,
      severity: leakagePreset.severity!, confidence: leakagePreset.confidence!,
      infrastructure: leakagePreset.infrastructure!, description: leakagePreset.description!,
      hazards: leakagePreset.hazards!, latitude: leakageLat, longitude: leakageLng,
      priorityScore: 68, agentLogs: leakageLogs,
      predictions: leakagePreset.predictions as PredictionNode[],
      plan: leakagePreset.plan as RepairPlan, status: 'investigated',
      imageBefore: leakagePreset.imageBefore!, verificationCount: 1, trustScore: 82, createdAt: timestamp
    },
    {
      id: 'issue-3', title: lightPreset.title!, category: lightPreset.category!,
      severity: lightPreset.severity!, confidence: lightPreset.confidence!,
      infrastructure: lightPreset.infrastructure!, description: lightPreset.description!,
      hazards: lightPreset.hazards!, latitude: lightLat, longitude: lightLng,
      priorityScore: 78, agentLogs: lightLogs,
      predictions: lightPreset.predictions as PredictionNode[],
      plan: lightPreset.plan as RepairPlan, status: 'investigated',
      imageBefore: lightPreset.imageBefore!, verificationCount: 3, trustScore: 94, createdAt: timestamp
    }
  ];
};

function AppContent() {
  const { addToast } = useNotifications();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: DEFAULT_COORDS.lat, lng: DEFAULT_COORDS.lng });
  const [issues, setIssues] = useState<AnalysisResult[]>(() => createInitialIssues(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng));
  const [filteredIssues, setFilteredIssues] = useState<AnalysisResult[]>(issues);
  const [activeTab, setActiveTab] = useState<string>('digital-twin');
  const [selectedIssueId, setSelectedIssueId] = useState<string>('issue-1');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userRole, setUserRole] = useState<string>('official');
  const [apiKey, setApiKey] = useState<string>(() => {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
  });
  const [showKeyDrawer, setShowKeyDrawer] = useState(false);
  const [keyInputValue, setKeyInputValue] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showIssueDetail, setShowIssueDetail] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationLabel, setLocationLabel] = useState('Detecting...');

  const [userPoints, setUserPoints] = useState<{ trust: number; verification: number; rank: number }>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POINTS);
    return saved ? JSON.parse(saved) : { trust: 0, verification: 0, rank: 1 };
  });

  const [profileName, setProfileName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.USERNAME) || '';
  });
  const [showProfileSetup, setShowProfileSetup] = useState(!localStorage.getItem(STORAGE_KEYS.USERNAME));
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    const detectLocation = async () => {
      // 1. Try browser geolocation first
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true, timeout: 5000, maximumAge: 0,
            });
          });
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setIssues(createInitialIssues(lat, lng));
          // Reverse geocode for the label
          try {
            setLocationLabel(await reverseGeocode(lat, lng));
          } catch {
            setLocationLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
          return;
        } catch {
          // Browser geolocation failed, try IP fallback
        }
      }

      // 2. Fallback: IP-based geolocation via free APIs
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            setUserLocation({ lat: data.latitude, lng: data.longitude });
            setIssues(createInitialIssues(data.latitude, data.longitude));
            setLocationLabel(`${data.city || ''}, ${data.country_name || ''}`.replace(/^, /, '').trim() || `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`);
            return;
          }
        }
      } catch {
        // IP API 1 failed, try alternative
      }

      // 3. Fallback: second IP geolocation service
      try {
        const res = await fetch('https://ipwho.is/');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.latitude && data.longitude) {
            setUserLocation({ lat: data.latitude, lng: data.longitude });
            setIssues(createInitialIssues(data.latitude, data.longitude));
            setLocationLabel(`${data.city || ''}, ${data.country || ''}`.replace(/^, /, '').trim() || `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`);
            return;
          }
        }
      } catch {
        // All methods failed — keep last-known location from localStorage
      }

      // 4. Final fallback: check localStorage for last known location
      const saved = localStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
      if (saved) {
        try {
          const loc = JSON.parse(saved);
          setUserLocation(loc);
          setIssues(createInitialIssues(loc.lat, loc.lng));
          setLocationLabel(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
        } catch { /* ignore */ }
      }

      // 5. All auto-detection failed — show manual picker
      setShowLocationPicker(true);
      setLocationLabel('Manual Selection');
    };

    detectLocation();
  }, []);

  // Save location to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(userLocation));
  }, [userLocation]);

  const handleLocationSelect = (lat: number, lng: number, label: string) => {
    setUserLocation({ lat, lng });
    setIssues(createInitialIssues(lat, lng));
    setLocationLabel(label);
    addToast(`Location set to ${label}`, 'success');
  };

  // Keep filtered issues in sync
  useEffect(() => {
    setFilteredIssues(issues);
  }, [issues]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowKeyDrawer(false);
        setShowIssueDetail(false);
      }
      // Number keys 1-6 for tab switching (only when not in input)
      if (['1', '2', '3', '4', '5', '6'].includes(e.key) && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)) {
        const tab = TAB_SHORTCUTS[e.key];
        if (tab) setActiveTab(tab);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const activeIssue = issues.find(i => i.id === selectedIssueId);

  const handleAnalysisStarted = () => {
    setIsAnalyzing(true);
    setActiveTab('command-center');
    addToast('AI analysis initiated — agents are processing your report.', 'info');
  };

  const handleAnalysisComplete = (newIssue: AnalysisResult) => {
    setIssues(prev => [newIssue, ...prev]);
    setSelectedIssueId(newIssue.id);
    setIsAnalyzing(false);
    addToast(`Issue "${newIssue.title}" analyzed and added to the queue.`, 'success');
  };

  const handleIssueResolved = (issueId: string, imageAfter: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return { ...issue, status: 'resolved', imageAfter };
      }
      return issue;
    }));

    setUserPoints((prev: { trust: number; verification: number; rank: number }) => {
      const next = { ...prev, trust: prev.trust + POINTS.ISSUE_RESOLVED, rank: Math.floor((prev.trust + POINTS.ISSUE_RESOLVED) / 100) + 1 };
      localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(next));
      return next;
    });

    addToast('Issue resolved! +50 Trust Points earned.', 'success');
  };

  const handleVerifyIssue = (issueId: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return { ...issue, verificationCount: Math.min(4, issue.verificationCount + 1) };
      }
      return issue;
    }));

    setUserPoints((prev: { trust: number; verification: number; rank: number }) => {
      const next = { ...prev, trust: prev.trust + POINTS.ISSUE_VERIFIED, verification: prev.verification + 1, rank: Math.floor((prev.trust + POINTS.ISSUE_VERIFIED) / 100) + 1 };
      localStorage.setItem(STORAGE_KEYS.POINTS, JSON.stringify(next));
      return next;
    });

    addToast('Issue verified! +15 Trust Points earned.', 'success');
  };

  const unresolvedCount = useMemo(() => issues.filter(i => i.status !== 'resolved').length, [issues]);

  const maskedKey = useMemo(() => {
    if (!apiKey) return '';
    if (apiKey.length <= 8) return '••••••••';
    return apiKey.substring(0, 4) + '••••' + apiKey.substring(apiKey.length - 4);
  }, [apiKey]);

  const handleOpenKeyDrawer = () => {
    setKeyInputValue('');
    setShowKeyDrawer(true);
  };

  const handleSaveKey = useCallback(() => {
    if (keyInputValue.trim()) {
      setApiKey(keyInputValue.trim());
      localStorage.setItem(STORAGE_KEYS.API_KEY, keyInputValue.trim());
      addToast('Gemini API key saved successfully.', 'success');
    }
    setShowKeyDrawer(false);
  }, [keyInputValue, addToast]);

  const renderSidebarLinks = () => {
    const links = [
      { id: 'digital-twin', label: 'Digital Twin Map', icon: <Layers size={18} /> },
      { id: 'detection', label: 'Report Issue', icon: <Upload size={18} /> },
      { id: 'command-center', label: 'Agent Command Center', icon: <Cpu size={18} /> },
      { id: 'authority', label: 'Resolution Planning', icon: <Clipboard size={18} /> },
      { id: 'analytics', label: 'Civic Analytics', icon: <BarChart2 size={18} /> },
      { id: 'gamification', label: 'Community Hero', icon: <Award size={18} /> },
    ];
    const allowedTabs = ROLE_TABS[userRole] || [];

    return links
      .filter(l => allowedTabs.includes(l.id))
      .map(l => (
        <li
          key={l.id}
          onClick={() => setActiveTab(l.id)}
          className={`sidebar-item ${activeTab === l.id ? 'active' : ''}`}
          title={sidebarCollapsed ? l.label : undefined}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab(l.id); }}
        >
          {l.icon}
          {!sidebarCollapsed && l.label}
        </li>
      ));
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <aside className="sidebar" style={{
        width: sidebarCollapsed ? '60px' : '270px',
        transition: 'width 0.25s ease',
        overflow: 'hidden'
      }}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Sparkles size={18} />
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="sidebar-logo-text">CivicMind</h1>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Urban Intelligence OS
              </span>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">System Access</label>
            <select
              className="form-select"
              value={userRole}
              onChange={(e) => {
                const role = e.target.value;
                setUserRole(role);
                if (role === 'citizen') setActiveTab('digital-twin');
                if (role === 'official') setActiveTab('digital-twin');
                if (role === 'volunteer') setActiveTab('gamification');
                if (role === 'admin') setActiveTab('command-center');
              }}
              style={{ width: '100%', fontSize: '0.82rem' }}
            >
              <option value="citizen">👤 Citizen</option>
              <option value="volunteer">🙋 Volunteer</option>
              <option value="official">🏢 Official</option>
              <option value="admin">⚙️ Admin</option>
            </select>
          </div>
        )}

        <ul className="sidebar-menu">
          {renderSidebarLinks()}
        </ul>

        {!sidebarCollapsed && (
          <div className="sidebar-profile">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-agent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0
              }}>
                🎖️
              </div>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--color-text-main)', display: 'block', fontSize: '0.85rem' }}>
                  {profileName || 'Hero'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>XP: {userPoints.trust} pts</span>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            position: 'absolute',
            right: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 101,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
          }}
        >
          {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main Viewport */}
      <main className="main-viewport" style={{
        marginLeft: sidebarCollapsed ? '0' : undefined,
        transition: 'margin 0.25s ease'
      }}>

        {/* Header */}
        <header className="dashboard-header">
          <div className="dashboard-title-area">
            <h1>{TAB_ROUTES[activeTab as keyof typeof TAB_ROUTES]?.title || 'CivicMind'}</h1>
            <p>{TAB_ROUTES[activeTab as keyof typeof TAB_ROUTES]?.description || ''}</p>
          </div>

          <div className="dashboard-meta">
            {activeTab === 'analytics' && (
              <ExportButton issues={issues} />
            )}

            <button
              onClick={handleOpenKeyDrawer}
              className="btn"
              aria-label="Configure Gemini API key"
              style={{
                fontSize: '0.78rem', padding: '8px 14px',
                borderColor: apiKey ? 'rgba(5, 150, 105, 0.2)' : 'var(--border-subtle)',
                color: apiKey ? 'var(--color-healthy)' : 'var(--color-text-muted)',
                background: apiKey ? 'rgba(5, 150, 105, 0.04)' : 'var(--bg-card)'
              }}
            >
              <Key size={14} />
              {apiKey ? '● Connected' : 'Configure Key'}
            </button>

            <NotificationBell issues={issues} />

            {/* Location indicator — click to change location */}
            <button
              onClick={() => setShowLocationPicker(true)}
              className="btn"
              aria-label="Change location"
              style={{
                fontSize: '0.78rem', padding: '8px 14px', gap: '6px',
                borderColor: 'rgba(8, 145, 178, 0.2)',
                color: 'var(--color-geo)',
                background: 'rgba(8, 145, 178, 0.04)'
              }}
            >
              <NavigationIcon size={14} />
              {locationLabel}
            </button>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
              padding: '8px 14px', borderRadius: '10px'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                {unresolvedCount} active
              </span>
            </div>
          </div>
        </header>

        {/* API Key Configuration Drawer */}
        {showKeyDrawer && (
          <div className="glass-panel key-drawer-overlay animate-slide-up" style={{ padding: '20px', borderRadius: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--color-text-main)', marginBottom: '4px' }}>
                  Gemini API Configuration
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: '1.5', maxWidth: '500px' }}>
                  Enter a Gemini developer API Key to enable real vision analysis on uploaded images. Keys are stored locally in your browser.
                </p>
              </div>
              {apiKey && (
                <span className="badge badge-healthy" style={{ fontSize: '0.65rem' }}>
                  ● Currently Active
                </span>
              )}
            </div>

            <div style={{
              display: 'flex', gap: '10px', alignItems: 'center',
              background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)',
              borderRadius: '10px', padding: '4px 4px 4px 14px'
            }}>
              <Key size={14} style={{ color: 'var(--color-text-dark)', flexShrink: 0 }} />
              <input
                type="password"
                className="form-input api-key-masked"
                placeholder="Enter your Gemini API key..."
                value={keyInputValue}
                onChange={(e) => setKeyInputValue(e.target.value)}
                style={{ flexGrow: 1, fontSize: '0.82rem', border: 'none', background: 'transparent', boxShadow: 'none', padding: '10px 0' }}
                autoFocus
              />
              <button type="button" onClick={handleSaveKey} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.82rem', borderRadius: '8px', flexShrink: 0 }}>
                Save
              </button>
              <button type="button" onClick={() => setShowKeyDrawer(false)} className="btn" style={{ padding: '10px 14px', fontSize: '0.82rem', borderRadius: '8px', flexShrink: 0 }}>
                Cancel
              </button>
            </div>

            {apiKey && (
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={13} style={{ color: 'var(--color-text-dark)' }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-dark)' }}>
                  Key stored locally: {maskedKey}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setApiKey('');
                    localStorage.removeItem(STORAGE_KEYS.API_KEY);
                    addToast('Gemini API key removed.', 'warning');
                  }}
                  style={{ fontSize: '0.72rem', color: 'var(--color-critical)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, padding: '2px 4px' }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {/* Global Search Bar — shown on map, authority, and analytics tabs */}
        {(activeTab === 'digital-twin' || activeTab === 'authority' || activeTab === 'analytics') && (
          <IssueSearchBar issues={issues} onFiltered={setFilteredIssues} />
        )}

        {/* Tab Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flexGrow: 1 }} key={activeTab} className="animate-slide-up">
          {activeTab === 'digital-twin' && (
            <DigitalTwinMap
              issues={filteredIssues}
              onSelectIssue={(issue) => {
                setSelectedIssueId(issue.id);
                setShowIssueDetail(true);
              }}
              selectedIssueId={selectedIssueId}
              userLocation={userLocation}
              onReportAtCoords={(_lat, _lng) => {
                setActiveTab('detection');
              }}
            />
          )}

          {activeTab === 'detection' && (
            <SmartDetection
              onAnalysisStarted={handleAnalysisStarted}
              onAnalysisComplete={handleAnalysisComplete}
              apiKey={apiKey}
              userLocation={userLocation}
            />
          )}

          {activeTab === 'command-center' && (
            <AgentCommandCenter
              logs={activeIssue?.agentLogs || []}
              isAnalyzing={isAnalyzing}
            />
          )}

          {activeTab === 'authority' && (
            <AuthorityPortal
              issues={filteredIssues}
              onSelectIssue={(issue) => {
                setSelectedIssueId(issue.id);
                setShowIssueDetail(true);
              }}
              selectedIssue={activeIssue}
              onIssueResolved={handleIssueResolved}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPanel issues={filteredIssues} />
          )}

          {activeTab === 'gamification' && (
            <CommunityHero
              issues={issues}
              onVerifyIssue={handleVerifyIssue}
              userPoints={userPoints}
              profileName={profileName}
            />
          )}
        </div>

        {/* Issue Detail Panel — shows timeline + comments for selected issue */}
        {showIssueDetail && activeIssue && (activeTab === 'digital-twin' || activeTab === 'authority') && (
          <div
            className="glass-panel animate-slide-up"
            style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className={`badge ${activeIssue.status === 'resolved' ? 'badge-healthy' : 'badge-info'}`} style={{ fontSize: '0.6rem' }}>
                    {activeIssue.status.toUpperCase()}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-main)', marginTop: '4px' }}>
                    {activeIssue.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIssueDetail(false)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-dark)', fontSize: '0.72rem', fontWeight: 500,
                    padding: '4px 8px', borderRadius: '6px'
                  }}
                >
                  ✕ Close
                </button>
              </div>
              <IssueTimeline issue={activeIssue} />
            </div>
            <IssueComments issueId={activeIssue.id} profileName={profileName} />
          </div>
        )}

      </main>

      {/* Location Picker Modal */}
      <LocationPicker
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onLocationSelect={handleLocationSelect}
        currentLocation={userLocation}
      />

      {/* Quick Report FAB */}
      <QuickReportFAB onNavigateToReport={() => setActiveTab('detection')} />

      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(245, 246, 248, 0.92)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '24px'
        }}>
          <div className="glass-panel animate-slide-up" style={{
            maxWidth: '420px', width: '100%', display: 'flex', flexDirection: 'column',
            gap: '20px', padding: '36px', borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-agent))',
                width: '56px', height: '56px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: '1.6rem', color: 'white',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
              }}>
                🎖️
              </div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--color-text-main)', fontFamily: 'var(--font-heading)' }}>
                Initialize Hero Persona
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '8px', lineHeight: '1.5' }}>
                Welcome to CivicMind. Create your Community Hero identity to register local validation contributions.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Profile Name</label>
              <input
                type="text" className="form-input" placeholder="Enter your name..."
                value={tempName} onChange={(e) => setTempName(e.target.value)}
                maxLength={20} required
              />
            </div>

            <button
              onClick={() => {
                if (tempName.trim()) {
                  const cleaned = tempName.trim();
                  localStorage.setItem(STORAGE_KEYS.USERNAME, cleaned);
                  setProfileName(cleaned);
                  setShowProfileSetup(false);
                  addToast(`Welcome, ${cleaned}! Your hero profile is ready.`, 'success');
                }
              }}
              className="btn btn-primary"
              style={{ padding: '12px', justifyContent: 'center', borderRadius: '10px' }}
            >
              Sync Persona & Enter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AppContent />
        <ToastContainer />
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
