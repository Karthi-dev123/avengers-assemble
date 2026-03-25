import axios from 'axios';
import { API_BASE_URL } from './constants';
import { mockData } from './mockData';
import { Student, Meeting, Alert, TimelineEntry, Forecast, Program, DashboardMetrics, ColumnMapping, PerformanceScore } from './types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock API calls - these will replace with real axios calls when backend is ready

export const studentApi = {
  getStudents: async (filters?: { program?: string; status?: string; search?: string }): Promise<Student[]> => {
    // Return all students or filtered
    let students = mockData.students;
    if (filters?.program) {
      students = students.filter(s => s.programs.some(p => p.program_name === filters.program && p.status === 'active'));
    }
    if (filters?.status) {
      students = students.filter(s => s.status === filters.status);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      students = students.filter(s => s.full_name.toLowerCase().includes(searchLower) || s.district.toLowerCase().includes(searchLower));
    }
    return Promise.resolve(students);
  },

  getStudent: async (id: string): Promise<Student> => {
    const student = mockData.students.find(s => s.id === id);
    if (!student) throw new Error('Student not found');
    return Promise.resolve(student);
  },

  getTimeline: async (_studentId: string): Promise<TimelineEntry[]> => {
    return Promise.resolve(mockData.timeline);
  },

  getForecast: async (studentId: string): Promise<Forecast> => {
    const student = mockData.students.find(s => s.id === studentId);
    if (!student || !student.forecast) throw new Error('Forecast not found');
    return Promise.resolve(student.forecast);
  },

  refreshForecast: async (studentId: string): Promise<Forecast> => {
    return studentApi.getForecast(studentId);
  },
};

export const programApi = {
  getPrograms: async (): Promise<Program[]> => {
    return Promise.resolve(mockData.programs);
  },
};

export const dashboardApi = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const students = mockData.students;
    return Promise.resolve({
      total_enrolled: students.length,
      total_active: students.filter(s => s.status === 'active').length,
      at_risk_count: students.filter(s => s.status === 'at_risk').length,
      outcomes_count: 26,
      enrolled_delta: 4,
      outcomes_delta: 8,
    });
  },
};

export const uploadApi = {
  uploadMapping: async (_file: File): Promise<{ mappings: ColumnMapping[]; row_count: number }> => {
    return Promise.resolve({
      mappings: [
        { csv_column: 'Full Name', db_field: 'full_name', confidence: 0.98 },
        { csv_column: 'DOB', db_field: 'date_of_birth', confidence: 0.92 },
        { csv_column: 'District', db_field: 'district', confidence: 0.95 },
      ],
      row_count: 142,
    });
  },

  confirmImport: async (): Promise<{ inserted: number; duplicates: number; review: number }> => {
    return Promise.resolve({
      inserted: 142,
      duplicates: 3,
      review: 2,
    });
  },
};

export const meetingApi = {
  getMeetings: async (filters?: { student_id?: string; status?: string }): Promise<Meeting[]> => {
    let meetings = mockData.meetings;
    if (filters?.student_id) {
      meetings = meetings.filter(m => m.student_id === filters.student_id);
    }
    if (filters?.status) {
      meetings = meetings.filter(m => m.status === filters.status);
    }
    return Promise.resolve(meetings);
  },

  getMeeting: async (id: string): Promise<Meeting> => {
    const meeting = mockData.meetings.find(m => m.id === id);
    if (!meeting) throw new Error('Meeting not found');
    return Promise.resolve(meeting);
  },

  createMeeting: async (data: Partial<Meeting>): Promise<Meeting> => {
    const newMeeting: Meeting = {
      id: `m${Math.random().toString(36).substr(2, 9)}`,
      student_id: data.student_id!,
      student_name: data.student_name!,
      mentor_id: data.mentor_id!,
      mentor_name: data.mentor_name!,
      scheduled_at: data.scheduled_at!,
      status: 'scheduled',
      created_at: new Date().toISOString(),
    };
    return Promise.resolve(newMeeting);
  },

  updateMeeting: async (id: string, data: Partial<Meeting>): Promise<Meeting> => {
    const meeting = mockData.meetings.find(m => m.id === id);
    if (!meeting) throw new Error('Meeting not found');
    return Promise.resolve({ ...meeting, ...data });
  },
};

export const alertApi = {
  getAlerts: async (): Promise<Alert[]> => {
    return Promise.resolve(mockData.alerts.filter(a => !a.resolved_at));
  },

  resolveAlert: async (id: string, _notes?: string): Promise<Alert> => {
    const alert = mockData.alerts.find(a => a.id === id);
    if (!alert) throw new Error('Alert not found');
    return Promise.resolve({ ...alert, resolved_at: new Date().toISOString() });
  },

  scheduleMeetingFromAlert: async (alertId: string, mentorId: string, scheduledAt: string): Promise<Meeting> => {
    const alert = mockData.alerts.find(a => a.id === alertId);
    if (!alert) throw new Error('Alert not found');
    
    const mentor = { id: mentorId, full_name: 'Dr. Mentor', email: 'mentor@example.com', phone: '+91 9876543210', program_name: 'Mentorship' };
    
    return meetingApi.createMeeting({
      student_id: alert.student_id,
      student_name: alert.student_name,
      mentor_id: mentor.id,
      mentor_name: mentor.full_name,
      scheduled_at: scheduledAt,
    });
  },
};

export const performanceApi = {
  getHistory: async (studentId: string): Promise<PerformanceScore[]> => {
    return Promise.resolve(mockData.performanceScores.filter(ps => ps.student_id === studentId));
  },
};

export default api;
