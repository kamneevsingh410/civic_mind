import { useState, useEffect } from 'react';
import { MOCK_ISSUES, generateAgentLogs } from './services/geminiService';
import type { AnalysisResult, PredictionNode, RepairPlan } from './services/geminiService';
import { DigitalTwinMap } from './components/DigitalTwinMap';
import { SmartDetection } from './components/SmartDetection';
import { AgentCommandCenter } from './components/AgentCommandCenter';
import { AuthorityPortal } from './components/AuthorityPortal';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { CommunityHero } from './components/CommunityHero';
import {
  Layers,
  Upload,
  Cpu,
  Clipboard,
  BarChart2,
  Award,
  Sparkles,
  Key,
  Bell
} from 'lucide-react';
import './App.css';

// Default coordinates (Bangalore Center)
const DEFAULT_LAT = 12.97159;
const DEFAULT_LNG = 77.59456;

// Initializing the 3 starter issues matching geolocated coordinates
const createInitialIssues = (userLat: number, userLng: number): AnalysisResult[] => {
  const timestamp = new Date().toISOString();
  
  // 1. Pothole near geolocated center
  const potholeLat = userLat + 0.0018;
  const potholeLng = userLng - 0.0034;
  const potholePreset = MOCK_ISSUES['pothole']!;
  const potholeLogs = generateAgentLogs(
    potholePreset.title!,
    potholePreset.category!,
    potholeLat,
    potholeLng,
    potholePreset.severity!,
    120, // 120m from hospital
    740  // 740m from school
  );

  // 2. Water leak near geolocated center
  const leakageLat = userLat - 0.0035;
  const leakageLng = userLng + 0.0049;
  const leakagePreset = MOCK_ISSUES['leakage']!;
  const leakageLogs = generateAgentLogs(
    leakagePreset.title!,
    leakagePreset.category!,
    leakageLat,
    leakageLng,
    leakagePreset.severity!,
    820,
    910
  );

  // 3. Streetlight cluster outage near geolocated center
  const lightLat = userLat + 0.0069;
  const lightLng = userLng - 0.0070;
  const lightPreset = MOCK_ISSUES['streetlight']!;
  const lightLogs = generateAgentLogs(
    lightPreset.title!,
    lightPreset.category!,
    lightLat,
    lightLng,
    lightPreset.severity!,
    610,
    180 // 180m from school
  );

  return [
    {
      id: 'issue-1',
      title: potholePreset.title!,
      category: potholePreset.category!,
      severity: potholePreset.severity!,
      confidence: potholePreset.confidence!,
      infrastructure: potholePreset.infrastructure!,
      description: potholePreset.description!,
      hazards: potholePreset.hazards!,
      latitude: potholeLat,
      longitude: potholeLng,
      priorityScore: 92, // Critical hospital priority
      agentLogs: potholeLogs,
      predictions: potholePreset.predictions as PredictionNode[],
      plan: potholePreset.plan as RepairPlan,
      status: 'investigated',
      imageBefore: potholePreset.imageBefore!,
      verificationCount: 2,
      trustScore: 88,
      createdAt: timestamp
    },
    {
      id: 'issue-2',
      title: leakagePreset.title!,
      category: leakagePreset.category!,
      severity: leakagePreset.severity!,
      confidence: leakagePreset.confidence!,
      infrastructure: leakagePreset.infrastructure!,
      description: leakagePreset.description!,
      hazards: leakagePreset.hazards!,
      latitude: leakageLat,
      longitude: leakageLng,
      priorityScore: 68,
      agentLogs: leakageLogs,
      predictions: leakagePreset.predictions as PredictionNode[],
      plan: leakagePreset.plan as RepairPlan,
      status: 'investigated',
      imageBefore: leakagePreset.imageBefore!,
      verificationCount: 1,
      trustScore: 82,
      createdAt: timestamp
    },
    {
      id: 'issue-3',
      title: lightPreset.title!,
      category: lightPreset.category!,
      severity: lightPreset.severity!,
      confidence: lightPreset.confidence!,
      infrastructure: lightPreset.infrastructure!,
      description: lightPreset.description!,
      hazards: lightPreset.hazards!,
      latitude: lightLat,
      longitude: lightLng,
      priorityScore: 78, // High school priority
      agentLogs: lightLogs,
      predictions: lightPreset.predictions as PredictionNode[],
      plan: lightPreset.plan as RepairPlan,
      status: 'investigated',
      imageBefore: lightPreset.imageBefore!,
      verificationCount: 3,
      trustScore: 94,
      createdAt: timestamp
    }
  ];
};

