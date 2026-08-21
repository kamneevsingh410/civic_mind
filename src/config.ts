// CivicMind — Application Configuration & Constants

/** Default coordinates (Bangalore, India) used when geolocation is unavailable */
export const DEFAULT_COORDS = { lat: 12.97159, lng: 77.59456 } as const;

/** Tab route definitions */
export const TAB_ROUTES = {
  'digital-twin': {
    title: 'Autonomous Digital Twin',
    description: 'Living city vector mesh tracking infrastructure health ratings.',
  },
  'detection': {
    title: 'Smart Detection Portal',
    description: 'Upload community issues directly to the AI-powered municipal agents.',
  },
  'command-center': {
    title: 'Multi-Agent Command Center',
    description: 'Visual inspection of agent interactions and computational thoughts.',
  },
  'authority': {
    title: 'Autonomous Resolution Planner',
    description: 'Review AI-generated work estimates, material sheets, and verify repairs.',
  },
  'analytics': {
    title: 'Civic Intelligence Dashboard',
    description: 'Aggregate city performance index, predicted failures, and spent budgets.',
  },
  'gamification': {
    title: 'Community Heroes',
    description: 'Consensus-based neighborhood verification missions for local heroes.',
  },
} as const;

/** Role-based tab visibility */
export const ROLE_TABS: Record<string, string[]> = {
  citizen: ['digital-twin', 'detection', 'gamification'],
  volunteer: ['digital-twin', 'detection', 'gamification'],
  official: ['digital-twin', 'command-center', 'authority', 'analytics'],
  admin: ['digital-twin', 'command-center', 'authority', 'analytics', 'detection', 'gamification'],
};

/** Keyboard shortcut map for tab switching (1-6) */
export const TAB_SHORTCUTS: Record<string, string> = {
  '1': 'digital-twin',
  '2': 'detection',
  '3': 'command-center',
  '4': 'authority',
  '5': 'analytics',
  '6': 'gamification',
};

/** LocalStorage keys used across the app */
export const STORAGE_KEYS = {
  API_KEY: 'civicmind_gemini_api_key',
  POINTS: 'civicmind_user_points',
  USERNAME: 'civicmind_username',
  LAST_LOCATION: 'civicmind_last_location',
} as const;

/** Points awarded for actions */
export const POINTS = {
  ISSUE_RESOLVED: 50,
  ISSUE_VERIFIED: 15,
} as const;

/** Reverse geocode helper */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    { headers: { 'Accept': 'application/json' } }
  );
  const data = await res.json();
  const city = data.address?.city || data.address?.town || data.address?.village || '';
  const country = data.address?.country || '';
  return [city, country].filter(Boolean).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/** Validate a user's profile name */
export function validateProfileName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return 'Name is required';
  if (trimmed.length < 2) return 'Name must be at least 2 characters';
  if (trimmed.length > 20) return 'Name must be 20 characters or less';
  return null;
}

/** Escape HTML to prevent XSS when interpolating user content into HTML strings */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
