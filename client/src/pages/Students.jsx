import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Search, Eye, Trash2 } from 'lucide-react';

export default function Students() {
  const { user } = useAuth();
  
  // State
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filtering & Pagination
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchStudents();
  }, [page, status]);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/students?page=${page}&status=${status}&search=${encodeURIComponent(search)}`);
      setStudents(data.students);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student record? This will remove all associated documents, applications, and logs.')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/students/${id}`);
      setSuccess('Student profile deleted successfully.');
      fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to delete student.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Students Directory ({total})</h1>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} className="search-container" style={{ margin: 0 }}>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search by name, passport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            <Search size={16} /> Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label className="form-label" style={{ margin: 0 }}>Status:</label>
          <select
            className="form-control form-select"
            style={{ width: '160px' }}
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Lead">Lead</option>
            <option value="Applied">Applied</option>
            <option value="Offer Holder">Offer Holder</option>
            <option value="Visa">Visa</option>
            <option value="Enrolled">Enrolled</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading students directory...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Passport</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Preferred Country</th>
                  <th>Preferred Course</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No student records found.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id}>
                      <td style={{ fontWeight: 600 }}>{student.name}</td>
                      <td>{student.passport_no || 'N/A'}</td>
                      <td>{student.phone || 'N/A'}</td>
                      <td>{student.email || 'N/A'}</td>
                      <td>{student.preferred_country || 'N/A'}</td>
                      <td>{student.preferred_course || 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${student.status.toLowerCase().replace(' ', '-')}`}>
                          {student.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <Link
                            to={`/students/${student.id}`}
                            className="btn btn-secondary btn-sm"
                            title="View Student profile command center"
                          >
                            <Eye size={14} /> Profile
                          </Link>
                          {user?.role === 'admin' && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(student.id)}
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
    </div>
  );
}
