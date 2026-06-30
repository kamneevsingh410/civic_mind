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
  
  // Dynamic average budget calculations
  const totalSpent = issues
    .filter(i => i.status === 'resolved')
    .reduce((sum, current) => sum + current.plan.estimatedCost, 0);

  const pendingBudget = issues
    .filter(i => i.status !== 'resolved')
    .reduce((sum, current) => sum + current.plan.estimatedCost, 0);

  // High-fidelity Mock Analytics data
  const departmentEfficiency = [
    { name: "Public Power & Lighting", resolved: 14, time: "1.8 hours", rate: 94 },
    { name: "Road Maintenance Dept", resolved: 28, time: "5.4 hours", rate: 82 },
    { name: "Hydrology & Water Pipes", resolved: 9, time: "6.8 hours", rate: 78 },
    { name: "Sanitation & Environment", resolved: 33, time: "2.1 hours", rate: 96 }
  ];

  const futureNeeds = [
    { title: "Grid 4 Sewer Upgrade", reason: "Repeated blockage predictions", cost: "$45k", risk: "Medium" },
    { title: "Oakridge Road Repaving", reason: "Rapid sub-base water cracking", cost: "$120k", risk: "Critical" },
    { title: "Substation 9 Relay Swap", reason: "Sensor overheating triggers", cost: "$18k", risk: "High" }
  ];

  return (
    <div className="dashboard-grid">
      
      {/* Telemetry Header Scorecards */}
      <div className="glass-panel col-3" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--color-primary)' }}>
          <BarChart2 size={24} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Resolution Rate</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{resolutionRate}%</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--color-healthy)', display: 'block' }}>
            ↑ +4% vs last week
          </span>
        </div>
      </div>

      <div className="glass-panel col-3" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--color-healthy)' }}>
          <DollarSign size={24} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Resolved Capital</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>${totalSpent}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-dark)', display: 'block' }}>
            Allocated from city fund
          </span>
        </div>
      </div>

      <div className="glass-panel col-3" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--color-warning)' }}>
          <Zap size={24} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Pending Capital</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>${pendingBudget}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', display: 'block' }}>
            {totalIssues - resolvedIssues} issues outstanding
          </span>
        </div>
      </div>

      <div className="glass-panel col-3" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '12px', borderRadius: '12px', color: 'var(--color-agent)' }}>
          <UserCheck size={24} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Citizen Consensus</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>96.4%</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--color-healthy)', display: 'block' }}>
            High validation trust score
          </span>
        </div>
      </div>

      {/* Grid: Department Efficiencies vs AI Budget allocation */}
      <div className="glass-panel col-8" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'white' }}>Department Operational Efficiency</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>DEPARTMENT NAME</th>
                <th>TICKETS RESOLVED</th>
                <th>AVG RESOLUTION TIME</th>
                <th>SUCCESS RATE</th>
              </tr>
            </thead>
            <tbody>
              {departmentEfficiency.map((dept, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{dept.name}</td>
                  <td>{dept.resolved} units</td>
                  <td>{dept.time}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '40px', fontWeight: 'bold' }}>{dept.rate}%</span>
                      <div style={{ flexGrow: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', width: '80px' }}>
                        <div style={{
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

      {/* Right column: Predictive Budgeting planning alerts */}
      <div className="glass-panel col-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp size={18} style={{ color: 'var(--color-agent)' }} />
          AI Predictive Budget Foresight
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          System alerts forecasting critical breakdowns based on localized environmental triggers.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {futureNeeds.map((need, idx) => (
            <div
              key={idx}
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${need.risk === 'Critical' ? 'var(--color-critical)' : 'rgba(255,255,255,0.04)'}`,
                borderRadius: '8px',
                fontSize: '0.8rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: 'white' }}>{need.title}</span>
                <span className={`badge ${need.risk === 'Critical' ? 'badge-critical' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                  {need.risk}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {need.reason}
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--color-text-dark)' }}>Proj cost</span>
                <span style={{ color: 'white', fontWeight: 600 }}>{need.cost} USD</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
