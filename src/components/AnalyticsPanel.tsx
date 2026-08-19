import React from 'react';
import type { AnalysisResult } from '../services/geminiService';
import { TrendingUp, BarChart2, DollarSign, Zap, UserCheck } from 'lucide-react';

interface AnalyticsPanelProps {
  issues: AnalysisResult[];
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ issues }) => {
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100;
  
  const totalSpent = issues
    .filter(i => i.status === 'resolved')
    .reduce((sum, current) => sum + current.plan.estimatedCost, 0);

  const pendingBudget = issues
    .filter(i => i.status !== 'resolved')
    .reduce((sum, current) => sum + current.plan.estimatedCost, 0);

  const departmentEfficiency = [
    { name: "Public Power & Lighting", resolved: 14, time: "1.8 hrs", rate: 94 },
    { name: "Road Maintenance Dept", resolved: 28, time: "5.4 hrs", rate: 82 },
    { name: "Hydrology & Water Pipes", resolved: 9, time: "6.8 hrs", rate: 78 },
    { name: "Sanitation & Environment", resolved: 33, time: "2.1 hrs", rate: 96 }
  ];

  const futureNeeds = [
    { title: "Grid 4 Sewer Upgrade", reason: "Repeated blockage predictions", cost: "$45k", risk: "Medium" },
    { title: "Oakridge Road Repaving", reason: "Rapid sub-base water cracking", cost: "$120k", risk: "Critical" },
    { title: "Substation 9 Relay Swap", reason: "Sensor overheating triggers", cost: "$18k", risk: "High" }
  ];

  const scorecards = [
    { icon: <BarChart2 size={20} />, color: 'var(--color-primary)', bg: 'rgba(37, 99, 235, 0.06)', label: 'Resolution Rate', value: `${resolutionRate}%`, sub: '+4% vs last week', subColor: 'var(--color-healthy)' },
    { icon: <DollarSign size={20} />, color: 'var(--color-healthy)', bg: 'rgba(5, 150, 105, 0.06)', label: 'Resolved Capital', value: `$${totalSpent}`, sub: 'From city fund', subColor: 'var(--color-text-dark)' },
    { icon: <Zap size={20} />, color: 'var(--color-warning)', bg: 'rgba(217, 119, 6, 0.06)', label: 'Pending Capital', value: `$${pendingBudget}`, sub: `${totalIssues - resolvedIssues} outstanding`, subColor: 'var(--color-text-muted)' },
    { icon: <UserCheck size={20} />, color: 'var(--color-agent)', bg: 'rgba(124, 58, 237, 0.06)', label: 'Consensus Rate', value: '96.4%', sub: 'High trust score', subColor: 'var(--color-healthy)' }
  ];

  return (
    <div className="dashboard-grid">
      
      {/* Scorecards */}
      {scorecards.map((sc, idx) => (
        <div key={idx} className="glass-panel col-3" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: sc.bg, padding: '10px', borderRadius: '10px', color: sc.color, flexShrink: 0 }}>
            {sc.icon}
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>{sc.label}</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{sc.value}</span>
            <span style={{ fontSize: '0.62rem', color: sc.subColor, display: 'block', fontWeight: 500 }}>
              ↑ {sc.sub}
            </span>
          </div>
        </div>
      ))}

      {/* Department Table */}
      <div className="glass-panel col-8" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-main)' }}>Department Efficiency</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Resolved</th>
                <th>Avg Time</th>
                <th>Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {departmentEfficiency.map((dept, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{dept.name}</td>
                  <td>{dept.resolved}</td>
                  <td>{dept.time}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '36px', fontWeight: 600, fontSize: '0.85rem' }}>{dept.rate}%</span>
                      <div style={{ flexGrow: 1, height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', width: '80px' }}>
                        <div className="health-bar-fill" style={{
                          height: '100%',
                          background: dept.rate >= 90 ? 'var(--color-healthy)' : 'var(--color-warning)',
                          width: `${dept.rate}%`,
                          borderRadius: '2px'
                        }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Predictive Budget Alerts */}
      <div className="glass-panel col-4" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp size={16} style={{ color: 'var(--color-agent)' }} />
          Predictive Budget Foresight
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
          AI alerts forecasting critical infrastructure breakdowns.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {futureNeeds.map((need, idx) => (
            <div
              key={idx}
              style={{
                padding: '12px',
                background: 'var(--bg-deep)',
                border: `1px solid ${need.risk === 'Critical' ? 'rgba(220, 38, 38, 0.12)' : 'var(--border-subtle)'}`,
                borderRadius: '10px',
                fontSize: '0.78rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{need.title}</span>
                <span className={`badge ${need.risk === 'Critical' ? 'badge-critical' : 'badge-warning'}`} style={{ fontSize: '0.6rem' }}>
                  {need.risk}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                {need.reason}
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem' }}>
                <span style={{ color: 'var(--color-text-dark)' }}>Projected cost</span>
                <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>{need.cost}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
