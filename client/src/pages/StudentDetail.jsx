import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Plus, 
  Calendar, 
  History, 
  Download, 
  Edit 
} from 'lucide-react';

const CHECKLIST_ITEMS = [
  'Valid Passport',
  'Official University Offer Letter',
  'Tuition Fee Payment Receipt',
  'Original Academic Certificates & Transcripts',
  'Financial Sufficiency Proofs (Bank Statements)',
  'Statement of Purpose (SOP)',
  'English Language Proficiency Test (IELTS/PTE)',
  'Medical Clearance Report'
];

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Main student state
  const [student, setStudent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [visaRecord, setVisaRecord] = useState(null);
  const [processHistories, setProcessHistories] = useState([]);
  
  // Loading & UI control
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  // Courses list for Application Modal
  const [coursesList, setCoursesList] = useState([]);

  // Forms state
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [passportNo, setPassportNo] = useState('');
  const [dob, setDob] = useState('');
  const [academicSummary, setAcademicSummary] = useState('');
  const [preferredCountry, setPreferredCountry] = useState('');
  const [preferredCourse, setPreferredCourse] = useState('');
  const [profileStatus, setProfileStatus] = useState('');

  // Application Modal state
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [appCourseId, setAppCourseId] = useState('');
  const [appStatus, setAppStatus] = useState('Applied');
  const [appAppliedDate, setAppAppliedDate] = useState('');
  const [appInterviewDate, setAppInterviewDate] = useState('');
  const [appInterviewStatus, setAppInterviewStatus] = useState('Not Required');

  // Document Upload state
  const [docType, setDocType] = useState('Passport');
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Visa Record Form state
  const [visaStatus, setVisaStatus] = useState('Pending');
  const [visaInterviewDate, setVisaInterviewDate] = useState('');
  const [visaChecklist, setVisaChecklist] = useState([]);

  useEffect(() => {
    fetchProfileDetail();
    fetchCoursesDropdown();
  }, [id]);

  const fetchProfileDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/students/${id}`);
      setStudent(data.student);
      setApplications(data.applications);
      setDocuments(data.documents);
      setProcessHistories(data.processHistories);
      
      // Load Visa fields
      if (data.visaRecord) {
        setVisaRecord(data.visaRecord);
        setVisaStatus(data.visaRecord.status);
        setVisaInterviewDate(data.visaRecord.interview_date || '');
        setVisaChecklist(data.visaRecord.checklist || []);
      } else {
        setVisaRecord(null);
        setVisaStatus('Pending');
        setVisaInterviewDate('');
        setVisaChecklist([]);
      }

      // Populate edit fields
      setPassportNo(data.student.passport_no || '');
      setDob(data.student.dob || '');
      setAcademicSummary(data.student.academic_summary || '');
      setPreferredCountry(data.student.preferred_country || '');
      setPreferredCourse(data.student.preferred_course || '');
      setProfileStatus(data.student.status);

    } catch (err) {
      setError(err.message || 'Failed to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesDropdown = async () => {
    try {
      const data = await api.get('/courses/all');
      setCoursesList(data.courses);
    } catch (err) {
      console.error('Failed to load courses selection.');
    }
  };

  // 1. Profile actions
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.put(`/students/${id}`, {
        passport_no: passportNo,
        dob: dob || null,
        academic_summary: academicSummary,
        preferred_country: preferredCountry,
        preferred_course: preferredCourse,
        status: profileStatus
      });
      setSuccess('Profile updated successfully.');
      setIsProfileEditing(false);
      fetchProfileDetail();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  // 2. Application actions
  const openAddAppModal = () => {
    setEditingApp(null);
    setAppCourseId('');
    setAppStatus('Applied');
    setAppAppliedDate(new Date().toISOString().slice(0, 10));
    setAppInterviewDate('');
    setAppInterviewStatus('Not Required');
    setIsAppModalOpen(true);
  };

  const openEditAppModal = (app) => {
    setEditingApp(app);
    setAppCourseId(app.course_id);
    setAppStatus(app.status);
    setAppAppliedDate(app.applied_date || '');
    setAppInterviewDate(app.interview_date || '');
    setAppInterviewStatus(app.interview_status || 'Not Required');
    setIsAppModalOpen(true);
  };

  const handleSaveApplication = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const payload = {
      student_id: id,
      course_id: appCourseId,
      status: appStatus,
      applied_date: appAppliedDate,
      interview_date: appInterviewDate || null,
      interview_status: appInterviewStatus
    };

    try {
      if (editingApp) {
        await api.put(`/applications/${editingApp.id}`, payload);
        setSuccess('Application updated successfully.');
      } else {
        await api.post('/applications', payload);
        setSuccess('Application registered successfully.');
      }
      setIsAppModalOpen(false);
      fetchProfileDetail();
    } catch (err) {
      setError(err.message || 'Failed to save application.');
    }
  };

  const handleDeleteApp = async (appId) => {
    if (!window.confirm('Are you sure you want to remove this application?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/applications/${appId}`);
      setSuccess('Application removed.');
      fetchProfileDetail();
    } catch (err) {
      setError(err.message || 'Failed to delete application.');
    }
  };

  // 3. Document actions
  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!docFile) return;
    setError('');
    setSuccess('');
    setUploadingDoc(true);

    const formData = new FormData();
    formData.append('student_id', id);
    formData.append('type', docType);
    formData.append('file', docFile);

    try {
      // Use native fetch to upload file (since api.request will stringify standard objects, we pass FormData directly)
      const token = api.getToken();
      const response = await fetch('http://localhost:5000/api/documents', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Upload failed.');

      setSuccess('Document uploaded successfully.');
      setDocFile(null);
      // Reset input element value
      e.target.reset();
      fetchProfileDetail();
    } catch (err) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleUpdateDocStatus = async (docId, newStatus) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/documents/${docId}`, { status: newStatus });
      setSuccess(`Document status updated to ${newStatus}.`);
      fetchProfileDetail();
    } catch (err) {
      setError(err.message || 'Failed to update document status.');
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/documents/${docId}`);
      setSuccess('Document deleted.');
      fetchProfileDetail();
    } catch (err) {
      setError(err.message || 'Failed to delete document.');
    }
  };

  // 4. Visa actions
  const handleToggleChecklist = (item) => {
    if (visaChecklist.includes(item)) {
      setVisaChecklist(visaChecklist.filter(i => i !== item));
    } else {
      setVisaChecklist([...visaChecklist, item]);
    }
  };

  const handleSaveVisaRecord = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/visa-records', {
        student_id: id,
        status: visaStatus,
        interview_date: visaInterviewDate || null,
        checklist: visaChecklist
      });
      setSuccess('Visa checklist and record saved successfully.');
      fetchProfileDetail();
    } catch (err) {
      setError(err.message || 'Failed to update visa record.');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading student command center profile...</div>;
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">{student?.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            ID: Student-{student?.id} &bull; Email: {student?.email || 'N/A'} &bull; Phone: {student?.phone || 'N/A'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/students')}>
            Back to Directory
          </button>
          <span className={`badge badge-${student?.status.toLowerCase().replace(' ', '-')}`} style={{ alignSelf: 'center', fontSize: '14px', padding: '6px 14px' }}>
            {student?.status}
          </span>
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Tabs Headers */}
      <div className="tabs-header">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Details
        </button>
        <button 
          className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          Applications ({applications.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents ({documents.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'visa' ? 'active' : ''}`}
          onClick={() => setActiveTab('visa')}
        >
          Visa Status
        </button>
        <button 
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline Logs ({processHistories.length})
        </button>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="card" style={{ minHeight: '360px' }}>
        
        {/* Tab 1: Profile Details */}
        {activeTab === 'profile' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Core Student Profile</h2>
              {!isProfileEditing && (
                <button className="btn btn-secondary btn-sm" onClick={() => setIsProfileEditing(true)}>
                  <Edit size={14} /> Edit Profile
                </button>
              )}
            </div>

            {isProfileEditing ? (
              <form onSubmit={handleSaveProfile}>
                <div className="grid grid-3">
                  <div className="form-group">
                    <label className="form-label">Passport Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={passportNo}
                      onChange={(e) => setPassportNo(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Student Status</label>
                    <select
                      className="form-control form-select"
                      value={profileStatus}
                      onChange={(e) => setProfileStatus(e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Lead">Lead</option>
                      <option value="Applied">Applied</option>
                      <option value="Offer Holder">Offer Holder</option>
                      <option value="Visa">Visa</option>
                      <option value="Enrolled">Enrolled</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferred Country</label>
                    <input
                      type="text"
                      className="form-control"
                      value={preferredCountry}
                      onChange={(e) => setPreferredCountry(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Preferred Course / Major</label>
                    <input
                      type="text"
                      className="form-control"
                      value={preferredCourse}
                      onChange={(e) => setPreferredCourse(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Summary</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={academicSummary}
                    onChange={(e) => setAcademicSummary(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsProfileEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-3" style={{ gap: '28px 24px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Passport Number</span>
                  <span style={{ fontWeight: 500, fontSize: '15px' }}>{student.passport_no || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Date of Birth</span>
                  <span style={{ fontWeight: 500, fontSize: '15px' }}>{student.dob || 'N/A'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Lead Conversion Source</span>
                  <span style={{ fontWeight: 500, fontSize: '15px' }}>{student.lead_name || 'Manual Creation'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Preferred Country</span>
                  <span style={{ fontWeight: 500, fontSize: '15px' }}>{student.preferred_country || 'N/A'}</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Preferred Course</span>
                  <span style={{ fontWeight: 500, fontSize: '15px' }}>{student.preferred_course || 'N/A'}</span>
                </div>
                <div style={{ gridColumn: 'span 3' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Academic Summary</span>
                  <p style={{ marginTop: '4px', fontSize: '14px', whiteSpace: 'pre-line', color: '#334155' }}>
                    {student.academic_summary || 'No academic summary uploaded.'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Created By (Partner)</span>
                  <span style={{ fontWeight: 500, fontSize: '15px' }}>{student.added_by_name || 'System / Admin'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Created At</span>
                  <span style={{ fontWeight: 500, fontSize: '15px' }}>{new Date(student.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Applications */}
        {activeTab === 'applications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>University Applications</h2>
              <button className="btn btn-primary btn-sm" onClick={openAddAppModal}>
                <Plus size={14} /> Add Application
              </button>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>University</th>
                    <th>Course Title</th>
                    <th>Duration</th>
                    <th>Applied Date</th>
                    <th>Interview</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                        No application files recorded for this student yet.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id}>
                        <td style={{ fontWeight: 500 }}>
                          {app.university_name} <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>({app.university_country})</span>
                        </td>
                        <td>{app.course_title}</td>
                        <td>{app.course_duration || 'N/A'}</td>
                        <td>{app.applied_date ? new Date(app.applied_date).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          {app.interview_status && app.interview_status !== 'Not Required' ? (
                            <div>
                              <span className={`badge badge-${app.interview_status.toLowerCase()}`}>
                                {app.interview_status}
                              </span>
                              {app.interview_date && (
                                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  {new Date(app.interview_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Not Required</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge badge-${app.status.toLowerCase()}`}>
                            {app.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEditAppModal(app)}>
                              <Edit size={12} />
                            </button>
                            {user?.role === 'admin' && (
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteApp(app.id)}>
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Documents */}
        {activeTab === 'documents' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Uploaded Documents</h2>
            
            {/* Upload form */}
            <form onSubmit={handleUploadDoc} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: '8px', marginBottom: '24px' }}>
              <div className="form-group" style={{ margin: 0, minWidth: '180px' }}>
                <label className="form-label">Document Type</label>
                <select 
                  className="form-control form-select"
                  value={docType} 
                  onChange={(e) => setDocType(e.target.value)}
                >
                  <option value="Passport">Passport</option>
                  <option value="Transcript">Transcript</option>
                  <option value="SOP">SOP</option>
                  <option value="CV">CV</option>
                  <option value="Recommendation Letter">Recommendation Letter</option>
                  <option value="Financial Document">Financial Document</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0, flex: 1, minWidth: '220px' }}>
                <label className="form-label">Select File (PDF, JPG, PNG)</label>
                <input 
                  type="file" 
                  className="form-control" 
                  accept=".pdf,image/*"
                  onChange={(e) => setDocFile(e.target.files[0])}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={uploadingDoc || !docFile}
                style={{ height: '42px' }}
              >
                <Upload size={14} /> {uploadingDoc ? 'Uploading...' : 'Upload'}
              </button>
            </form>

            {/* Documents List */}
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>File Path</th>
                    <th>Uploaded Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                        No files uploaded yet.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id}>
                        <td style={{ fontWeight: 500 }}>{doc.type}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                          {doc.file_path.split('/').pop()}
                        </td>
                        <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge badge-${doc.status.toLowerCase()}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <a 
                              href={`http://localhost:5000/api/documents/${doc.id}/download`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="btn btn-secondary btn-sm"
                              title="Download File"
                            >
                              <Download size={12} />
                            </a>
                            
                            {user?.role !== 'others' && (
                              <>
                                <button 
                                  className="btn btn-secondary btn-sm"
                                  style={{ color: 'var(--success)' }}
                                  onClick={() => handleUpdateDocStatus(doc.id, 'Verified')}
                                >
                                  Verify
                                </button>
                                <button 
                                  className="btn btn-secondary btn-sm"
                                  style={{ color: 'var(--danger)' }}
                                  onClick={() => handleUpdateDocStatus(doc.id, 'Rejected')}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {user?.role === 'admin' && (
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDoc(doc.id)}>
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Visa Status */}
        {activeTab === 'visa' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Visa Processing Control</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
              Track documents, schedule interview dates, and monitor approval status.
            </p>

            <form onSubmit={handleSaveVisaRecord}>
              <div className="grid grid-3" style={{ marginBottom: '28px' }}>
                <div className="form-group">
                  <label className="form-label">Visa Status</label>
                  <select 
                    className="form-control form-select"
                    value={visaStatus}
                    onChange={(e) => setVisaStatus(e.target.value)}
                  >
                    <option value="Pending">Pending / In Progress</option>
                    <option value="Visa Granted">Visa Granted</option>
                    <option value="Visa Refused">Visa Refused</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Visa Interview Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={visaInterviewDate}
                    onChange={(e) => setVisaInterviewDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Checklist */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '14px' }}>Document Checklist</h3>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                  {CHECKLIST_ITEMS.map((item, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', background: visaChecklist.includes(item) ? '#f0fdf4' : 'transparent', transition: 'all 0.15s' }}>
                      <input 
                        type="checkbox" 
                        style={{ marginTop: '2px' }}
                        checked={visaChecklist.includes(item)}
                        onChange={() => handleToggleChecklist(item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">
                  Save Visa Progress
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 5: Timeline Logs */}
        {activeTab === 'timeline' && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Process Milestone Logs</h2>
            <div className="timeline">
              {processHistories.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                  No timeline history logged.
                </div>
              ) : (
                processHistories.map((hist) => (
                  <div key={hist.id} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-meta">
                        <span>Changed by: <strong>{hist.changed_by_name || 'System'}</strong></span>
                        <span>{new Date(hist.created_at).toLocaleString()}</span>
                      </div>
                      <div className="timeline-title">
                        {hist.old_status ? (
                          <>
                            Status updated: <span className="badge badge-secondary" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>{hist.old_status}</span> &rarr; <span className={`badge badge-${hist.new_status.toLowerCase().replace(' ', '-')}`}>{hist.new_status}</span>
                          </>
                        ) : (
                          <>
                            Status initialized: <span className={`badge badge-${hist.new_status.toLowerCase().replace(' ', '-')}`}>{hist.new_status}</span>
                          </>
                        )}
                      </div>
                      {hist.notes && <div className="timeline-notes">Note: {hist.notes}</div>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* APPLICATION ADD / EDIT DIALOG */}
      {isAppModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
                {editingApp ? 'Edit Course Application' : 'Register New Course Application'}
              </h2>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                onClick={() => setIsAppModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveApplication}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Academic Course</label>
                  <select 
                    className="form-control form-select"
                    value={appCourseId}
                    onChange={(e) => setAppCourseId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Course --</option>
                    {coursesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} - {c.university_name} ({c.duration})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Application Status</label>
                  <select 
                    className="form-control form-select"
                    value={appStatus}
                    onChange={(e) => setAppStatus(e.target.value)}
                    required
                  >
                    <option value="Applied">Applied</option>
                    <option value="Offer">Offer Received</option>
                    <option value="Accepted">Accepted / Enrolled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Applied Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={appAppliedDate}
                    onChange={(e) => setAppAppliedDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">University Interview Status</label>
                  <select 
                    className="form-control form-select"
                    value={appInterviewStatus}
                    onChange={(e) => setAppInterviewStatus(e.target.value)}
                    required
                  >
                    <option value="Not Required">Not Required</option>
                    <option value="Pending">Pending</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Passed">Passed</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">University Interview Date</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={appInterviewDate}
                    onChange={(e) => setAppInterviewDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAppModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingApp ? 'Save Application' : 'Record Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
