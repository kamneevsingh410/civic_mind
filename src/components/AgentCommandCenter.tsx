import React, { useEffect, useState } from 'react';
import type { AgentLog } from '../services/geminiService';
import { Terminal, Cpu, RefreshCw } from 'lucide-react';

interface AgentCommandCenterProps {
  logs: AgentLog[];
  isAnalyzing: boolean;
}

interface AgentNode {
  name: string;
  role: string;
  avatar: string;
  x: number;
  y: number;
}

const AGENT_NODES: AgentNode[] = [
  { name: "Vision Agent", role: "Image understanding", avatar: "👁️", x: 200, y: 60 },
  { name: "Geo Agent", role: "Geospatial indexing", avatar: "🌍", x: 340, y: 120 },
  { name: "Duplicate Agent", role: "Cluster overlapping", avatar: "🔍", x: 380, y: 240 },
  { name: "Priority Agent", role: "Risk logic weights", avatar: "⚡", x: 300, y: 360 },
  { name: "Prediction Agent", role: "Decay forecasting", avatar: "🔮", x: 120, y: 360 },
  { name: "Planning Agent", role: "Material & labor estimation", avatar: "🛠️", x: 40, y: 240 },
  { name: "Verification Agent", role: "Citizen consensus engine", avatar: "👥", x: 60, y: 120 },
  { name: "Authority Agent", role: "Escalation & routing", avatar: "🏢", x: 200, y: 210 }
];

export const AgentCommandCenter: React.FC<AgentCommandCenterProps> = ({
  logs,
  isAnalyzing
}) => {
  const [activeLogIndex, setActiveLogIndex] = useState<number>(-1);
  const [currentNode, setCurrentNode] = useState<string | null>(null);

  useEffect(() => {
    if (isAnalyzing) {
      setActiveLogIndex(-1);
      setCurrentNode("Vision Agent");
      
      const interval = setInterval(() => {
        setActiveLogIndex(prev => {
          const next = prev + 1;
          if (next >= logs.length) {
            clearInterval(interval);
            setCurrentNode(null);
            return logs.length - 1;
          }
          setCurrentNode(logs[next].agentName);
          return next;
        });
      }, 1500);

      return () => clearInterval(interval);
    } else {
      setActiveLogIndex(logs.length - 1);
      setCurrentNode(null);
    }
  }, [isAnalyzing, logs]);

  const visibleLogs = logs.slice(0, activeLogIndex + 1);

  return (
    <div className="glass-panel col-12" style={{ display: 'grid', gridTemplateColumns: '460px 1fr', gap: '20px', minHeight: '440px' }}>
      
      {/* Network Topology */}
      <div className="topology-panel" style={{ 
        position: 'relative',
        height: '420px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        padding: '16px' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 5 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={15} style={{ color: 'var(--color-agent)' }} />
            Orchestration Topology
          </span>
          {isAnalyzing && (
            <span style={{ fontSize: '0.68rem', color: 'var(--color-agent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={11} style={{ animation: 'spin 2s linear infinite' }} />
              Live
            </span>
          )}
        </div>

        {/* SVG Connectors */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {AGENT_NODES.map((node, i) => {
            const nextNode = AGENT_NODES[(i + 1) % AGENT_NODES.length];
            return (
              <line
                key={`line-${i}`}
                x1={node.x} y1={node.y} x2={nextNode.x} y2={nextNode.y}
                stroke={currentNode === node.name || currentNode === nextNode.name ? 'rgba(124, 58, 237, 0.3)' : 'rgba(0,0,0,0.05)'}
                strokeWidth={currentNode === node.name || currentNode === nextNode.name ? 2 : 1}
                strokeDasharray="4 4"
                style={{ transition: 'all 0.3s ease' }}
              />
            );
          })}
          {AGENT_NODES.map((node, i) => {
            if (node.name === "Authority Agent") return null;
            const authority = AGENT_NODES.find(n => n.name === "Authority Agent")!;
            return (
              <line
                key={`hub-${i}`}
                x1={node.x} y1={node.y} x2={authority.x} y2={authority.y}
                stroke={currentNode === node.name ? 'rgba(124, 58, 237, 0.3)' : 'rgba(0,0,0,0.03)'}
                strokeWidth={1.5}
                style={{ transition: 'all 0.3s ease' }}
              />
            );
          })}
        </svg>

        {/* Floating Nodes */}
        {AGENT_NODES.map(node => {
          const isActive = currentNode === node.name;
          const isTriggered = visibleLogs.some(l => l.agentName === node.name);
          
          return (
            <div
              key={node.name}
              style={{
                position: 'absolute',
                left: `${node.x}px`,
                top: `${node.y}px`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                zIndex: 10
              }}
            >
              <div
                className={isActive ? 'animate-pulse-glow' : ''}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: isActive 
                    ? 'rgba(124, 58, 237, 0.1)' 
                    : isTriggered 
                    ? 'rgba(37, 99, 235, 0.06)' 
                    : 'rgba(0,0,0,0.02)',
                  border: `1.5px solid ${isActive ? 'var(--color-agent)' : isTriggered ? 'rgba(37, 99, 235, 0.2)' : 'rgba(0,0,0,0.06)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.15rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                } as React.CSSProperties}
              >
                {node.avatar}
              </div>
              <span style={{
                fontSize: '0.62rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-text-main)' : isTriggered ? 'var(--color-text-muted)' : 'var(--color-text-dark)',
                textAlign: 'center',
                width: '80px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {node.name.split(' ')[0]}
              </span>
            </div>
          );
        })}

        <div style={{ zIndex: 5, fontSize: '0.62rem', color: 'var(--color-text-dark)', textAlign: 'center', width: '100%' }}>
          *Click nodes to inspect model configurations
        </div>
      </div>

      {/* Terminal Console */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '420px' }}>
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={16} style={{ color: 'var(--color-healthy)' }} />
            Agent Telemetry Logs
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            Real-time multi-agent cooperation trace.
          </p>
        </div>

        <div className="terminal-console" style={{ flexGrow: 1 }}>
          {visibleLogs.length > 0 ? (
            visibleLogs.map((log, index) => (
              <div 
                key={index} 
                className="animate-slide-up"
                style={{
                  borderLeft: `2.5px solid ${
                    log.status === 'critical' 
                      ? 'var(--color-critical)' 
                      : log.status === 'warning' 
                      ? 'var(--color-warning)' 
                      : log.status === 'success' 
                      ? 'var(--color-healthy)' 
                      : 'var(--color-agent)'
                  }`,
                  paddingLeft: '12px',
                  lineHeight: '1.4'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.78rem' }}>
                    {log.avatar} [{log.agentName}]
                  </span>
                  <span style={{ color: 'var(--color-text-dark)', fontSize: '0.68rem' }}>
                    {log.timestamp}
                  </span>
                </div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                  {log.message}
                </div>
                {log.details && (
                  <div style={{ 
                    marginTop: '4px', 
                    color: 'var(--color-text-dark)', 
                    background: 'rgba(0,0,0,0.015)', 
                    padding: '6px 8px', 
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    border: '1px solid rgba(0,0,0,0.03)'
                  }}>
                    {log.details}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--color-text-dark)',
              textAlign: 'center',
              gap: '8px'
            }}>
              <Terminal size={28} />
              <span style={{ fontSize: '0.82rem' }}>Awaiting detection input.<br />Submit a report to initialize agent trace.</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
