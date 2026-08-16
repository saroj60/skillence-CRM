import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

export default function Courses() {
  const { isAdmin } = useAuth();

  // State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pagination & Search
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Dropdown list for Universities
  const [unisList, setUnisList] = useState([]);

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  
  const [universityId, setUniversityId] = useState('');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [requirements, setRequirements] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [page]);

  useEffect(() => {
    async function fetchUnisDropdown() {
      try {
        const data = await api.get('/universities/all');
        setUnisList(data.universities);
      } catch (err) {
        console.error('Failed to load universities dropdown selection list.');
      }
    }
    fetchUnisDropdown();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/courses?page=${page}&search=${encodeURIComponent(search)}`);
      setCourses(data.courses);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      setError(err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setUniversityId('');
    setTitle('');
    setDuration('');
    setRequirements('');
    setDeadline('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setUniversityId(course.university_id);
    setTitle(course.title);
    setDuration(course.duration || '');
    setRequirements(course.requirements || '');
    setDeadline(course.deadline || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      university_id: universityId,
      title,
      duration,
      requirements,
      deadline
    };

    try {
      if (editingCourse) {
        await api.put(`/courses/${editingCourse.id}`, payload);
        setSuccess('Course updated successfully.');
      } else {
        await api.post('/courses', payload);
        setSuccess('Course added successfully.');
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      setError(err.message || 'Failed to save course.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? All active student applications for this course will be deleted.')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/courses/${id}`);
      setSuccess('Course deleted.');
      fetchCourses();
    } catch (err) {
      setError(err.message || 'Failed to delete course.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Academic Courses ({total})</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Course
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
          placeholder="Search by title, university..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-secondary">
          <Search size={16} /> Search
        </button>
      </form>

      {/* Table of courses */}
      <div className="table-card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading course register...
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>University</th>
                  <th>Country</th>
                  <th>Duration</th>
                  <th>Deadline</th>
                  <th>Requirements Summary</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No courses found.
                    </td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id}>
                      <td style={{ fontWeight: 600 }}>{course.title}</td>
                      <td>{course.university_name}</td>
                      <td>{course.university_country}</td>
                      <td>{course.duration || 'N/A'}</td>
                      <td>{course.deadline || 'N/A'}</td>
                      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: 'var(--text-muted)' }}>
                        {course.requirements || 'N/A'}
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(course)}>
                              <Edit2 size={12} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(course.id)}>
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

      {/* ADD/EDIT COURSE DIALOG */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
                {editingCourse ? 'Edit Course metadata' : 'Register New Academic Course'}
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
                  <label className="form-label">Affiliated University</label>
                  <select
                    className="form-control form-select"
                    value={universityId}
                    onChange={(e) => setUniversityId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose University --</option>
                    {unisList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.country})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Course Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Master of Data Science"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 2 Years, 18 Months"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Application Deadline</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 15 Jan, 30 Oct"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Entry Requirements Summary</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="e.g. IELTS 6.5 minimum, Bachelor degree in STEM fields..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
