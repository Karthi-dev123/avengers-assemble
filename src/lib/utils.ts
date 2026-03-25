import { HEALTH_SCORE_COLORS, STATUS_COLORS } from './constants';

export const getHealthScoreColor = (score: number): string => {
  if (score >= 75) return HEALTH_SCORE_COLORS.good;
  if (score >= 55) return HEALTH_SCORE_COLORS.medium;
  return HEALTH_SCORE_COLORS.poor;
};

export const getStatusColor = (status: 'active' | 'watch' | 'at_risk'): string => {
  return STATUS_COLORS[status];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getStatusLabel = (status: 'active' | 'watch' | 'at_risk'): string => {
  return status === 'at_risk' ? 'At Risk' : status.charAt(0).toUpperCase() + status.slice(1);
};

export const getAlertSeverityColor = (severity: 'critical' | 'warning' | 'watch'): string => {
  switch (severity) {
    case 'critical':
      return '#EF4444';
    case 'warning':
      return '#F59E0B';
    case 'watch':
      return '#94A3B8';
    default:
      return '#475569';
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const studentIsEnrolledInProgram = (student: any, programName: string): boolean => {
  return student.programs?.some((p: any) => p.program_name === programName && p.status === 'active');
};
