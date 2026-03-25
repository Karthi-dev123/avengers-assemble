export interface Student {
  id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  aadhaar_last4: string;
  photo_url?: string;
  phone?: string;
  email?: string;
  parent_phone: string;
  home_village: string;
  district: string;
  state: string;
  father_name?: string;
  mother_name?: string;
  family_income_bracket: string;
  first_gen_learner: boolean;
  current_class: string;
  institution_name: string;
  institution_type: string;
  stream?: string;
  aspiration?: string;
  referral_source: string;
  first_contact_date: string;
  created_at: string;
  programs: ProgramEnrollment[];
  performance_score?: number;
  status: 'active' | 'watch' | 'at_risk';
  last_activity?: string;
  forecast?: Forecast;
}

export interface Program {
  id: string;
  name: 'Vidhai' | 'Mentorship' | 'Hostels' | 'NP Fellowship';
  description: string;
  is_active: boolean;
}

export interface ProgramEnrollment {
  id: string;
  student_id: string;
  program_id: string;
  program_name: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'paused' | 'completed' | 'withdrawn';
  program_specific_data?: Record<string, any>;
}

export interface Interaction {
  id: string;
  student_id: string;
  program_id: string;
  program_name: string;
  interaction_type: 'mentor_session' | 'hostel_checkin' | 'disbursement' | 'fellowship_review' | 'meeting_transcript' | 'general_note';
  interaction_date: string;
  notes?: string;
  metadata?: Record<string, any>;
  recorded_by: string;
}

export interface Meeting {
  id: string;
  student_id: string;
  student_name: string;
  mentor_id: string;
  mentor_name: string;
  scheduled_at: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  recording_url?: string;
  transcript?: string;
  ai_summary?: string;
  action_items?: ActionItem[];
  student_mood?: string;
  created_at: string;
}

export interface ActionItem {
  task: string;
  owner: string;
  deadline?: string;
}

export interface PerformanceScore {
  id: string;
  student_id: string;
  score: number;
  breakdown: {
    attendance?: number;
    academics?: number;
    milestones?: number;
    recency?: number;
  };
  computed_at: string;
}

export interface Alert {
  id: string;
  student_id: string;
  student_name: string;
  mentor_id?: string;
  mentor_name?: string;
  alert_type: 'score_drop' | 'missed_sessions' | 'no_checkin' | 'milestone_overdue';
  severity: 'critical' | 'warning' | 'watch';
  description: string;
  suggested_action: string;
  created_at: string;
  resolved_at?: string;
}

export interface Forecast {
  educational_path: string;
  degree_probability: number;
  career_outcome: string;
  risk_factors: string[];
  generated_at: string;
}

export interface TimelineEntry {
  id: string;
  type: 'enrollment' | 'interaction' | 'meeting' | 'outcome' | 'score_change' | 'alert';
  date: string;
  title: string;
  description: string;
  program?: string;
  metadata?: Record<string, any>;
  expandable?: boolean;
}

export interface DashboardMetrics {
  total_enrolled: number;
  total_active: number;
  at_risk_count: number;
  outcomes_count: number;
  enrolled_delta: number;
  outcomes_delta: number;
}

export interface ColumnMapping {
  csv_column: string;
  db_field: string;
  confidence: number;
}

export interface Mentor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  program_name: string;
  photo_url?: string;
}

export interface Coordinator {
  id: string;
  full_name: string;
  email: string;
  role: string;
  photo_url?: string;
}
