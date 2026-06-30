import React, { useState } from 'react';
import type { AnalysisResult } from '../services/geminiService';
import { Award, ShieldCheck, CheckCircle2 } from 'lucide-react';


interface CommunityHeroProps {
  issues: AnalysisResult[];
  onVerifyIssue: (issueId: string) => void;
  userPoints: { trust: number; verification: number; rank: number };
  profileName: string;
}

interface LeaderboardUser {
  name: string;
  points: number;
  rank: string;
  verifiedCount: number;
}

export const CommunityHero: React.FC<CommunityHeroProps> = ({
  issues,
  onVerifyIssue,
  userPoints,
  profileName
}) => {
  const [votedIssues, setVotedIssues] = useState<Record<string, boolean>>({});

  const dynamicLeaderboard: LeaderboardUser[] = [
    { name: `${profileName || 'Hero'} (You)`, points: userPoints.trust, rank: "District Protector", verifiedCount: userPoints.verification },
    { name: "Sophia Martinez", points: 395, rank: "Urban Guardian", verifiedCount: 19 },
    { name: "Marcus Chen", points: 310, rank: "Infrastructure Scout", verifiedCount: 14 },
    { name: "Elena Rostova", points: 285, rank: "Civic Scout", verifiedCount: 12 },
    { name: "David Kim", points: 210, rank: "Active Neighbor", verifiedCount: 8 }
  ].sort((a, b) => b.points - a.points);


  // Get issues that are not resolved yet and need validation
  const unverifiedIssues = issues.filter(i => i.status !== 'resolved');

  const handleVote = (issueId: string) => {
    if (votedIssues[issueId]) return;
    
    setVotedIssues(prev => ({ ...prev, [issueId]: true }));
    onVerifyIssue(issueId);
  };

  return (
    <div className="dashboard-grid">
      
      {/* Citizen Hero Profile Stats */}
      <div className="glass-panel col-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-agent))',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            color: 'white',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
          }}>
            🎖️
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Hero Status</span>
            <h3 style={{ fontSize: '1.25rem', color: 'white' }}>District Protector</h3>
            <span className="badge badge-agent" style={{ fontSize: '0.65rem', marginTop: '4px' }}>
              Level {Math.floor(userPoints.trust / 100) + 1}
            </span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Trust Score</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-healthy)' }}>
              {userPoints.trust} pts
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block' }}>Verifications</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {userPoints.verification} reports
            </span>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
          💡 Earn +15 Trust Points for confirming or reporting fake incidents in your neighborhood coordinates.
        </div>
      </div>

      {/* Neighbor validation Consensus queue (Active consensus actions) */}
      <div className="glass-panel col-8" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} style={{ color: 'var(--color-healthy)' }} />
          Hyperlocal Peer Consensus Grid
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          The system detected active anomalies within walking distance of your current position. Check and verify them.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {unverifiedIssues.length > 0 ? (
            unverifiedIssues.map(issue => {
              const hasVoted = votedIssues[issue.id];
              return (
                <div
                  key={issue.id}
                  style={{
                    padding: '16px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <img src={issue.imageBefore} alt={issue.title} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: 'white' }}>{issue.title}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Category: {issue.category} • Located approx. <span style={{ color: 'white', fontWeight: 600 }}>120 meters</span> away
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dark)' }}>Consensus Signature:</span>
                        <span className="badge badge-warning" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                          {issue.verificationCount} / 4 Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {hasVoted ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-healthy)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <CheckCircle2 size={16} /> Verified (+15 XP)
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleVote(issue.id)}
                          className="btn"
                          style={{
                            padding: '6px 12px', fontSize: '0.75rem',
                            background: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            color: 'var(--color-healthy)'
                          }}
                        >
                          🟢 Confirm Issue
                        </button>
                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: '6px 12px', fontSize: '0.75rem',
                            background: 'rgba(239, 68, 68, 0.05)',
                            border: '1px solid rgba(239, 68, 68, 0.1)',
                            color: 'var(--color-critical)'
                          }}
                        >
                          🔴 Flag Spam
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-dark)', fontSize: '0.85rem' }}>
              No pending neighborhood consensus requests. You are fully synced!
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard panel */}
      <div className="glass-panel col-12" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} style={{ color: 'var(--color-warning)' }} />
          Community Heroes Leaderboard
        </h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>NEIGHBORHOOD RANK</th>
                <th>MEMBER NAME</th>
                <th>COMMUNITY TITLE</th>
                <th>REPORTS VERIFIED</th>
                <th>TOTAL TRUST POINTS</th>
              </tr>
            </thead>
            <tbody>
              {dynamicLeaderboard.map((hero, idx) => {
                const isCurrentUser = hero.name.includes("You");
                return (
                  <tr key={idx} style={{ background: isCurrentUser ? 'rgba(59,130,246,0.04)' : 'transparent' }}>
                    <td style={{ fontWeight: 'bold', color: idx === 0 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ fontWeight: 600, color: isCurrentUser ? 'white' : 'var(--color-text-muted)' }}>
                      {hero.name} {isCurrentUser && '⭐'}
                    </td>
                    <td>{hero.rank}</td>
                    <td>{hero.verifiedCount} anomalies</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--color-healthy)' }}>{hero.points} XP</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
