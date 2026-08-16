import express from 'express';
import { query, queryOne, execute } from '../db.js';
import { authenticateToken, canManageLead, canDeleteRecord } from '../authMiddleware.js';

const router = express.Router();

// GET /api/leads - Listing of leads (scoped by permissions)
router.get('/', authenticateToken, async (req, res) => {
  const user = req.user;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  try {
    let sql = `
      SELECT l.*, u.name as assigned_to_name, ab.name as added_by_name 
      FROM leads l 
      LEFT JOIN users u ON l.assigned_to = u.id 
      LEFT JOIN users ab ON l.added_by = ab.id
    `;
    let countSql = 'SELECT COUNT(*) as count FROM leads l';
    const params = [];
    const countParams = [];
    const conditions = [];

    if (user.role === 'others') {
      conditions.push('l.added_by = ?');
      params.push(user.id);
      countParams.push(user.id);
    }

    if (search) {
      conditions.push('(l.name LIKE ? OR l.phone LIKE ? OR l.email LIKE ? OR l.source LIKE ? OR l.status LIKE ?)');
      const wild = `%${search}%`;
      params.push(wild, wild, wild, wild, wild);
      countParams.push(wild, wild, wild, wild, wild);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
      countSql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const leads = await query(sql, params);
    const [countRes] = await query(countSql, countParams);
    const total = countRes.count;

    return res.json({
      leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve leads.' });
  }
});

// GET /api/leads/:id - Single lead detail
router.get('/:id', authenticateToken, canManageLead, async (req, res) => {
  const { id } = req.params;
  try {
    const lead = await queryOne(`
      SELECT l.*, u.name as assigned_to_name, ab.name as added_by_name 
      FROM leads l 
      LEFT JOIN users u ON l.assigned_to = u.id 
      LEFT JOIN users ab ON l.added_by = ab.id
      WHERE l.id = ?
    `, [id]);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    return res.json({ lead });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve lead.' });
  }
});

// POST /api/leads - Create new lead
router.post('/', authenticateToken, async (req, res) => {
  const { name, phone, email, source, status, assigned_to, added_by } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is a required field.' });
  }

  const user = req.user;
  const leadStatus = status || 'New';
  const finalAddedBy = user.role === 'others' ? user.id : (added_by || user.id);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    const result = await execute(`
      INSERT INTO leads (name, phone, email, source, status, assigned_to, added_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, phone || null, email || null, source || null, leadStatus, assigned_to || null, finalAddedBy, now, now]);

    return res.status(201).json({
      message: 'Lead created successfully.',
      leadId: result.lastID
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create lead.' });
  }
});

// PUT /api/leads/:id - Update lead
router.put('/:id', authenticateToken, canManageLead, async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, source, status, assigned_to, added_by } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  const user = req.user;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    // Determine added_by modification rights
    let updateAddedBySql = '';
    const updateParams = [name, phone || null, email || null, source || null, status, assigned_to || null];

    if (user.role !== 'others' && added_by !== undefined) {
      updateAddedBySql = ', added_by = ?';
      updateParams.push(added_by || null);
    }
    updateParams.push(now, id);

    await execute(`
      UPDATE leads 
      SET name = ?, phone = ?, email = ?, source = ?, status = ?, assigned_to = ? ${updateAddedBySql}, updated_at = ?
      WHERE id = ?
    `, updateParams);

    return res.json({ message: 'Lead updated successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update lead.' });
  }
});

// DELETE /api/leads/:id - Remove lead (Admin only)
router.delete('/:id', authenticateToken, canDeleteRecord, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await execute('DELETE FROM leads WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Lead not found.' });
    }
    return res.json({ message: 'Lead deleted successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete lead.' });
  }
});

export default router;
