import React, { useState } from 'react';
import type { AnalysisResult } from '../services/geminiService';
import { Shield, Hammer, Clipboard, CheckCircle2, TrendingUp, Eye, ArrowRight, CornerDownRight, RefreshCw } from 'lucide-react';

interface AuthorityPortalProps {
  issues: AnalysisResult[];
  onSelectIssue: (issue: AnalysisResult) => void;
  selectedIssue?: AnalysisResult;
  onIssueResolved: (issueId: string, imageAfter: string) => void;
}

export const AuthorityPortal: React.FC<AuthorityPortalProps> = ({
  issues,
  onSelectIssue,
  selectedIssue,
  onIssueResolved
}) => {
  const [verifying, setVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<{ temp: number; desc: string; isRaining: boolean } | null>(null);

  // Fetch live weather data from Open-Meteo
  React.useEffect(() => {
    if (!selectedIssue) return;
    setWeatherData(null);
    
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${selectedIssue.latitude}&longitude=${selectedIssue.longitude}&current_weather=true`)
      .then(res => res.json())
      .then(data => {
        const cw = data.current_weather;
        if (cw) {
          const temp = cw.temperature;
          const code = cw.weathercode;
          let desc = "Clear Sky";
          let isRaining = false;
          if (code >= 1 && code <= 3) desc = "Cloudy";
          else if (code >= 45 && code <= 48) desc = "Foggy";
          else if (code >= 51 && code <= 67) { desc = "Rain"; isRaining = true; }
          else if (code >= 71 && code <= 86) { desc = "Snow"; isRaining = true; }
          else if (code >= 95) { desc = "Storm"; isRaining = true; }
          
          setWeatherData({ temp, desc, isRaining });
        }
      })
      .catch(() => {
        setWeatherData({ temp: 24, desc: "Clear Sky", isRaining: false });
      });
  }, [selectedIssue]);

  // Sorted issues by priority score descending
  const sortedIssues = [...issues].sort((a, b) => b.priorityScore - a.priorityScore);


  const handleStartVerification = () => {
    setVerifying(true);
    setVerifyProgress([]);

    // Simulate Step-by-Step Vision Verification process
    const steps = [
      "Vision Agent: Ingesting 'After' repair image...",
      "Vision Agent: Executing pixel grid alignment (Before vs After)...",
      "Vision Agent: Detecting texture change - Asphalt hole filled (Confidence 98%)",
      "Consensus Agent: Validating community peer signatures...",
      "Consensus Agent: Verified by 4 local citizen heroes inside 150m radius",
      "Authority Agent: All criteria met. Closing ticket and assigning trust points."
    ];

    steps.forEach((stepText, index) => {
      setTimeout(() => {
        setVerifyProgress(prev => [...prev, stepText]);
        if (index === steps.length - 1) {
          // Set standard mock "after" image
          let mockAfter = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400'; // repaired road
          if (selectedIssue?.category === 'Water & Utilities') {
            mockAfter = 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?q=80&w=400'; // dry street / clean
          } else if (selectedIssue?.category === 'Electrical & Lighting') {
            mockAfter = 'https://images.unsplash.com/photo-1513829092301-c7588665377f?q=80&w=400'; // bright light
          }
          
          setTimeout(() => {
            if (selectedIssue) {
              onIssueResolved(selectedIssue.id, mockAfter);
              setVerifying(false);
            }
          }, 1000);
        }
      }, (index + 1) * 1200);
    });
  };

  const getPriorityColor = (score: number) => {
    if (score >= 80) return 'var(--color-critical)';
    if (score >= 60) return 'var(--color-warning)';
    return 'var(--color-healthy)';
  };

  return (
    <div className="glass-panel col-12" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', minHeight: '520px' }}>
      
      {/* Left panel: Municipal Work Queue */}
      <div style={{ borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clipboard size={18} style={{ color: 'var(--color-primary)' }} />
            Municipal Work Queue
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Issues prioritized dynamically by AI agent composite risk scores.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '480px' }}>
          {sortedIssues.map(issue => {
            const isSelected = selectedIssue?.id === issue.id;
            const isResolved = issue.status === 'resolved';
            
            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                style={{
                  padding: '12px',
                  background: isSelected ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.04)'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '240px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {issue.title}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {issue.category} • GPS [{issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}]
                  </span>
                  {isResolved ? (
                    <span className="badge badge-healthy" style={{ fontSize: '0.6rem', width: 'fit-content', padding: '2px 6px', marginTop: '2px' }}>
                      RESOLVED
                    </span>
                  ) : (
                    <span className="badge badge-info" style={{ fontSize: '0.6rem', width: 'fit-content', padding: '2px 6px', marginTop: '2px' }}>
                      IN QUEUE
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: getPriorityColor(issue.priorityScore),
                    background: 'rgba(0,0,0,0.3)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${getPriorityColor(issue.priorityScore)}40`
                  }}>
                    P: {issue.priorityScore}
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-text-dark)' }}>
                    Conf: {issue.confidence}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel: Planning & Verification Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {selectedIssue ? (
          <>
            {/* Ticket Header & AI summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className={`badge ${selectedIssue.status === 'resolved' ? 'badge-healthy' : 'badge-critical'}`}>
                  {selectedIssue.status.toUpperCase()}
                </span>
                <h3 style={{ fontSize: '1.4rem', color: 'white', marginTop: '6px' }}>{selectedIssue.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Target Infrastructure: <span style={{ color: 'white', fontWeight: 600 }}>{selectedIssue.infrastructure}</span>
                </p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  AI Assessed Priority Weight
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: getPriorityColor(selectedIssue.priorityScore) }}>
                  {selectedIssue.priorityScore} / 100
                </span>
              </div>
            </div>

            {/* Sub-grid: Description and Risk Consequences */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.01)', padding: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} style={{ color: 'var(--color-primary)' }} />
                  Smart Assessment Summary
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  {selectedIssue.description}
                </p>
                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white', display: 'block', marginBottom: '6px' }}>
                    Identified Safety Threats:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedIssue.hazards.map((h, i) => (
                      <span key={i} style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: 'var(--color-critical)', borderRadius: '4px' }}>
                        ⚠️ {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Module 2: Prediction decay */}
              <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.01)', padding: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={16} style={{ color: 'var(--color-agent)' }} />
                  Predictive Structural Decline Chain
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedIssue.predictions.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--color-agent)', fontWeight: 'bold' }}>{p.timeframe}</span>
                      <CornerDownRight size={14} style={{ color: 'var(--color-text-dark)' }} />
                      <div style={{ flexGrow: 1 }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>{p.consequence}</span>
                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '1.5px', marginTop: '3px', width: '100%' }}>
                          <div style={{ height: '100%', background: 'var(--color-agent)', width: `${p.impactScore}%`, borderRadius: '1.5px' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Module 3: Autonomous Repair Work Order */}
            <div className="glass-panel" style={{ border: '1px solid rgba(16, 185, 129, 0.15)', background: 'rgba(16, 185, 129, 0.02)', padding: '16px' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'white', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Hammer size={18} style={{ color: 'var(--color-healthy)' }} />
                AI Autonomous Work Order Plan
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Rerouted Dept</span>
                  <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: 600 }}>{selectedIssue.plan.department.split('—')[0].replace('Department of', 'Dept')}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Labor Crew</span>
                  <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: 600 }}>{selectedIssue.plan.teamSize} Techs</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Work Window</span>
                  <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: 600 }}>{selectedIssue.plan.timeframe}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Live Weather</span>
                  <span style={{ fontSize: '0.8rem', color: weatherData ? (weatherData.isRaining ? 'var(--color-critical)' : 'var(--color-healthy)') : 'white', fontWeight: 600 }}>
                    {weatherData ? `${weatherData.temp}°C (${weatherData.desc})` : 'Syncing...'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>AI Budget</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-healthy)', fontWeight: 700 }}>${selectedIssue.plan.estimatedCost}</span>
                </div>
              </div>

              {/* Material Allocation details */}
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white', display: 'block', marginBottom: '6px' }}>
                    Material Quantities Assigned:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedIssue.plan.materials.map((m, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>{m.name}</span>
                        <span style={{ color: 'white', fontWeight: 600 }}>{m.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white', display: 'block', marginBottom: '6px' }}>
                    Workflow Execution Steps:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                    {selectedIssue.plan.steps.map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--color-healthy)', fontWeight: 600 }}>{s.step}.</span>
                        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                          {s.action} <span style={{ color: 'var(--color-text-dark)' }}>({s.duration})</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Module 4: Live Verification comparison upload panel */}
            <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.01)', padding: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'white', marginBottom: '12px' }}>
                Resolution Verification Control
              </h4>

              {selectedIssue.status === 'resolved' ? (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  {/* Show before and after photos side by side */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Before</span>
                      <img src={selectedIssue.imageBefore} alt="Before repair" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowRight size={18} style={{ color: 'var(--color-healthy)' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--color-healthy)', display: 'block', marginBottom: '4px' }}>Resolved</span>
                      <img src={selectedIssue.imageAfter} alt="After repair" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid var(--color-healthy)' }} />
                    </div>
                  </div>

                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-healthy)', fontWeight: 600, fontSize: '0.9rem' }}>
                      <CheckCircle2 size={18} />
                      Repaired & Closed
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Vision Agent comparison matches: <span style={{ color: 'white', fontWeight: 600 }}>98.2%</span>. 
                      Verified by <span style={{ color: 'white', fontWeight: 600 }}>4/4</span> local citizens consensus.
                    </p>
                  </div>
                </div>
              ) : verifying ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={16} className="animate-pulse-glow" style={{ animation: 'spin 2s linear infinite', color: 'var(--color-primary)' }} />
                    <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>Analyzing Before vs After with Gemini Vision...</span>
                  </div>
                  <div style={{
                    background: 'rgba(0,0,0,0.4)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    {verifyProgress.map((prog, idx) => (
                      <div key={idx} style={{ color: idx === verifyProgress.length - 1 ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                        &gt; {prog}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: '400px' }}>
                    Repairs completed? Upload the resolution photograph to run before/after AI comparisons and collect crowd consensus verification.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartVerification}
                    className="btn btn-success"
                    style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                  >
                    🛠️ Trigger AI Resolution Review
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: 'var(--color-text-dark)', gap: '8px' }}>
            <Eye size={36} />
            <span>Select an issue from the queue to review municipal plans.</span>
          </div>
        )}
      </div>

    </div>
  );
};
