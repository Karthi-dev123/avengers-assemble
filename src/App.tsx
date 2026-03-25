import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { useAlerts } from './hooks/useAlerts';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { StudentProfile } from './pages/StudentProfile';
import { Meetings } from './pages/Meetings';
import { MeetingRoom } from './pages/MeetingRoom';
import { Alerts } from './pages/Alerts';
import { Upload } from './pages/Upload';
import { Programs } from './pages/Programs';

const AppContent: React.FC = () => {
  const { alerts } = useAlerts();

  return (
    <AppLayout
      alertCount={alerts.length}
      coordinatorName="Raj Kumar"
      onSearch={() => {}}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/:id" element={<StudentProfile />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/meetings/:id/room" element={<MeetingRoom />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppLayout>
  );
};

const App: React.FC = () => {
  const isLoggedIn = true; // Set to true for demo

  if (!isLoggedIn) {
    return (
      <Router>
        <Routes>
          <Route
            path="/*"
            element={
              <Login />
            }
          />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
