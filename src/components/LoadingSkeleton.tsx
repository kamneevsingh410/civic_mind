import type { CSSProperties } from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: CSSProperties;
}

const skeletonBase: CSSProperties = {
  background: 'linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite ease-in-out',
  borderRadius: '6px',
};

export const Skeleton = ({
  width = '100%',
  height = '16px',
  borderRadius = '6px',
  style,
}: SkeletonProps) => (
  <div
    style={{
      ...skeletonBase,
      width,
      height,
      borderRadius,
      ...style,
    }}
  />
);

/** Card-style loading skeleton for issue cards */
export const IssueCardSkeleton = () => (
  <div
    className="glass-panel"
    style={{
      padding: '14px',
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
    }}
  >
    <Skeleton width="48px" height="48px" borderRadius="8px" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Skeleton width="60%" height="14px" />
      <Skeleton width="40%" height="11px" />
      <Skeleton width="80%" height="11px" />
    </div>
    <Skeleton width="48px" height="24px" borderRadius="12px" />
  </div>
);

/** Dashboard scorecard skeleton */
export const ScorecardSkeleton = () => (
  <div
    className="glass-panel"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '18px',
    }}
  >
    <Skeleton width="40px" height="40px" borderRadius="10px" />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Skeleton width="65%" height="12px" />
      <Skeleton width="45%" height="20px" />
      <Skeleton width="55%" height="10px" />
    </div>
  </div>
);

/** Map sidebar skeleton */
export const MapSidebarSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px' }}>
    <Skeleton width="80%" height="16px" />
    <Skeleton width="100%" height="12px" />
    <div style={{ marginTop: '12px' }}>
      <Skeleton width="100%" height="36px" borderRadius="8px" />
    </div>
    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Skeleton width="100%" height="40px" borderRadius="8px" />
      <Skeleton width="100%" height="40px" borderRadius="8px" />
      <Skeleton width="100%" height="40px" borderRadius="8px" />
    </div>
  </div>
);
