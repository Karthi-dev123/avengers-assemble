export const PROGRAMS = {
  VIDHAI: 'Vidhai',
  MENTORSHIP: 'Mentorship',
  HOSTELS: 'Hostels',
  FELLOWSHIP: 'NP Fellowship',
} as const;

export const PROGRAM_COLORS = {
  'Vidhai': '#0D9488',
  'Mentorship': '#7C3AED',
  'Hostels': '#F59E0B',
  'NP Fellowship': '#EF4444',
} as const;

export const STATUS_COLORS = {
  'active': '#10B981',
  'watch': '#F59E0B',
  'at_risk': '#EF4444',
} as const;

export const HEALTH_SCORE_COLORS = {
  good: '#10B981',   // 75+
  medium: '#F59E0B', // 55-74
  poor: '#EF4444',   // <55
} as const;

export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export const PROGRAM_BADGES = {
  'Vidhai': { color: '#0D9488', label: 'Vidhai' },
  'Mentorship': { color: '#7C3AED', label: 'Mentorship' },
  'Hostels': { color: '#F59E0B', label: 'Hostels' },
  'NP Fellowship': { color: '#EF4444', label: 'Fellowship' },
} as const;

export const ALERT_SEVERITY_ORDER = ['critical', 'warning', 'watch'] as const;
