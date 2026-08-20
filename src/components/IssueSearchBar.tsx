import React, { useState, useRef, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { AnalysisResult } from '../services/geminiService';

interface IssueSearchBarProps {
  issues: AnalysisResult[];
  onFiltered: (filtered: AnalysisResult[]) => void;
}

export const IssueSearchBar: React.FC<IssueSearchBarProps> = ({ issues, onFiltered }) => {
  const [searchText, setSearchText] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [category, setCategory] = useState('all');
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = (text: string, cat: string, sev: string, stat: string) => {
    let result = [...issues];

    if (text.trim()) {
      const q = text.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.infrastructure.toLowerCase().includes(q)
      );
    }

    if (cat !== 'all') {
      result = result.filter(i => i.category === cat);
    }

    if (sev !== 'all') {
      result = result.filter(i => {
        if (sev === 'critical') return i.priorityScore >= 80;
        if (sev === 'high') return i.priorityScore >= 60 && i.priorityScore < 80;
        if (sev === 'medium') return i.priorityScore >= 40 && i.priorityScore < 60;
        return i.priorityScore < 40;
      });
    }

    if (stat !== 'all') {
      result = result.filter(i => i.status === stat);
    }

    onFiltered(result);
  };

  const handleTextChange = useCallback((val: string) => {
    setSearchText(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      applyFilters(val, category, severity, status);
    }, 200);
  }, [category, severity, status]);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    applyFilters(searchText, val, severity, status);
  };

  const handleSeverityChange = (val: string) => {
    setSeverity(val);
    applyFilters(searchText, category, val, status);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    applyFilters(searchText, category, severity, val);
  };

  const clearAll = () => {
    setSearchText('');
    setCategory('all');
    setSeverity('all');
    setStatus('all');
    onFiltered(issues);
  };

  const hasFilters = category !== 'all' || severity !== 'all' || status !== 'all';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '8px 14px'
        }}>
          <Search size={15} style={{ color: 'var(--color-text-dark)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search issues by title, description, category..."
            value={searchText}
            onChange={(e) => handleTextChange(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '0.82rem',
              color: 'var(--color-text-main)',
              outline: 'none',
              width: '100%',
              fontFamily: 'var(--font-body)'
            }}
          />
          {searchText && (
            <button
              type="button"
              onClick={() => handleTextChange('')}
              aria-label="Clear search"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dark)', padding: '2px' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="btn"
          aria-expanded={showFilters}
          aria-label="Toggle filters"
          style={{
            padding: '8px 14px',
            fontSize: '0.78rem',
            background: hasFilters ? 'rgba(37, 99, 235, 0.06)' : 'var(--bg-card)',
            borderColor: hasFilters ? 'rgba(37, 99, 235, 0.15)' : undefined,
            color: hasFilters ? 'var(--color-primary)' : undefined
          }}
        >
          <Filter size={14} />
          Filters
          {hasFilters && (
            <span style={{
              width: '16px', height: '16px', borderRadius: '50%',
              background: 'var(--color-primary)', color: 'white',
              fontSize: '0.58rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {[category, severity, status].filter(v => v !== 'all').length}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div
          className="animate-slide-up"
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            padding: '12px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-dark)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.03em' }}>
              Category
            </span>
            <select
              className="form-select"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '5px 8px' }}
            >
              <option value="all">All Categories</option>
              <option value="Road & Transport">Road & Transport</option>
              <option value="Water & Utilities">Water & Utilities</option>
              <option value="Electrical & Lighting">Electrical & Lighting</option>
              <option value="Waste & Environment">Waste & Environment</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-dark)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.03em' }}>
              Severity
            </span>
            <select
              className="form-select"
              value={severity}
              onChange={(e) => handleSeverityChange(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '5px 8px' }}
            >
              <option value="all">All Levels</option>
              <option value="critical">Critical (80+)</option>
              <option value="high">High (60-79)</option>
              <option value="medium">Medium (40-59)</option>
              <option value="low">Low (&lt;40)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-dark)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.03em' }}>
              Status
            </span>
            <select
              className="form-select"
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{ fontSize: '0.75rem', padding: '5px 8px' }}
            >
              <option value="all">All Statuses</option>
              <option value="detected">Detected</option>
              <option value="investigated">Investigated</option>
              <option value="planning">Planning</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-critical)',
                fontSize: '0.72rem',
                fontWeight: 500,
                padding: '4px 8px',
                marginTop: '14px'
              }}
            >
              Clear All
            </button>
          )}
        </div>
      )}
    </div>
  );
};
