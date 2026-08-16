import express from 'express';
import { query, queryOne, execute } from '../db.js';
import { authenticateToken, isAdmin } from '../authMiddleware.js';

const router = express.Router();

// GET /api/courses - List courses with university association
router.get('/', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  try {
    let sql = `
      SELECT c.*, u.name as university_name, u.country as university_country
      FROM courses c
      JOIN universities u ON c.university_id = u.id
    `;
    let countSql = 'SELECT COUNT(*) as count FROM courses c JOIN universities u ON c.university_id = u.id';
    const params = [];
    const countParams = [];
    const conditions = [];

    if (search) {
      conditions.push('(c.title LIKE ? OR c.requirements LIKE ? OR u.name LIKE ? OR u.country LIKE ?)');
      const wild = `%${search}%`;
      params.push(wild, wild, wild, wild);
      countParams.push(wild, wild, wild, wild);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
      countSql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const courses = await query(sql, params);
    const [countRes] = await query(countSql, countParams);
    const total = countRes.count;

    return res.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve courses.' });
  }
});

// GET /api/courses/all - Simple list of all courses for selection dropdowns
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const courses = await query(`
      SELECT c.id, c.title, c.duration, u.name as university_name 
      FROM courses c 
      JOIN universities u ON c.university_id = u.id 
      ORDER BY c.title ASC
    `);
    return res.json({ courses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve courses selection list.' });
  }
});

// GET /api/courses/:id - Single course details
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const course = await queryOne(`
      SELECT c.*, u.name as university_name, u.country as university_country
      FROM courses c
      JOIN universities u ON c.university_id = u.id
      WHERE c.id = ?
    `, [id]);

    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    return res.json({ course });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve course.' });
  }
});

// POST /api/courses - Create course (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { university_id, title, duration, requirements, deadline } = req.body;

  if (!university_id || !title) {
    return res.status(400).json({ error: 'University and Course Title are required fields.' });
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    const result = await execute(`
      INSERT INTO courses (university_id, title, duration, requirements, deadline, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [university_id, title, duration || null, requirements || null, deadline || null, now, now]);

    return res.status(201).json({
      message: 'Course created successfully.',
      courseId: result.lastID
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create course.' });
  }
});

// PUT /api/courses/:id - Update course (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { university_id, title, duration, requirements, deadline } = req.body;

  if (!university_id || !title) {
    return res.status(400).json({ error: 'University and Course Title are required.' });
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    const result = await execute(`
      UPDATE courses
      SET university_id = ?, title = ?, duration = ?, requirements = ?, deadline = ?, updated_at = ?
      WHERE id = ?
    `, [university_id, title, duration || null, requirements || null, deadline || null, now, id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    return res.json({ message: 'Course updated successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update course.' });
  }
});

// DELETE /api/courses/:id - Delete course (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await execute('DELETE FROM courses WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    return res.json({ message: 'Course deleted successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete course.' });
  }
});

export default router;
