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

  const sortedIssues = [...issues].sort((a, b) => b.priorityScore - a.priorityScore);

  const handleStartVerification = () => {
    setVerifying(true);
    setVerifyProgress([]);

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
          let mockAfter = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400';
          if (selectedIssue?.category === 'Water & Utilities') {
            mockAfter = 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?q=80&w=400';
          } else if (selectedIssue?.category === 'Electrical & Lighting') {
            mockAfter = 'https://images.unsplash.com/photo-1513829092301-c7588665377f?q=80&w=400';
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
    <div className="glass-panel col-12" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', minHeight: '520px' }}>
      
      {/* Left: Work Queue */}
      <div style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clipboard size={17} style={{ color: 'var(--color-primary)' }} />
            Municipal Work Queue
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            AI-prioritized by composite risk scores.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '480px' }}>
          {sortedIssues.map(issue => {
            const isSelected = selectedIssue?.id === issue.id;
            const isResolved = issue.status === 'resolved';
            
            return (
              <div
                key={issue.id}
                onClick={() => onSelectIssue(issue)}
                style={{
                  padding: '12px',
                  background: isSelected ? 'rgba(37, 99, 235, 0.04)' : 'var(--bg-deep)',
                  border: `1px solid ${isSelected ? 'rgba(37, 99, 235, 0.15)' : 'var(--border-subtle)'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '240px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {issue.title}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                    {issue.category} • [{issue.latitude.toFixed(3)}, {issue.longitude.toFixed(3)}]
                  </span>
                  {isResolved ? (
                    <span className="badge badge-healthy" style={{ fontSize: '0.58rem', width: 'fit-content', padding: '2px 6px', marginTop: '2px' }}>
                      RESOLVED
                    </span>
                  ) : (
                    <span className="badge badge-info" style={{ fontSize: '0.58rem', width: 'fit-content', padding: '2px 6px', marginTop: '2px' }}>
                      IN QUEUE
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <div style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: getPriorityColor(issue.priorityScore),
                    background: `${getPriorityColor(issue.priorityScore)}08`,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${getPriorityColor(issue.priorityScore)}15`
                  }}>
                    P: {issue.priorityScore}
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-text-dark)' }}>
                    {issue.confidence}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Planning Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {selectedIssue ? (
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span className={`badge ${selectedIssue.status === 'resolved' ? 'badge-healthy' : 'badge-critical'}`}>
                  {selectedIssue.status.toUpperCase()}
                </span>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--color-text-main)', marginTop: '6px' }}>{selectedIssue.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                  Target: <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>{selectedIssue.infrastructure}</span>
                </p>
              </div>

              <div style={{ 
                background: 'var(--bg-deep)', 
                padding: '10px 14px', 
                borderRadius: '10px', 
                border: '1px solid var(--border-subtle)',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>
                  Priority Weight
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: getPriorityColor(selectedIssue.priorityScore) }}>
                  {selectedIssue.priorityScore} / 100
                </span>
              </div>
            </div>

            {/* Assessment & Predictions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="glass-panel" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '0.88rem', color: 'var(--color-text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={15} style={{ color: 'var(--color-primary)' }} />
                  Assessment Summary
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  {selectedIssue.description}
                </p>
                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-main)', display: 'block', marginBottom: '6px' }}>
                    Safety Threats:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {selectedIssue.hazards.map((h, i) => (
                      <span key={i} style={{ 
                        fontSize: '0.65rem', 
                        padding: '3px 7px', 
                        background: 'rgba(220, 38, 38, 0.04)', 
                        border: '1px solid rgba(220, 38, 38, 0.1)', 
                        color: 'var(--color-critical)', 
                        borderRadius: '4px' 
                      }}>
                        ⚠️ {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '0.88rem', color: 'var(--color-text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={15} style={{ color: 'var(--color-agent)' }} />
                  Decay Chain
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {selectedIssue.predictions.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.72rem' }}>
                      <span style={{ color: 'var(--color-agent)', fontWeight: 600, minWidth: '60px' }}>{p.timeframe}</span>
                      <CornerDownRight size={12} style={{ color: 'var(--color-text-dark)', marginTop: '1px', flexShrink: 0 }} />
                      <div style={{ flexGrow: 1 }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>{p.consequence}</span>
                        <div style={{ height: '3px', background: 'rgba(0,0,0,0.05)', borderRadius: '1.5px', marginTop: '3px', width: '100%' }}>
                          <div style={{ height: '100%', background: 'var(--color-agent)', width: `${p.impactScore}%`, borderRadius: '1.5px' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Work Order */}
            <div className="glass-panel" style={{ border: '1px solid rgba(5, 150, 105, 0.12)', background: 'rgba(5, 150, 105, 0.02)', padding: '16px' }}>
              <h4 style={{ fontSize: '0.92rem', color: 'var(--color-text-main)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Hammer size={16} style={{ color: 'var(--color-healthy)' }} />
                Autonomous Work Order
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                {[
                  { label: 'Department', value: selectedIssue.plan.department.split('—')[0].replace('Department of', 'Dept') },
                  { label: 'Crew', value: `${selectedIssue.plan.teamSize} Techs` },
                  { label: 'Window', value: selectedIssue.plan.timeframe },
                  { label: 'Weather', value: weatherData ? `${weatherData.temp}°C (${weatherData.desc})` : 'Loading...', color: weatherData ? (weatherData.isRaining ? 'var(--color-critical)' : 'var(--color-healthy)') : undefined },
                  { label: 'Budget', value: `$${selectedIssue.plan.estimatedCost}`, color: 'var(--color-healthy)' }
                ].map((item) => (
                  <div key={item.label}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{item.label}</span>
                    <span style={{ fontSize: '0.78rem', color: item.color || 'var(--color-text-main)', fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '18px' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-main)', display: 'block', marginBottom: '6px' }}>
                    Materials
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {selectedIssue.plan.materials.map((m, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', padding: '4px 8px', background: 'var(--bg-deep)', borderRadius: '6px' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>{m.name}</span>
                        <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>{m.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-main)', display: 'block', marginBottom: '6px' }}>
                    Execution Steps
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '120px', overflowY: 'auto' }}>
                    {selectedIssue.plan.steps.map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--color-healthy)', fontWeight: 600, flexShrink: 0 }}>{s.step}.</span>
                        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                          {s.action} <span style={{ color: 'var(--color-text-dark)' }}>({s.duration})</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Verification */}
            <div className="glass-panel" style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '0.88rem', color: 'var(--color-text-main)', marginBottom: '12px' }}>
                Resolution Verification
              </h4>

              {selectedIssue.status === 'resolved' ? (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Before</span>
                      <img src={selectedIssue.imageBefore} alt="Before" style={{ width: '110px', height: '75px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-subtle)' }} />
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--color-healthy)', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--color-healthy)', display: 'block', marginBottom: '4px' }}>Resolved</span>
                      <img src={selectedIssue.imageAfter} alt="After" style={{ width: '110px', height: '75px', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid var(--color-healthy)' }} />
                    </div>
                  </div>

                  <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-healthy)', fontWeight: 600, fontSize: '0.88rem' }}>
                      <CheckCircle2 size={16} />
                      Repaired & Closed
                    </div>
                    <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      Vision match: <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>98.2%</span>. 
                      Verified by <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>4/4</span> citizens.
                    </p>
                  </div>
                </div>
              ) : verifying ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={14} style={{ animation: 'spin 2s linear infinite', color: 'var(--color-primary)' }} />
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-main)', fontWeight: 500 }}>Analyzing Before vs After...</span>
                  </div>
                  <div className="terminal-console" style={{ padding: '10px 14px', gap: '4px' }}>
                    {verifyProgress.map((prog, idx) => (
                      <div key={idx} style={{ color: idx === verifyProgress.length - 1 ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: '0.72rem' }}>
                        &gt; {prog}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', maxWidth: '400px' }}>
                    Upload the resolution photograph to run AI before/after comparison and crowd consensus verification.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartVerification}
                    className="btn btn-success"
                    style={{ padding: '10px 18px', fontSize: '0.82rem' }}
                  >
                    🛠️ Trigger AI Review
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: 'var(--color-text-dark)', gap: '8px' }}>
            <Eye size={32} />
            <span style={{ fontSize: '0.88rem' }}>Select an issue from the queue to review.</span>
          </div>
        )}
      </div>

    </div>
  );
};
