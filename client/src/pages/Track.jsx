import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { 
  Search, 
  ArrowLeft, 
  CheckCircle, 
  Calendar, 
  FileText, 
  History, 
  Clock, 
  User 
} from 'lucide-react';

const STATUS_STEPS = ['Active', 'Applied', 'Offer Holder', 'Visa', 'Enrolled'];

export default function Track() {
  const [passportNo, setPassportNo] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Loaded Tracking Data
  const [data, setData] = useState(null);

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setData(null);

    try {
      const trackingResult = await api.post('/students/track', {
        passport_no: passportNo,
        dob
      });
      setData(trackingResult);
    } catch (err) {
      setError(err.message || 'No record found. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setPassportNo('');
    setDob('');
    setError('');
  };

  // Helper to render Step Tracker
  const currentStepIndex = data ? STATUS_STEPS.indexOf(data.student.status) : -1;

  return (
    <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 20px' }}>
      
      {/* Top Navigation */}
      <div style={{ maxWidth: data ? '880px' : '440px', width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Portal Login
        </Link>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>Skellence Status Tracker</span>
      </div>

      <div className="card" style={{ maxWidth: data ? '880px' : '440px', width: '100%', padding: '32px', boxShadow: 'var(--shadow-lg)' }}>
        
        {!data ? (
          /* 1. ENTRY SEARCH FORM */
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>Track Your Application</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginBottom: '28px' }}>
              Enter your passport number and date of birth to check your visa and college application progress.
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleTrackSubmit}>
              <div className="form-group">
                <label className="form-label">Passport Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. N1234567"
                  value={passportNo}
                  onChange={(e) => setPassportNo(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
                disabled={loading}
              >
                {loading ? 'Fetching progress...' : 'Track Progress'}
              </button>
            </form>
          </div>
        ) : (
          /* 2. REAL-TIME STUDENT TRACKING VIEW */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '20px', marginBottom: '28px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>Student Profile</span>
                <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '2px 0' }}>{data.student.name}</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Target: {data.student.preferred_course || 'N/A'} ({data.student.preferred_country || 'N/A'})
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleReset}>
                New Search
              </button>
            </div>

            {/* Step-by-Step Milestone Visualizer */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Milestone Tracker</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '10px 0' }}>
                {/* Horizontal connector line */}
                <div style={{ position: 'absolute', top: '24px', left: '8%', right: '8%', height: '2px', backgroundColor: 'var(--border)', zIndex: 1 }}></div>
                <div style={{ position: 'absolute', top: '24px', left: '8%', width: `${Math.max(0, currentStepIndex) * 21}%`, height: '2px', backgroundColor: 'var(--primary)', zIndex: 2, transition: 'width 0.4s ease' }}></div>

                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isActive = idx === currentStepIndex;
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '18%' }}>
                      <div style={{ 
                        width: '30px', 
                        height: '30px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justify: 'center', 
                        backgroundColor: isCompleted ? 'var(--primary)' : 'var(--bg-main)', 
                        color: isCompleted ? '#fff' : 'var(--text-muted)', 
                        border: isCompleted ? '2px solid var(--primary)' : '2px solid var(--border)',
                        fontWeight: 600,
                        fontSize: '12px',
                        justifyContent: 'center'
                      }}>
                        {isCompleted ? '✓' : idx + 1}
                      </div>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: isActive ? 700 : 500, 
                        color: isActive ? 'var(--primary)' : 'var(--text-muted)', 
                        marginTop: '8px', 
                        textAlign: 'center',
                        whiteSpace: 'nowrap'
                      }}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main status details blocks */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              
              {/* College Applications & Documents */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Applications block */}
                <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <FileText size={16} style={{ color: 'var(--primary)' }} /> College Applications
                  </h3>
                  {data.applications.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No active applications recorded.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {data.applications.map((app) => (
                        <div key={app.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--bg-main)', borderRadius: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <span style={{ fontSize: '13px', fontWeight: 600, display: 'block' }}>{app.course_title}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{app.university_name} ({app.university_country})</span>
                            </div>
                            <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
                          </div>
                          {app.interview_status && app.interview_status !== 'Not Required' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderTop: '1px dotted var(--border)', fontSize: '12px', marginTop: '4px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>Univ. Interview:</span>
                              <div style={{ textAlign: 'right' }}>
                                <span className={`badge badge-${app.interview_status.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                  {app.interview_status}
                                </span>
                                {app.interview_date && (
                                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    {new Date(app.interview_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Documents status verification check */}
                <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                    <CheckCircle size={16} style={{ color: 'var(--success)' }} /> Verification Checklist
                  </h3>
                  {data.documents.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No documents uploaded yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {data.documents.map((doc) => (
                        <div key={doc.id} style={{ display: 'flex', justify: 'space-between', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{doc.type}</span>
                          <span className={`badge badge-${doc.status.toLowerCase()}`} style={{ fontSize: '11px' }}>
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Visa Interview Block */}
                {data.visaRecord && (
                  <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--primary-light)' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--primary)' }}>
                      <Calendar size={16} /> Visa Process Details
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                      <div>Status: <strong>{data.visaRecord.status}</strong></div>
                      {data.visaRecord.interview_date && (
                        <div>Interview Date: <strong>{new Date(data.visaRecord.interview_date).toLocaleDateString()}</strong></div>
                      )}
                      {data.visaRecord.checklist && data.visaRecord.checklist.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <span style={{ fontSize: '11px', display: 'block', color: 'var(--text-muted)', marginBottom: '4px' }}>Completed Requirements:</span>
                          <ul style={{ paddingLeft: '16px', fontSize: '12px', color: '#1e293b' }}>
                            {data.visaRecord.checklist.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* Read-only Process Timeline */}
              <div style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <History size={16} style={{ color: 'var(--warning)' }} /> Milestone Timeline Logs
                </h3>
                <div className="timeline">
                  {data.processHistories.map((hist) => (
                    <div key={hist.id} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="timeline-content" style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                          <span>Event</span>
                          <span>{new Date(hist.created_at).toLocaleDateString()}</span>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '13px', display: 'block', marginTop: '2px' }}>
                          {hist.old_status ? (
                            <>{hist.old_status} &rarr; {hist.new_status}</>
                          ) : (
                            <>Initialized: {hist.new_status}</>
                          )}
                        </span>
                        {hist.notes && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{hist.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
