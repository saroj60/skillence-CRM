import express from 'express';
import { query } from '../db.js';
import { authenticateToken } from '../authMiddleware.js';

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authenticateToken, async (req, res) => {
  const user = req.user;
  const isOthers = user.role === 'others';

  try {
    let leadsCountSql = 'SELECT COUNT(*) as count FROM leads';
    let studentsCountSql = "SELECT COUNT(*) as count FROM students WHERE status = 'Active'";
    let applicationsCountSql = 'SELECT COUNT(*) as count FROM applications';
    let visaCountSql = "SELECT COUNT(*) as count FROM visa_records WHERE status NOT IN ('Visa Granted', 'Visa Refused')";
    let recentLeadsSql = 'SELECT l.*, u.name as assigned_to_name FROM leads l LEFT JOIN users u ON l.assigned_to = u.id';
    let recentStudentsSql = 'SELECT s.*, l.name as lead_name FROM students s LEFT JOIN leads l ON s.lead_id = l.id';

    const params = [];
    const studentParams = [];
    const visaParams = [];
    const recentLeadsParams = [];
    const recentStudentsParams = [];

    if (isOthers) {
      leadsCountSql += ' WHERE added_by = ?';
      params.push(user.id);

      studentsCountSql += ' AND added_by = ?';
      studentParams.push(user.id);

      // Scoped visas associated with students added by this user
      visaCountSql = "SELECT COUNT(*) as count FROM visa_records vr JOIN students s ON vr.student_id = s.id WHERE vr.status NOT IN ('Visa Granted', 'Visa Refused') AND s.added_by = ?";
      visaParams.push(user.id);

      recentLeadsSql += ' WHERE l.added_by = ?';
      recentLeadsParams.push(user.id);

      recentStudentsSql += ' WHERE s.added_by = ?';
      recentStudentsParams.push(user.id);
    }

    recentLeadsSql += ' ORDER BY l.created_at DESC LIMIT 5';
    recentStudentsSql += ' ORDER BY s.created_at DESC LIMIT 5';

    // Execute queries
    const [leadsCountRes] = await query(leadsCountSql, params);
    const [studentsCountRes] = await query(studentsCountSql, studentParams);
    const [applicationsCountRes] = await query(applicationsCountSql);
    const [visaCountRes] = await query(visaCountSql, visaParams);

    const recentLeads = await query(recentLeadsSql, recentLeadsParams);
    const recentStudents = await query(recentStudentsSql, recentStudentsParams);

    return res.json({
      stats: {
        total_leads: leadsCountRes.count,
        active_students: studentsCountRes.count,
        total_applications: applicationsCountRes.count,
        pending_visas: visaCountRes.count,
      },
      recentLeads,
      recentStudents
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve dashboard statistics.' });
  }
});

export default router;
