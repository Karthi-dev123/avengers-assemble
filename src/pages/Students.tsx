import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StudentRow } from '../components/shared/StudentRow';
import { useStudents } from '../hooks/useStudents';
import { PROGRAMS } from '../lib/constants';

export const Students: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('All');

  const searchQuery = searchParams.get('search') || '';
  const programFilter = activeTab !== 'All' ? activeTab : undefined;

  const { students, loading } = useStudents({
    program: programFilter,
    search: searchQuery,
  });

  const tabs = ['All', PROGRAMS.VIDHAI, PROGRAMS.MENTORSHIP, PROGRAMS.HOSTELS, PROGRAMS.FELLOWSHIP];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">All Students</h1>
        <p className="text-slate-600 mt-1">Manage and track student progress across all programs</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white rounded-t-lg">
        <div className="flex gap-8 px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-1 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-sidebar-accent text-sidebar-accent'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Student</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">District</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Programs</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Health Score</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Last Activity</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <StudentRow key={student.id} student={student} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-600">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
