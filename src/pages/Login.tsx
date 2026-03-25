import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock login - in real app, this would call API
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar-dark to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card p-8 rounded-xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-sidebar-accent">Agaram IBMS</h1>
            <p className="text-sm text-slate-600 mt-2">Integrated Beneficiary Management System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coordinator@agaram.org"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sidebar-accent focus:ring-2 focus:ring-sidebar-accent/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-sidebar-accent focus:ring-2 focus:ring-sidebar-accent/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-sidebar-accent text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo note */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 text-center">
              <span className="font-semibold">Demo:</span> Use any email/password to login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
