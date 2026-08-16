import express from 'express';
import { query, queryOne, execute } from '../db.js';
import { authenticateToken, canManageStudent, canDeleteRecord } from '../authMiddleware.js';

const router = express.Router();

// GET /api/students - Paginated & searchable listing
router.get('/', authenticateToken, async (req, res) => {
  const user = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const statusFilter = req.query.status || '';

  try {
    let sql = `
      SELECT s.*, l.name as lead_name, ab.name as added_by_name 
      FROM students s 
      LEFT JOIN leads l ON s.lead_id = l.id
      LEFT JOIN users ab ON s.added_by = ab.id
    `;
    let countSql = 'SELECT COUNT(*) as count FROM students s';
    const params = [];
    const countParams = [];
    const conditions = [];

    if (user.role === 'others') {
      conditions.push('s.added_by = ?');
      params.push(user.id);
      countParams.push(user.id);
    }

    if (statusFilter) {
      conditions.push('s.status = ?');
      params.push(statusFilter);
      countParams.push(statusFilter);
    }

    if (search) {
      conditions.push('(s.name LIKE ? OR s.phone LIKE ? OR s.email LIKE ? OR s.passport_no LIKE ? OR s.preferred_country LIKE ?)');
      const wild = `%${search}%`;
      params.push(wild, wild, wild, wild, wild);
      countParams.push(wild, wild, wild, wild, wild);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
      countSql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const students = await query(sql, params);
    const [countRes] = await query(countSql, countParams);
    const total = countRes.count;

    return res.json({
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve students.' });
  }
});

// POST /api/students/convert - Convert Lead to Student
router.post('/convert', authenticateToken, async (req, res) => {
  const { lead_id, passport_no, dob, academic_summary, preferred_country, preferred_course } = req.body;

  if (!lead_id) {
    return res.status(400).json({ error: 'lead_id is required.' });
  }

  const user = req.user;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    // 1. Fetch Lead details
    const lead = await queryOne('SELECT * FROM leads WHERE id = ?', [lead_id]);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    // Role check for external users
    if (user.role === 'others' && lead.added_by !== user.id) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this lead.' });
    }

    const finalAddedBy = lead.added_by || user.id;

    // 2. Insert Student
    const studentResult = await execute(`
      INSERT INTO students (lead_id, name, email, phone, passport_no, dob, academic_summary, preferred_country, preferred_course, status, added_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?)
    `, [
      lead_id,
      lead.name,
      lead.email || null,
      lead.phone || null,
      passport_no || null,
      dob || null,
      academic_summary || null,
      preferred_country || null,
      preferred_course || null,
      finalAddedBy,
      now,
      now
    ]);

    const studentId = studentResult.lastID;

    // 3. Log initial status history
    await execute(`
      INSERT INTO process_histories (student_id, new_status, changed_by, notes, created_at, updated_at)
      VALUES (?, 'Active', ?, 'Initial profile creation via lead conversion.', ?, ?)
    `, [studentId, user.id, now, now]);

    // 4. Update Lead status to Converted
    await execute('UPDATE leads SET status = ?, updated_at = ? WHERE id = ?', ['Converted', now, lead_id]);

    return res.status(201).json({
      message: 'Lead converted to Student successfully.',
      studentId
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to convert lead to student.' });
  }
});

// GET /api/students/:id - Detailed student profile including all relations
router.get('/:id', authenticateToken, canManageStudent, async (req, res) => {
  const { id } = req.params;

  try {
    const student = await queryOne(`
      SELECT s.*, l.name as lead_name, ab.name as added_by_name
      FROM students s
      LEFT JOIN leads l ON s.lead_id = l.id
      LEFT JOIN users ab ON s.added_by = ab.id
      WHERE s.id = ?
    `, [id]);

    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    // Load Applications
    const applications = await query(`
      SELECT a.*, c.title as course_title, c.duration as course_duration, u.name as university_name, u.country as university_country
      FROM applications a
      JOIN courses c ON a.course_id = c.id
      JOIN universities u ON c.university_id = u.id
      WHERE a.student_id = ?
      ORDER BY a.created_at DESC
    `, [id]);

    // Load Documents
    const documents = await query('SELECT * FROM documents WHERE student_id = ? ORDER BY created_at DESC', [id]);

    // Load Visa Record
    const visaRecord = await queryOne('SELECT * FROM visa_records WHERE student_id = ?', [id]);
    if (visaRecord && visaRecord.checklist) {
      try {
        visaRecord.checklist = JSON.parse(visaRecord.checklist);
      } catch (err) {
        // Keep as string if parsing fails
      }
    }

    // Load Process History / Timeline
    const processHistories = await query(`
      SELECT ph.*, u.name as changed_by_name
      FROM process_histories ph
      LEFT JOIN users u ON ph.changed_by = u.id
      WHERE ph.student_id = ?
      ORDER BY ph.created_at DESC
    `, [id]);

    return res.json({
      student,
      applications,
      documents,
      visaRecord: visaRecord || null,
      processHistories
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve student profile detail.' });
  }
});

// PUT /api/students/:id - Update student profile
router.put('/:id', authenticateToken, canManageStudent, async (req, res) => {
  const { id } = req.params;
  const { passport_no, dob, academic_summary, preferred_country, preferred_course, status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  const user = req.user;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    // Check old status for process history logging
    const oldStudent = await queryOne('SELECT status FROM students WHERE id = ?', [id]);
    if (!oldStudent) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    await execute(`
      UPDATE students 
      SET passport_no = ?, dob = ?, academic_summary = ?, preferred_country = ?, preferred_course = ?, status = ?, updated_at = ?
      WHERE id = ?
    `, [
      passport_no || null,
      dob || null,
      academic_summary || null,
      preferred_country || null,
      preferred_course || null,
      status,
      now,
      id
    ]);

    // Log status change if status updated
    if (oldStudent.status !== status) {
      await execute(`
        INSERT INTO process_histories (student_id, old_status, new_status, changed_by, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'Status manually updated via profile edit.', ?, ?)
      `, [id, oldStudent.status, status, user.id, now, now]);
    }

    return res.json({ message: 'Student profile updated successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update student profile.' });
  }
});

// DELETE /api/students/:id - Delete student (Admin only)
router.delete('/:id', authenticateToken, canDeleteRecord, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await execute('DELETE FROM students WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    return res.json({ message: 'Student profile deleted successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete student.' });
  }
});

// POST /api/students/track - Public tracking endpoint
router.post('/track', async (req, res) => {
  const { passport_no, dob } = req.body;

  if (!passport_no || !dob) {
    return res.status(400).json({ error: 'Passport Number and Date of Birth are required.' });
  }

  try {
    // Look up student by passport and dob
    const student = await queryOne('SELECT * FROM students WHERE UPPER(passport_no) = UPPER(?) AND dob = ?', [passport_no.trim(), dob]);

    if (!student) {
      return res.status(404).json({ error: 'No matching student record found. Please verify details.' });
    }

    const id = student.id;

    // Load Applications
    const applications = await query(`
      SELECT a.*, c.title as course_title, c.duration as course_duration, u.name as university_name, u.country as university_country
      FROM applications a
      JOIN courses c ON a.course_id = c.id
      JOIN universities u ON c.university_id = u.id
      WHERE a.student_id = ?
      ORDER BY a.created_at DESC
    `, [id]);

    // Load Documents
    const documents = await query('SELECT id, type, status, created_at FROM documents WHERE student_id = ? ORDER BY created_at DESC', [id]);

    // Load Visa Record
    const visaRecord = await queryOne('SELECT * FROM visa_records WHERE student_id = ?', [id]);
    if (visaRecord && visaRecord.checklist) {
      try {
        visaRecord.checklist = JSON.parse(visaRecord.checklist);
      } catch (err) {
        // keep as is
      }
    }

    // Load Process History / Timeline
    const processHistories = await query(`
      SELECT ph.id, ph.old_status, ph.new_status, ph.notes, ph.created_at
      FROM process_histories ph
      WHERE ph.student_id = ?
      ORDER BY ph.created_at DESC
    `, [id]);

    return res.json({
      student: {
        id: student.id,
        name: student.name,
        preferred_country: student.preferred_country,
        preferred_course: student.preferred_course,
        status: student.status
      },
      applications,
      documents,
      visaRecord: visaRecord || null,
      processHistories
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error processing tracking inquiry.' });
  }
});

export default router;