function App() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [issues, setIssues] = useState<AnalysisResult[]>(() => createInitialIssues(DEFAULT_LAT, DEFAULT_LNG));
  const [activeTab, setActiveTab] = useState<string>('digital-twin');
  const [selectedIssueId, setSelectedIssueId] = useState<string>('issue-1');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userRole, setUserRole] = useState<string>('official');
  const [apiKey, setApiKey] = useState<string>(() => {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('civicmind_gemini_api_key') || '';
  });
  const [showKeyDrawer, setShowKeyDrawer] = useState(false);
  
  const [userPoints, setUserPoints] = useState(() => {
    const saved = localStorage.getItem('civicmind_user_points');
    return saved ? JSON.parse(saved) : { trust: 0, verification: 0, rank: 1 };
  });

  const [profileName, setProfileName] = useState<string>(() => {
    return localStorage.getItem('civicmind_username') || '';
  });
  const [showProfileSetup, setShowProfileSetup] = useState(!localStorage.getItem('civicmind_username'));
  const [tempName, setTempName] = useState('');

  // Geolocation trigger on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setIssues(createInitialIssues(lat, lng));
        },
        (error) => {
          console.warn("Geolocation failed or denied, using defaults:", error);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    }
  }, []);

  const activeIssue = issues.find(i => i.id === selectedIssueId);

  // New report handler
  const handleAnalysisStarted = () => {
    setIsAnalyzing(true);
    setActiveTab('command-center'); // Instantly redirect to command center to show multi-agent flow
  };

  const handleAnalysisComplete = (newIssue: AnalysisResult) => {
    setIssues(prev => [newIssue, ...prev]);
    setSelectedIssueId(newIssue.id);
    setIsAnalyzing(false);
  };

  // Resolution verification handler
  const handleIssueResolved = (issueId: string, imageAfter: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          status: 'resolved',
          imageAfter
        };
      }
      return issue;
    }));
    
    // Reward points for verification review
    setUserPoints((prev: any) => {
      const next = {
        ...prev,
        trust: prev.trust + 50,
        rank: Math.floor((prev.trust + 50) / 100) + 1
      };
      localStorage.setItem('civicmind_user_points', JSON.stringify(next));
      return next;
    });
  };

  // Peer consensus verify vote handler
  const handleVerifyIssue = (issueId: string) => {
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return {
          ...issue,
          verificationCount: Math.min(4, issue.verificationCount + 1)
        };
      }
      return issue;
    }));

    setUserPoints((prev: any) => {
      const next = {
        ...prev,
        trust: prev.trust + 15,
        verification: prev.verification + 1,
        rank: Math.floor((prev.trust + 15) / 100) + 1
      };
      localStorage.setItem('civicmind_user_points', JSON.stringify(next));
      return next;
    });
  };

  const getUnresolvedCount = () => {
    return issues.filter(i => i.status !== 'resolved').length;
  };

  // Sidebar link filtering based on Roles
  const renderSidebarLinks = () => {
    const links = [
      { id: 'digital-twin', label: 'Digital Twin Map', icon: <Layers size={18} />, roles: ['citizen', 'official', 'volunteer', 'admin'] },
      { id: 'detection', label: 'Report Issue', icon: <Upload size={18} />, roles: ['citizen', 'volunteer'] },
      { id: 'command-center', label: 'Agent Command Center', icon: <Cpu size={18} />, roles: ['official', 'admin'] },
      { id: 'authority', label: 'Resolution Planning', icon: <Clipboard size={18} />, roles: ['official', 'admin'] },
      { id: 'analytics', label: 'Civic Analytics', icon: <BarChart2 size={18} />, roles: ['official', 'admin'] },
      { id: 'gamification', label: 'Community Hero', icon: <Award size={18} />, roles: ['citizen', 'volunteer'] }
    ];

    return links
      .filter(l => l.roles.includes(userRole))
      .map(l => (
        <li
          key={l.id}
          onClick={() => setActiveTab(l.id)}
          className={`sidebar-item ${activeTab === l.id ? 'active' : ''}`}
        >
          {l.icon}
          {l.label}
        </li>
      ));
  };

  return (
    <div className="app-container">
      
      {/* Navigation Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="sidebar-logo-text">CivicMind AI</h1>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              Urban OS Client
            </span>
          </div>
        </div>

        {/* Role Selector */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">System Access Clearance</label>
          <select
            className="form-select"
            value={userRole}
            onChange={(e) => {
              const role = e.target.value;
              setUserRole(role);
              // Set default fallback tabs for specific roles
              if (role === 'citizen') setActiveTab('digital-twin');
              if (role === 'official') setActiveTab('digital-twin');
              if (role === 'volunteer') setActiveTab('gamification');
              if (role === 'admin') setActiveTab('command-center');
            }}
            style={{ width: '100%', fontSize: '0.8rem', padding: '10px' }}
          >
            <option value="citizen">👤 Citizen (Hyperlocal reporting)</option>
            <option value="volunteer">🙋 Volunteer (Local consensus)</option>
            <option value="official">🏢 Govt Official (Command & Control)</option>
            <option value="admin">⚙️ Admin (Agent Orchestration)</option>
          </select>
        </div>

        <ul className="sidebar-menu">
          {renderSidebarLinks()}
        </ul>

        {/* Profile Card Footer */}
        <div className="sidebar-profile">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
              🎖️
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'white', display: 'block' }}>{profileName || 'Hero'}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>XP: {userPoints.trust} pts</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="main-viewport">
        
        {/* Dynamic header and dashboard control */}
        <header className="dashboard-header">
          <div className="dashboard-title-area">
            <h1>
              {activeTab === 'digital-twin' && 'Autonomous Digital Twin'}
              {activeTab === 'detection' && 'Smart Detection Portal'}
              {activeTab === 'command-center' && 'Multi-Agent Command Center'}
              {activeTab === 'authority' && 'Autonomous Resolution Planner'}
              {activeTab === 'analytics' && 'Civic Intelligence Dashboard'}
              {activeTab === 'gamification' && 'Community Heroes'}
            </h1>
            <p>
              {activeTab === 'digital-twin' && 'Living city vector mesh tracking infrastructure health ratings.'}
              {activeTab === 'detection' && 'Upload community issues directly to the AI-powered municipal agents.'}
              {activeTab === 'command-center' && 'Visual inspection of agent interactions and computational thoughts.'}
              {activeTab === 'authority' && 'Review AI-generated work estimates, material sheets, and verify repairs.'}
              {activeTab === 'analytics' && 'Aggregate city performance index, predicted failures, and spent budgets.'}
              {activeTab === 'gamification' && 'Consensus-based neighborhood verification missions for local heroes.'}
            </p>
          </div>

          <div className="dashboard-meta">
            {/* API key widget drawer activator */}
            <button
              onClick={() => setShowKeyDrawer(!showKeyDrawer)}
              className="btn"
              style={{
                fontSize: '0.75rem',
                padding: '8px 12px',
                borderColor: apiKey ? 'var(--color-healthy)' : 'var(--border-subtle)',
                color: apiKey ? 'var(--color-healthy)' : 'var(--color-text-muted)'
              }}
            >
              <Key size={14} />
              {apiKey ? 'Gemini Live Active' : 'Configure Gemini Key'}
            </button>

            {/* Unresolved count badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: '10px' }}>
              <Bell size={14} style={{ color: 'var(--color-warning)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{getUnresolvedCount()} active cases</span>
            </div>
          </div>
        </header>

        {/* Gemini API Key configuration drawer slider overlay */}
        {showKeyDrawer && (
          <div className="glass-panel animate-slide-up" style={{ background: 'rgba(10, 15, 30, 0.95)', border: '1px solid var(--color-primary)', padding: '16px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'white', marginBottom: '8px' }}>Integrate Custom Gemini AI Key</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              Entering a Gemini developer API Key allows the Smart Detection Portal to query real vision models on uploaded images instead of simulating output. Keys are stored safely in local memory.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="password"
                className="form-input"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => {
                  const val = e.target.value;
                  setApiKey(val);
                  localStorage.setItem('civicmind_gemini_api_key', val);
                }}
                style={{ flexGrow: 1, fontSize: '0.8rem' }}
              />
              <button onClick={() => setShowKeyDrawer(false)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                Save & Close
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Tab Renderer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flexGrow: 1 }}>
          {activeTab === 'digital-twin' && (
            <DigitalTwinMap
              issues={issues}
              onSelectIssue={(issue) => {
                setSelectedIssueId(issue.id);
                // Based on role, redirect to appropriate detailed portal
                if (userRole === 'official' || userRole === 'admin') {
                  setActiveTab('authority');
                } else if (userRole === 'volunteer') {
                  setActiveTab('gamification');
                }
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
              issues={issues}
              onSelectIssue={(issue) => setSelectedIssueId(issue.id)}
              selectedIssue={activeIssue}
              onIssueResolved={handleIssueResolved}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPanel
              issues={issues}
            />
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

      </main>

      {showProfileSetup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(3, 5, 12, 0.9)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '24px'
        }}>
          <div className="glass-panel animate-slide-up" style={{ maxWidth: '420px', width: '100%', border: '1px solid var(--color-primary)', display: 'flex', flexDirection: 'column', gap: '20px', padding: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-agent))',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '1.8rem',
                color: 'white',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
              }}>
                🎖️
              </div>
              <h2 style={{ fontSize: '1.5rem', color: 'white', fontFamily: 'var(--font-heading)' }}>Initialize Hero Persona</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                Welcome to CivicMind AI. To register your local validation contributions, create your Community Hero identity.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Profile / Call Sign Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your name..."
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={20}
                required
              />
            </div>

            <button
              onClick={() => {
                if (tempName.trim()) {
                  const cleaned = tempName.trim();
                  localStorage.setItem('civicmind_username', cleaned);
                  setProfileName(cleaned);
                  setShowProfileSetup(false);
                }
              }}
              className="btn btn-primary"
              style={{ padding: '12px', justifyContent: 'center' }}
            >
              Sync Persona & Enter Urban OS
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
