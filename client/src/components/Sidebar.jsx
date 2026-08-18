import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  School, 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut 
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        Skillence CRM
      </div>
      
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <NavLink 
          to="/leads" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Users size={18} />
          Leads
        </NavLink>

        <NavLink 
          to="/students" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <GraduationCap size={18} />
          Students
        </NavLink>

        <NavLink 
          to="/universities" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <School size={18} />
          Universities
        </NavLink>

        <NavLink 
          to="/courses" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <BookOpen size={18} />
          Courses
        </NavLink>

        <NavLink 
          to="/applications" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <FileText size={18} />
          Applications
        </NavLink>

        {user?.role === 'admin' && (
          <NavLink 
            to="/staff" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Settings size={18} />
            Staff List
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '8px' }}>
          <span style={{ fontWeight: 600 }}>{user?.name}</span>
          <span style={{ color: '#94a3b8', fontSize: '11px', textTransform: 'capitalize' }}>
            {user?.role}
          </span>
        </div>
        <button className="sidebar-logout-btn" onClick={logout}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LogOut size={14} />
            Logout
          </div>
        </button>
      </div>
    </aside>
  );
}
