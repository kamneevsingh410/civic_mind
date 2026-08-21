import { useState, useEffect, type KeyboardEvent } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
  role: 'citizen' | 'official' | 'system';
}

interface IssueCommentsProps {
  issueId: string;
  profileName: string;
}

const AUTO_COMMENTS: Record<string, Comment[]> = {
  'issue-1': [
    { id: 'c1', author: 'Vision Agent', text: 'Structural crack analysis complete. Severity classified as HIGH based on sub-base erosion patterns.', time: '2 min ago', role: 'system' },
    { id: 'c2', author: 'Marcus Chen', text: 'I drive past this spot daily — the hole is getting bigger. Please prioritize.', time: '15 min ago', role: 'citizen' },
    { id: 'c3', author: 'Road Maintenance Lead', text: 'Crew has been dispatched. Expected repair window: tomorrow 8 AM.', time: '30 min ago', role: 'official' }
  ],
  'issue-2': [
    { id: 'c4', author: 'Hydrology Agent', text: 'Water loss rate estimated at 20L/min. Adjacent soil saturation detected.', time: '5 min ago', role: 'system' },
    { id: 'c5', author: 'Elena Rostova', text: 'My garden is flooding because of this. Please fix ASAP!', time: '20 min ago', role: 'citizen' }
  ],
  'issue-3': [
    { id: 'c6', author: 'Community Bot', text: 'This area is near a school zone. Safety priority automatically elevated.', time: '1 min ago', role: 'system' },
    { id: 'c7', author: 'Sophia Martinez', text: 'Confirmed — walked past at night, total blackout. Kids use this route.', time: '10 min ago', role: 'citizen' },
    { id: 'c8', author: 'Power Division', text: 'New LED luminaires have been ordered. Installation scheduled for Thursday.', time: '25 min ago', role: 'official' }
  ]
};

export const IssueComments = ({ issueId, profileName }: IssueCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    setComments(AUTO_COMMENTS[issueId] || [
      { id: 'auto-1', author: 'CivicMind System', text: 'Issue is under active investigation by the agent network.', time: 'Just now', role: 'system' }
    ]);
  }, [issueId]);

  const handleSend = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `user-${Date.now()}`,
      author: profileName || 'Citizen',
      text: newComment.trim(),
      time: 'Just now',
      role: 'citizen'
    };
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const roleColors = {
    citizen: 'var(--color-primary)',
    official: 'var(--color-healthy)',
    system: 'var(--color-agent)'
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={15} style={{ color: 'var(--color-primary)' }} />
        <h4 style={{ fontSize: '0.88rem', color: 'var(--color-text-main)', margin: 0 }}>
          Discussion
        </h4>
        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-dark)' }}>
          {comments.length} comments
        </span>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxHeight: '200px',
        overflowY: 'auto',
        padding: '4px 0'
      }}>
        {comments.map(comment => (
          <div key={comment.id} style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: `${roleColors[comment.role]}10`,
              border: `1.5px solid ${roleColors[comment.role]}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: '2px'
            }}>
              <User size={12} style={{ color: roleColors[comment.role] }} />
            </div>
            <div style={{ flexGrow: 1 }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  {comment.author}
                </span>
                <span style={{
                  fontSize: '0.55rem',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: `${roleColors[comment.role]}08`,
                  color: roleColors[comment.role],
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {comment.role}
                </span>
                <span style={{ fontSize: '0.62rem', color: 'var(--color-text-dark)', marginLeft: 'auto' }}>
                  {comment.time}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: '1.45' }}>
                {comment.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '10px'
      }}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          className="form-input"
          style={{
            flexGrow: 1,
            fontSize: '0.78rem',
            padding: '8px 12px',
            borderRadius: '8px'
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!newComment.trim()}
          className="btn btn-primary"
          aria-label="Send comment"
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            opacity: newComment.trim() ? 1 : 0.5
          }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};
