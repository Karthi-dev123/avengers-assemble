import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, Video, Bell, Upload, Grid3x3, LogOut, Menu, X } from 'lucide-react';

interface SidebarProps {
  alertCount?: number;
  coordinatorName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ alertCount = 0, coordinatorName = 'Coordinator' }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = [
    {
      label: 'OVERVIEW',
      items: [
        { icon: BarChart3, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'All Students', path: '/students' },
      ],
    },
    {
      label: 'TRACKING',
      items: [
        { icon: Video, label: 'Meetings', path: '/meetings' },
        { icon: Bell, label: 'Alerts', path: '/alerts', badge: alertCount > 0 ? alertCount : undefined },
      ],
    },
    {
      label: 'DATA',
      items: [
        { icon: Upload, label: 'Upload Data', path: '/upload' },
        { icon: Grid3x3, label: 'Programs', path: '/programs' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 hover:bg-slate-200 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-sidebar-dark text-white transition-all duration-300 z-40 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-sidebar-accent">Agaram IBMS</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-8 overflow-y-auto">
            {navItems.map((section) => (
              <div key={section.label}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{section.label}</p>
                <ul className="space-y-2">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                            active ? 'bg-sidebar-accent text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          <Icon size={18} />
                          <span className="text-sm font-medium flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* Footer - Coordinator Info */}
          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center font-bold text-sm">
                {coordinatorName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{coordinatorName}</p>
                <p className="text-xs text-slate-400">Coordinator</p>
              </div>
            </div>
            <button className="w-full mt-3 flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
