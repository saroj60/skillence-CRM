import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { 
  Users, 
  GraduationCap, 
  FileText, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.get('/dashboard/stats');
        setStats(data.stats);
        setRecentLeads(data.recentLeads);
        setRecentStudents(data.recentStudents);
      } catch (err) {
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading dashboard details...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-4" style={{ marginBottom: '32px' }}>
        <div className="card metric-card">
          <div className="metric-info">
            <span className="metric-title">Total Leads</span>
            <span className="metric-value">{stats?.total_leads}</span>
          </div>
          <div className="metric-icon-box" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
            <Users size={22} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <span className="metric-title">Active Students</span>
            <span className="metric-value">{stats?.active_students}</span>
          </div>
          <div className="metric-icon-box" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <GraduationCap size={22} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <span className="metric-title">Active Applications</span>
            <span className="metric-value">{stats?.total_applications}</span>
          </div>
          <div className="metric-icon-box" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <FileText size={22} />
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <span className="metric-title">Pending Visas</span>
            <span className="metric-value">{stats?.pending_visas}</span>
          </div>
          <div className="metric-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {/* Columns for Recent Items */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))' }}>
        
        {/* Recent Leads */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Leads</h2>
            <Link to="/leads" className="btn btn-secondary btn-sm" style={{ padding: '4px 10px' }}>
              View All
            </Link>
          </div>
          
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Source</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No recent leads found.
                    </td>
                  </tr>
                ) : (
                  recentLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td style={{ fontWeight: 500 }}>{lead.name}</td>
                      <td>
                        <span className={`badge badge-${lead.status.toLowerCase()}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td>{lead.source || 'Direct'}</td>
                      <td>
                        <Link to={`/leads?search=${encodeURIComponent(lead.name)}`} style={{ color: 'var(--text-muted)' }}>
                          <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Students */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Recent Students</h2>
            <Link to="/students" className="btn btn-secondary btn-sm" style={{ padding: '4px 10px' }}>
              View All
            </Link>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Passport No.</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No recent students.
                    </td>
                  </tr>
                ) : (
                  recentStudents.map((student) => (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 500 }}>{student.name}</td>
                      <td>
                        <span className={`badge badge-${student.status.toLowerCase()}`}>
                          {student.status}
                        </span>
                      </td>
                      <td>{student.passport_no || 'N/A'}</td>
                      <td>
                        <Link to={`/students/${student.id}`} style={{ color: 'var(--text-muted)' }}>
                          <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
