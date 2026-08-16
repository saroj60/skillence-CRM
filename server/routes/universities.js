import express from 'express';
import { query, queryOne, execute } from '../db.js';
import { authenticateToken, isAdmin } from '../authMiddleware.js';

const router = express.Router();

// GET /api/universities - Paginated list of universities
router.get('/', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  try {
    let sql = `
      SELECT u.*, (SELECT COUNT(*) FROM courses c WHERE c.university_id = u.id) as courses_count
      FROM universities u
    `;
    let countSql = 'SELECT COUNT(*) as count FROM universities';
    const params = [];
    const countParams = [];

    if (search) {
      sql += ' WHERE u.name LIKE ? OR u.country LIKE ?';
      countSql += ' WHERE name LIKE ? OR country LIKE ?';
      const wild = `%${search}%`;
      params.push(wild, wild);
      countParams.push(wild, wild);
    }

    sql += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const universities = await query(sql, params);
    const [countRes] = await query(countSql, countParams);
    const total = countRes.count;

    return res.json({
      universities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve universities.' });
  }
});

// GET /api/universities/all - Non-paginated simple list (useful for dropdown selects)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const universities = await query('SELECT id, name, country FROM universities ORDER BY name ASC');
    return res.json({ universities });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve universities dropdown list.' });
  }
});

// GET /api/universities/:id - Single university detail with courses
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const university = await queryOne('SELECT * FROM universities WHERE id = ?', [id]);
    if (!university) {
      return res.status(404).json({ error: 'University not found.' });
    }

    const courses = await query('SELECT * FROM courses WHERE university_id = ? ORDER BY title ASC', [id]);

    return res.json({ university, courses });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve university details.' });
  }
});

// POST /api/universities - Create university (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { name, country, website } = req.body;

  if (!name || !country) {
    return res.status(400).json({ error: 'Name and Country are required fields.' });
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    const result = await execute(`
      INSERT INTO universities (name, country, website, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `, [name, country, website || null, now, now]);

    return res.status(201).json({
      message: 'University added successfully.',
      universityId: result.lastID
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create university.' });
  }
});

// PUT /api/universities/:id - Update university (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, country, website } = req.body;

  if (!name || !country) {
    return res.status(400).json({ error: 'Name and Country are required.' });
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    const result = await execute(`
      UPDATE universities
      SET name = ?, country = ?, website = ?, updated_at = ?
      WHERE id = ?
    `, [name, country, website || null, now, id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'University not found.' });
    }

    return res.json({ message: 'University updated successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update university.' });
  }
});

// DELETE /api/universities/:id - Delete university (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await execute('DELETE FROM universities WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'University not found.' });
    }
    return res.json({ message: 'University deleted successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete university.' });
  }
});

export default router;
