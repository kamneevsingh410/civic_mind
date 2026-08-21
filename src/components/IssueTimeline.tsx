import type { AnalysisResult } from '../services/geminiService';
import { Eye, Search, Hammer, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

interface IssueTimelineProps {
  issue: AnalysisResult;
}

const STAGES = [
  { key: 'detected', label: 'Detected', icon: <Eye size={14} />, description: 'AI vision agent ingested report' },
  { key: 'investigated', label: 'Investigated', icon: <Search size={14} />, description: 'Multi-agent analysis complete' },
  { key: 'planning', label: 'Planning', icon: <Hammer size={14} />, description: 'Work order generated' },
  { key: 'resolved', label: 'Resolved', icon: <CheckCircle2 size={14} />, description: 'Verified by community consensus' }
];

const STATUS_ORDER = ['detected', 'investigated', 'planning', 'resolved'];

export const IssueTimeline = ({ issue }: IssueTimelineProps) => {
  const currentIdx = STATUS_ORDER.indexOf(issue.status);

  const getStageTime = (stageIdx: number) => {
    const created = new Date(issue.createdAt);
    const offsets = [0, 2, 8, 20];
    const time = new Date(created.getTime() + offsets[stageIdx] * 60000);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="glass-panel" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Clock size={15} style={{ color: 'var(--color-primary)' }} />
        <h4 style={{ fontSize: '0.88rem', color: 'var(--color-text-main)', margin: 0 }}>Issue Lifecycle</h4>
        <span className="badge badge-info" style={{ fontSize: '0.58rem', marginLeft: 'auto' }}>
          {issue.status.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0' }}>
        {STAGES.map((stage, idx) => {
          const isComplete = idx <= currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                flex: 1,
                position: 'relative'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isCurrent
                    ? 'var(--color-primary)'
                    : isComplete
                    ? 'rgba(5, 150, 105, 0.1)'
                    : 'rgba(0, 0, 0, 0.04)',
                  border: `2px solid ${isCurrent ? 'var(--color-primary)' : isComplete ? 'var(--color-healthy)' : 'rgba(0,0,0,0.08)'}`,
                  color: isCurrent ? 'white' : isComplete ? 'var(--color-healthy)' : 'var(--color-text-dark)',
                  transition: 'all 0.3s ease'
                }}>
                  {stage.icon}
                </div>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: isCurrent ? 600 : 400,
                  color: isCurrent ? 'var(--color-text-main)' : isComplete ? 'var(--color-text-muted)' : 'var(--color-text-dark)',
                  textAlign: 'center'
                }}>
                  {stage.label}
                </span>
                <span style={{ fontSize: '0.58rem', color: 'var(--color-text-dark)' }}>
                  {getStageTime(idx)}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingTop: '14px',
                  flexShrink: 0
                }}>
                  <div style={{
                    width: '40px',
                    height: '2px',
                    background: idx < currentIdx ? 'var(--color-healthy)' : 'rgba(0,0,0,0.08)',
                    transition: 'background 0.3s ease'
                  }} />
                  <ArrowRight size={10} style={{
                    color: idx < currentIdx ? 'var(--color-healthy)' : 'var(--color-text-dark)',
                    marginLeft: '-2px',
                    marginTop: '-14px'
                  }} />
                </div>
              )}
            </>
          );
        })}
      </div>
    </div>
  );
};
