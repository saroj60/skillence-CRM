import express from 'express';
import bcrypt from 'bcryptjs';
import { query, queryOne, execute } from '../db.js';
import { authenticateToken, isAdmin } from '../authMiddleware.js';

const router = express.Router();

// GET /api/users/assignees - Get list of staff & partners (accessible to all authenticated users for assignment select fields)
router.get('/assignees', authenticateToken, async (req, res) => {
  try {
    const staff = await query("SELECT id, name, role FROM users WHERE role = 'staff' AND status = 'active' ORDER BY name ASC");
    const partners = await query("SELECT id, name, role FROM users WHERE role = 'others' AND status = 'active' ORDER BY name ASC");
    return res.json({ staff, partners });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve assignees.' });
  }
});

// GET /api/users - Paginated list of all users (Admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  try {
    let sql = 'SELECT id, name, email, role, status, created_at FROM users';
    let countSql = 'SELECT COUNT(*) as count FROM users';
    const params = [];
    const countParams = [];

    if (search) {
      sql += ' WHERE name LIKE ? OR email LIKE ? OR role LIKE ?';
      countSql += ' WHERE name LIKE ? OR email LIKE ? OR role LIKE ?';
      const wild = `%${search}%`;
      params.push(wild, wild, wild);
      countParams.push(wild, wild, wild);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const users = await query(sql, params);
    const [countRes] = await query(countSql, countParams);
    const total = countRes.count;

    return res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

// POST /api/users - Create new user (Admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  const { name, email, password, role, status } = req.body;

  if (!name || !email || !password || !role || !status) {
    return res.status(400).json({ error: 'name, email, password, role (admin, staff, others) and status (active, inactive) are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    // Check if email already exists
    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await execute(`
      INSERT INTO users (name, email, password, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, email, hashedPassword, role, status, now, now]);

    return res.status(201).json({
      message: 'User created successfully.',
      userId: result.lastID
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create user.' });
  }
});

// PUT /api/users/:id - Update user (Admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, status } = req.body;

  if (!name || !email || !role || !status) {
    return res.status(400).json({ error: 'name, email, role, and status are required.' });
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    // Check email unique constraint excluding this user
    const existing = await queryOne('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    let passwordUpdateSql = '';
    const updateParams = [name, email, role, status];

    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
      }
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      passwordUpdateSql = ', password = ?';
      updateParams.push(hashedPassword);
    }

    updateParams.push(now, id);

    const result = await execute(`
      UPDATE users
      SET name = ?, email = ?, role = ?, status = ? ${passwordUpdateSql}, updated_at = ?
      WHERE id = ?
    `, updateParams);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ message: 'User updated successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update user.' });
  }
});

// DELETE /api/users/:id - Delete user (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account.' });
  }

  try {
    const result = await execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete user.' });
  }
});

export default router;
