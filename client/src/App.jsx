import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Sidebar from './components/Sidebar.jsx';

// Pages imports
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Leads from './pages/Leads.jsx';
import Students from './pages/Students.jsx';
import StudentDetail from './pages/StudentDetail.jsx';
import Universities from './pages/Universities.jsx';
import Courses from './pages/Courses.jsx';
import Applications from './pages/Applications.jsx';
import Staff from './pages/Staff.jsx';
import Track from './pages/Track.jsx';

function AppLayout() {
  const { user, logout } = useAuth();
  
  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main workspace */}
      <div className="app-content">
        <header className="app-header">
          <div className="user-profile-badge" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Signed in as: <strong>{user?.name}</strong> ({user?.email})</span>
            <button 
              onClick={logout} 
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              Logout
            </button>
          </div>
        </header>

        <main className="main-container">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="students" element={<Students />} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="universities" element={<Universities />} />
            <Route path="courses" element={<Courses />} />
            <Route path="applications" element={<Applications />} />
            
            {/* Admin only route */}
            <Route 
              path="staff" 
              element={user?.role === 'admin' ? <Staff /> : <Navigate to="/dashboard" replace />} 
            />

            {/* Fallback inside app shell */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Protected routes router helper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public login */}
          <Route path="/login" element={<Login />} />
          
          {/* Public Status Tracker */}
          <Route path="/track" element={<Track />} />
          
          {/* Protected CRM workspace shell */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
