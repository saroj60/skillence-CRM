import express from 'express';
import { queryOne, execute } from '../db.js';
import { authenticateToken, canManageRelated } from '../authMiddleware.js';

const router = express.Router();

// POST /api/visa-records - Create or Update Visa Record for a Student
router.post('/', authenticateToken, canManageRelated, async (req, res) => {
  const { student_id, status, interview_date, checklist } = req.body;

  if (!student_id || !status) {
    return res.status(400).json({ error: 'student_id and status are required.' });
  }

  const user = req.user;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const checklistStr = checklist ? JSON.stringify(checklist) : null;

  try {
    const existing = await queryOne('SELECT * FROM visa_records WHERE student_id = ?', [student_id]);
    const oldStatus = existing ? existing.status : 'Not Started';

    if (existing) {
      // Update
      await execute(`
        UPDATE visa_records
        SET status = ?, interview_date = ?, checklist = ?, updated_at = ?
        WHERE id = ?
      `, [status, interview_date || null, checklistStr, now, existing.id]);
    } else {
      // Create
      await execute(`
        INSERT INTO visa_records (student_id, status, interview_date, checklist, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [student_id, status, interview_date || null, checklistStr, now, now]);
    }

    // Log process history if status changed
    if (oldStatus !== status) {
      await execute(`
        INSERT INTO process_histories (student_id, old_status, new_status, changed_by, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'Visa status updated from profile page.', ?, ?)
      `, [student_id, oldStatus, status, user.id, now, now]);
    }

    return res.json({ message: 'Visa record updated successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update visa record.' });
  }
});

export default router;
