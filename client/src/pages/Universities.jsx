import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Search, Edit2, Trash2, Globe, BookOpen } from 'lucide-react';

export default function Universities() {
  const { isAdmin } = useAuth();
  
  // State
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filtering & Pagination
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // University Detail (for courses view overlay/inline)
  const [expandedUni, setExpandedUni] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUni, setEditingUni] = useState(null);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    fetchUniversities();
  }, [page]);

  const fetchUniversities = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/universities?page=${page}&search=${encodeURIComponent(search)}`);
      setUniversities(data.universities);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err.message || 'Failed to load universities.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUniversities();
  };

  const handleOpenAdd = () => {
    setEditingUni(null);
    setName('');
    setCountry('');
    setWebsite('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (uni) => {
    setEditingUni(uni);
    setName(uni.name);
    setCountry(uni.country);
    setWebsite(uni.website || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = { name, country, website };
    try {
      if (editingUni) {
        await api.put(`/universities/${editingUni.id}`, payload);
        setSuccess('University updated successfully.');
      } else {
        await api.post('/universities', payload);
        setSuccess('University added successfully.');
      }
      setIsModalOpen(false);
      fetchUniversities();
    } catch (err) {
      setError(err.message || 'Failed to save university.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this university? All courses associated with it will also be deleted.')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/universities/${id}`);
      setSuccess('University deleted.');
      fetchUniversities();
      if (expandedUni?.id === id) setExpandedUni(null);
    } catch (err) {
      setError(err.message || 'Failed to delete university.');
    }
  };

  const handleToggleExpand = async (uni) => {
    if (expandedUni?.id === uni.id) {
      setExpandedUni(null);
      setExpandedCourses([]);
      return;
    }

    setExpandedUni(uni);
    setCoursesLoading(true);
    try {
      const data = await api.get(`/universities/${uni.id}`);
      setExpandedCourses(data.courses);
    } catch (err) {
      console.error('Failed to load courses.');
    } finally {
      setCoursesLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Universities Register ({total})</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add University
          </button>
        )}
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="search-container">
        <input
          type="text"
          className="form-control search-input"
          placeholder="Search by name, country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">
          <Search size={16} /> Search
        </button>
      </form>

      {/* Main Grid: left table, right sidebar course view */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Table of universities */}
        <div className="table-card" style={{ flex: 1 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading universities list...
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Country</th>
                    <th>Courses Count</th>
                    <th>Website</th>
                    {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {universities.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No universities found.
                      </td>
                    </tr>
                  ) : (
                    universities.map((uni) => (
                      <tr 
                        key={uni.id} 
                        style={{ cursor: 'pointer', background: expandedUni?.id === uni.id ? '#f8fafc' : 'transparent' }}
                        onClick={() => handleToggleExpand(uni)}
                      >
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{uni.name}</td>
                        <td>{uni.country}</td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <BookOpen size={14} style={{ color: 'var(--text-muted)' }} />
                            {uni.courses_count} courses
                          </span>
                        </td>
                        <td>
                          {uni.website ? (
                            <a 
                              href={uni.website} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--text-muted)' }}
                              onClick={(e) => e.stopPropagation()} // don't expand row
                            >
                              <Globe size={14} /> Link
                            </a>
                          ) : 'N/A'}
                        </td>
                        {isAdmin && (
                          <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(uni)}>
                                <Edit2 size={12} />
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(uni.id)}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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

        {/* Right side course display panel */}
        {expandedUni && (
          <div className="card" style={{ width: '380px', flexShrink: 0, position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600 }}>{expandedUni.name}</h2>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => { setExpandedUni(null); setExpandedCourses([]); }}
                style={{ padding: '2px 8px' }}
              >
                Close
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
              Courses offered at this institution:
            </p>

            {coursesLoading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Loading course list...
              </div>
            ) : expandedCourses.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No courses offered at this university yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '450px', overflowY: 'auto' }}>
                {expandedCourses.map((c) => (
                  <div 
                    key={c.id} 
                    style={{ padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)' }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '14px', display: 'block', color: 'var(--text-main)' }}>
                      {c.title}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>Duration: {c.duration || 'N/A'}</span>
                      <span>Deadline: {c.deadline || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* UNIVERSITIES ADD/EDIT DIALOG */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
                {editingUni ? 'Edit University details' : 'Register New University'}
              </h2>
              <button 
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">University Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-control"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Official Website URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.edu"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUni ? 'Update University' : 'Create Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
