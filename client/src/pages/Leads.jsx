import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Search, Edit2, Trash2, ArrowRight } from 'lucide-react';

export default function Leads() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination & Search
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Users for Assignment Dropdowns
  const [staffList, setStaffList] = useState([]);
  const [partnersList, setPartnersList] = useState([]);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('New');
  const [assignedTo, setAssignedTo] = useState('');
  const [addedBy, setAddedBy] = useState('');

  // Conversion Fields
  const [passportNo, setPassportNo] = useState('');
  const [dob, setDob] = useState('');
  const [academicSummary, setAcademicSummary] = useState('');
  const [preferredCountry, setPreferredCountry] = useState('');
  const [preferredCourse, setPreferredCourse] = useState('');

  // Fetch leads on mount / search / page change
  useEffect(() => {
    fetchLeads();
  }, [page, searchParams]);

  // Fetch assignees dropdown lists
  useEffect(() => {
    async function fetchAssignees() {
      try {
        const data = await api.get('/users/assignees');
        setStaffList(data.staff);
        setPartnersList(data.partners);
      } catch (err) {
        console.error('Failed to load assignees list.');
      }
    }
    fetchAssignees();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const q = searchParams.get('search') || '';
      const data = await api.get(`/leads?page=${page}&search=${encodeURIComponent(q)}`);
      setLeads(data.leads);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err.message || 'Failed to load leads list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(search ? { search } : {});
    setPage(1);
  };

  const openAddForm = () => {
    setEditingLead(null);
    setName('');
    setPhone('');
    setEmail('');
    setSource('');
    setStatus('New');
    setAssignedTo('');
    setAddedBy('');
    setIsFormOpen(true);
  };

  const openEditForm = (lead) => {
    setEditingLead(lead);
    setName(lead.name);
    setPhone(lead.phone || '');
    setEmail(lead.email || '');
    setSource(lead.source || '');
    setStatus(lead.status);
    setAssignedTo(lead.assigned_to || '');
    setAddedBy(lead.added_by || '');
    setIsFormOpen(true);
  };

  const handleSaveLead = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name,
      phone,
      email,
      source,
      status,
      assigned_to: assignedTo || null,
      added_by: addedBy || null
    };

    try {
      if (editingLead) {
        await api.put(`/leads/${editingLead.id}`, payload);
        setSuccess('Lead updated successfully.');
      } else {
        await api.post('/leads', payload);
        setSuccess('Lead created successfully.');
      }
      setIsFormOpen(false);
      fetchLeads();
    } catch (err) {
      setError(err.message || 'Failed to save lead.');
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/leads/${id}`);
      setSuccess('Lead deleted successfully.');
      fetchLeads();
    } catch (err) {
      setError(err.message || 'Failed to delete lead.');
    }
  };

  const openConvertModal = (lead) => {
    setConvertingLead(lead);
    setPassportNo('');
    setDob('');
    setAcademicSummary('');
    setPreferredCountry('');
    setPreferredCourse('');
    setIsConvertOpen(true);
  };

  const handleConvertLead = async (e) => {
    e.preventDefault();
    setError('');
    
    const payload = {
      lead_id: convertingLead.id,
      passport_no: passportNo,
      dob: dob || null,
      academic_summary: academicSummary,
      preferred_country: preferredCountry,
      preferred_course: preferredCourse
    };

    try {
      const data = await api.post('/students/convert', payload);
      setIsConvertOpen(false);
      navigate(`/students/${data.studentId}`);
    } catch (err) {
      setError(err.message || 'Failed to convert lead.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Leads List ({total})</h1>
        <button className="btn btn-primary" onClick={openAddForm}>
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Search form */}
      <form onSubmit={handleSearchSubmit} className="search-container">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">
          <Search size={16} /> Search
        </button>
      </form>

      {/* Grid List Table */}
      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading leads list...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Added By</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id}>
                      <td style={{ fontWeight: 600 }}>{lead.name}</td>
                      <td>{lead.phone || 'N/A'}</td>
                      <td>{lead.email || 'N/A'}</td>
                      <td>{lead.source || 'Direct'}</td>
                      <td>
                        <span className={`badge badge-${lead.status.toLowerCase()}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td>{lead.assigned_to_name || 'Unassigned'}</td>
                      <td>{lead.added_by_name || 'System'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          {lead.status !== 'Converted' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openConvertModal(lead)}
                              title="Convert to Student"
                            >
                              <ArrowRight size={14} /> Convert
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openEditForm(lead)}
                          >
                            <Edit2 size={14} />
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteLead(lead.id)}
                            >
                              <Trash2 size={14} />
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
        )}

        {/* Pagination bar */}
        {!loading && totalPages > 1 && (
          <div className="pagination-container">
            <span className="pagination-stats">
              Page {page} of {totalPages}
            </span>
            <div className="pagination-btns">
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LEAD ADD / EDIT MODAL */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
                {editingLead ? 'Edit Lead Profile' : 'Add New Lead'}
              </h2>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                onClick={() => setIsFormOpen(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveLead}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Source</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Facebook, Reference"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control form-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Converted">Converted</option>
                  </select>
                </div>
                {user?.role !== 'others' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Assign To Staff</label>
                      <select
                        className="form-control form-select"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                      >
                        <option value="">Select Staff</option>
                        {staffList.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Partner / Creator</label>
                      <select
                        className="form-control form-select"
                        value={addedBy}
                        onChange={(e) => setAddedBy(e.target.value)}
                      >
                        <option value="">Select Partner (Optional)</option>
                        {partnersList.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingLead ? 'Update Lead' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAD CONVERT TO STUDENT MODAL */}
      {isConvertOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
                Convert Lead: {convertingLead?.name} to Student
              </h2>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                onClick={() => setIsConvertOpen(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleConvertLead}>
              <div className="modal-body">
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
                  Please fill in the profile information below to create the student profile record. Basic details (Name, Phone, Email) will be transferred automatically.
                </p>
                <div className="form-group">
                  <label className="form-label">Passport Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. N1234567"
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
                  <label className="form-label">Academic Summary</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Provide a summary of qualifications..."
                    value={academicSummary}
                    onChange={(e) => setAcademicSummary(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Country</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Australia, Canada"
                    value={preferredCountry}
                    onChange={(e) => setPreferredCountry(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Course / Major</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Master of Computer Science"
                    value={preferredCourse}
                    onChange={(e) => setPreferredCourse(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsConvertOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Student Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
