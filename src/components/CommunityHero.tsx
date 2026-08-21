import { useState } from 'react';
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

export const CommunityHero = ({
  issues,
  onVerifyIssue,
  userPoints,
  profileName
}: CommunityHeroProps) => {
  const [votedIssues, setVotedIssues] = useState<Record<string, boolean>>({});

  const dynamicLeaderboard: LeaderboardUser[] = [
    { name: `${profileName || 'Hero'} (You)`, points: userPoints.trust, rank: "District Protector", verifiedCount: userPoints.verification },
    { name: "Sophia Martinez", points: 395, rank: "Urban Guardian", verifiedCount: 19 },
    { name: "Marcus Chen", points: 310, rank: "Infrastructure Scout", verifiedCount: 14 },
    { name: "Elena Rostova", points: 285, rank: "Civic Scout", verifiedCount: 12 },
    { name: "David Kim", points: 210, rank: "Active Neighbor", verifiedCount: 8 }
  ].sort((a, b) => b.points - a.points);

  const unverifiedIssues = issues.filter(i => i.status !== 'resolved');

  const handleVote = (issueId: string) => {
    if (votedIssues[issueId]) return;
    setVotedIssues(prev => ({ ...prev, [issueId]: true }));
    onVerifyIssue(issueId);
  };

  return (
    <div className="dashboard-grid">
      
      {/* Hero Profile */}
      <div className="glass-panel col-4" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-agent))',
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: 'white',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
          }}>
            🎖️
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>Hero Status</span>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-text-main)' }}>District Protector</h3>
            <span className="badge badge-agent" style={{ fontSize: '0.62rem', marginTop: '4px' }}>
              Level {Math.floor(userPoints.trust / 100) + 1}
            </span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', display: 'block' }}>Trust Score</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-healthy)' }}>
              {userPoints.trust} pts
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', display: 'block' }}>Verifications</span>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {userPoints.verification} reports
            </span>
          </div>
        </div>

        <div style={{ 
          fontSize: '0.72rem', 
          color: 'var(--color-text-muted)', 
          background: 'var(--bg-deep)', 
          padding: '10px', 
          borderRadius: '8px', 
          border: '1px solid var(--border-subtle)',
          lineHeight: '1.4'
        }}>
          💡 Earn +15 Trust Points for confirming or flagging incidents in your neighborhood.
        </div>
      </div>

      {/* Peer Consensus Grid */}
      <div className="glass-panel col-8" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} style={{ color: 'var(--color-healthy)' }} />
          Peer Consensus Grid
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          Active anomalies near your position. Check and verify them to earn trust points.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {unverifiedIssues.length > 0 ? (
            unverifiedIssues.map(issue => {
              const hasVoted = votedIssues[issue.id];
              return (
                <div
                  key={issue.id}
                  style={{
                    padding: '14px',
                    background: 'var(--bg-deep)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img 
                      src={issue.imageBefore} 
                      alt={issue.title} 
                      loading="lazy"
                      style={{ 
                        width: '56px', 
                        height: '56px', 
                        borderRadius: '8px', 
                        objectFit: 'cover',
                        border: '1px solid var(--border-subtle)'
                      }} 
                    />
                    <div>
                      <h4 style={{ fontSize: '0.88rem', color: 'var(--color-text-main)' }}>{issue.title}</h4>
                      <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {issue.category} • ~<span style={{ color: 'var(--color-text-main)', fontWeight: 500 }}>120m</span> away
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-dark)' }}>Consensus:</span>
                        <span className="badge badge-warning" style={{ fontSize: '0.58rem', padding: '2px 6px' }}>
                          {issue.verificationCount} / 4 Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {hasVoted ? (
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-healthy)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                        <CheckCircle2 size={14} /> Verified (+15 XP)
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleVote(issue.id)}
                          className="btn"
                          style={{
                            padding: '6px 12px', 
                            fontSize: '0.72rem',
                            background: 'rgba(5, 150, 105, 0.05)',
                            border: '1px solid rgba(5, 150, 105, 0.12)',
                            color: 'var(--color-healthy)'
                          }}
                        >
                          🟢 Confirm
                        </button>
                        <button
                          type="button"
                          className="btn"
                          style={{
                            padding: '6px 12px', 
                            fontSize: '0.72rem',
                            background: 'rgba(220, 38, 38, 0.03)',
                            border: '1px solid rgba(220, 38, 38, 0.08)',
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
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-dark)', fontSize: '0.82rem' }}>
              All synced — no pending consensus requests.
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass-panel col-12" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={18} style={{ color: 'var(--color-warning)' }} />
          Community Heroes Leaderboard
        </h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Member</th>
                <th>Title</th>
                <th>Verified</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {dynamicLeaderboard.map((hero, idx) => {
                const isCurrentUser = hero.name.includes("You");
                return (
                  <tr key={idx} style={{ background: isCurrentUser ? 'rgba(37, 99, 235, 0.025)' : 'transparent' }}>
                    <td style={{ fontWeight: 700, color: idx === 0 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ fontWeight: isCurrentUser ? 600 : 400, color: isCurrentUser ? 'var(--color-text-main)' : 'var(--color-text-muted)' }}>
                      {hero.name} {isCurrentUser && '⭐'}
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{hero.rank}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{hero.verifiedCount}</td>
                    <td style={{ fontWeight: 600, color: 'var(--color-healthy)' }}>{hero.points} XP</td>
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
