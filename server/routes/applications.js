import express from 'express';
import { query, queryOne, execute } from '../db.js';
import { authenticateToken, canManageRelated, canDeleteRecord } from '../authMiddleware.js';

const router = express.Router();

// GET /api/applications - List all applications with related info
router.get('/', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  try {
    let sql = `
      SELECT a.*, s.name as student_name, s.email as student_email, c.title as course_title, u.name as university_name, ab.name as added_by_name
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN courses c ON a.course_id = c.id
      JOIN universities u ON c.university_id = u.id
      LEFT JOIN users ab ON s.added_by = ab.id
    `;
    let countSql = 'SELECT COUNT(*) as count FROM applications a JOIN students s ON a.student_id = s.id JOIN courses c ON a.course_id = c.id JOIN universities u ON c.university_id = u.id';
    const params = [];
    const countParams = [];
    const conditions = [];

    // Filter by ownership if user is "others"
    if (req.user.role === 'others') {
      conditions.push('s.added_by = ?');
      params.push(req.user.id);
      countParams.push(req.user.id);
    }

    if (search) {
      conditions.push('(s.name LIKE ? OR c.title LIKE ? OR u.name LIKE ?)');
      const wild = `%${search}%`;
      params.push(wild, wild, wild);
      countParams.push(wild, wild, wild);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
      countSql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const applications = await query(sql, params);
    const [countRes] = await query(countSql, countParams);
    const total = countRes.count;

    return res.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve applications.' });
  }
});

// POST /api/applications - Create a student application
router.post('/', authenticateToken, canManageRelated, async (req, res) => {
  const { student_id, course_id, status, applied_date, interview_date, interview_status } = req.body;

  if (!student_id || !course_id || !status || !applied_date) {
    return res.status(400).json({ error: 'student_id, course_id, status, and applied_date are required fields.' });
  }

  const user = req.user;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    // Check if student exists
    const student = await queryOne('SELECT * FROM students WHERE id = ?', [student_id]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Check if course exists
    const course = await queryOne('SELECT * FROM courses WHERE id = ?', [course_id]);
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    // Insert Application
    const result = await execute(`
      INSERT INTO applications (student_id, course_id, status, applied_date, interview_date, interview_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [student_id, course_id, status, applied_date, interview_date || null, interview_status || 'Not Required', now, now]);

    const appId = result.lastID;

    // Log Application Status
    await execute(`
      INSERT INTO process_histories (student_id, application_id, new_status, changed_by, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'New application recorded.', ?, ?)
    `, [student_id, appId, status, user.id, now, now]);

    // Sync Student Status if student is 'Active'
    if (student.status === 'Active') {
      await execute('UPDATE students SET status = ?, updated_at = ? WHERE id = ?', ['Applied', now, student_id]);

      await execute(`
        INSERT INTO process_histories (student_id, old_status, new_status, changed_by, notes, created_at, updated_at)
        VALUES (?, 'Active', 'Applied', ?, 'Student status synced with application.', ?, ?)
      `, [student_id, user.id, now, now]);
    }

    return res.status(201).json({
      message: 'Application recorded successfully.',
      applicationId: appId
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create application.' });
  }
});

// GET /api/applications/:id - Single application detail
router.get('/:id', authenticateToken, canManageRelated, async (req, res) => {
  const { id } = req.params;
  try {
    const application = await queryOne(`
      SELECT a.*, s.name as student_name, c.title as course_title, u.name as university_name
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN courses c ON a.course_id = c.id
      JOIN universities u ON c.university_id = u.id
      WHERE a.id = ?
    `, [id]);

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    return res.json({ application });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve application details.' });
  }
});

// PUT /api/applications/:id - Update application status/details
router.put('/:id', authenticateToken, canManageRelated, async (req, res) => {
  const { id } = req.params;
  const { course_id, status, applied_date, interview_date, interview_status } = req.body;

  if (!course_id || !status || !applied_date) {
    return res.status(400).json({ error: 'course_id, status, and applied_date are required.' });
  }

  const user = req.user;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    const app = await queryOne('SELECT * FROM applications WHERE id = ?', [id]);
    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const student = await queryOne('SELECT status FROM students WHERE id = ?', [app.student_id]);
    if (!student) {
      return res.status(404).json({ error: 'Student associated with this application not found.' });
    }

    const oldStatus = app.status;

    await execute(`
      UPDATE applications
      SET course_id = ?, status = ?, applied_date = ?, interview_date = ?, interview_status = ?, updated_at = ?
      WHERE id = ?
    `, [course_id, status, applied_date, interview_date || null, interview_status || 'Not Required', now, id]);

    if (oldStatus !== status) {
      // Log Application status change
      await execute(`
        INSERT INTO process_histories (student_id, application_id, old_status, new_status, changed_by, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'Application status updated.', ?, ?)
      `, [app.student_id, id, oldStatus, status, user.id, now, now]);

      // Sync Student Status based on application status milestones
      let newStudentStatus = null;
      if (status === 'Offer') {
        newStudentStatus = 'Offer Holder';
      } else if (status === 'Accepted') {
        newStudentStatus = 'Enrolled';
      }

      if (newStudentStatus && student.status !== newStudentStatus) {
        await execute('UPDATE students SET status = ?, updated_at = ? WHERE id = ?', [newStudentStatus, now, app.student_id]);

        await execute(`
          INSERT INTO process_histories (student_id, old_status, new_status, changed_by, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'Student status synced with application update.', ?, ?)
        `, [app.student_id, student.status, newStudentStatus, user.id, now, now]);
      }
    }

    return res.json({ message: 'Application updated successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update application.' });
  }
});

// DELETE /api/applications/:id - Delete application (Admin only)
router.delete('/:id', authenticateToken, canDeleteRecord, async (req, res) => {
  const { id } = req.params;
  try {
    const app = await queryOne('SELECT student_id FROM applications WHERE id = ?', [id]);
    if (!app) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    await execute('DELETE FROM applications WHERE id = ?', [id]);
    return res.json({ message: 'Application removed successfully.', studentId: app.student_id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete application.' });
  }
});

export default router;
