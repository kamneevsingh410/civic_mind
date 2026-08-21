import { Download } from 'lucide-react';
import type { AnalysisResult } from '../services/geminiService';

interface ExportButtonProps {
  issues: AnalysisResult[];
  label?: string;
}

export const ExportButton = ({ issues, label = 'Export CSV' }: ExportButtonProps) => {

  const handleExport = () => {
    const headers = [
      'ID', 'Title', 'Category', 'Status', 'Severity', 'Confidence',
      'Priority Score', 'Latitude', 'Longitude', 'Infrastructure',
      'Verifications', 'Trust Score', 'Est. Cost', 'Department',
      'Timeframe', 'Created At'
    ];

    const rows = issues.map(issue => [
      issue.id,
      `"${issue.title.replace(/"/g, '""')}"`,
      issue.category,
      issue.status,
      issue.severity,
      issue.confidence,
      issue.priorityScore,
      issue.latitude.toFixed(6),
      issue.longitude.toFixed(6),
      `"${issue.infrastructure.replace(/"/g, '""')}"`,
      issue.verificationCount,
      issue.trustScore,
      issue.plan.estimatedCost,
      `"${issue.plan.department.replace(/"/g, '""')}"`,
      issue.plan.timeframe,
      issue.createdAt
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `civicmind-issues-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="btn"
      aria-label="Export issues to CSV"
      style={{ fontSize: '0.78rem', padding: '8px 14px' }}
    >
      <Download size={14} />
      {label}
    </button>
  );
};
