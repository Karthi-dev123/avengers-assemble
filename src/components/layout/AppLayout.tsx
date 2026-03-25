import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface AppLayoutProps {
  children: React.ReactNode;
  alertCount?: number;
  coordinatorName?: string;
  onSearch?: (query: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, alertCount = 0, coordinatorName, onSearch }) => {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar alertCount={alertCount} coordinatorName={coordinatorName} />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Topbar */}
        <Topbar alertCount={alertCount} onSearch={onSearch} />

        {/* Page content */}
        <main className="flex-1 overflow-auto pt-16">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
