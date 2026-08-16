import jwt from 'jsonwebtoken';
import { queryOne } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'skellence_crm_secret_key_2026';

export async function authenticateToken(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication cookie required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await queryOne('SELECT id, name, email, role, status FROM users WHERE id = ?', [decoded.id]);

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Your account is inactive.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// Admins only
export function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Unauthorized. Admin role required.' });
}

// Admins or Staff
export function isStaffOrAdmin(req, res, next) {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    return next();
  }
  return res.status(403).json({ error: 'Unauthorized. Staff or Admin access required.' });
}

// Delete gate (Admin only)
export function canDeleteRecord(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Unauthorized. Only admins can delete records.' });
}

// Manage Lead gate: admins and staff can manage any lead; "others" can only manage leads they added
export async function canManageLead(req, res, next) {
  const user = req.user;
  const leadId = req.params.id || req.body.lead_id;

  if (!leadId) {
    return next(); // If no lead ID (e.g. creating/storing), delegate to route controller
  }

  if (user.role === 'admin' || user.role === 'staff') {
    return next();
  }

  try {
    const lead = await queryOne('SELECT added_by FROM leads WHERE id = ?', [leadId]);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    if (lead.added_by === user.id) {
      return next();
    }

    return res.status(403).json({ error: 'Access denied. You do not own this lead.' });
  } catch (err) {
    return res.status(500).json({ error: 'Database error validating lead access.' });
  }
}

// Manage Student gate: admins and staff can manage any student; "others" can only manage students they added
export async function canManageStudent(req, res, next) {
  const user = req.user;
  const studentId = req.params.id || req.body.student_id;

  if (!studentId) {
    return next(); // For non-specific routes
  }

  if (user.role === 'admin' || user.role === 'staff') {
    return next();
  }

  try {
    const student = await queryOne('SELECT added_by FROM students WHERE id = ?', [studentId]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found.' });
    }

    if (student.added_by === user.id) {
      return next();
    }

    return res.status(403).json({ error: 'Access denied. You do not own this student profile.' });
  } catch (err) {
    return res.status(500).json({ error: 'Database error validating student access.' });
  }
}

// Manage related records of student (e.g. documents, applications, visa records)
export async function canManageRelated(req, res, next) {
  const user = req.user;
  let studentId = req.body.student_id || req.query.student_id;

  // If the student ID is not directly present, we might have a document_id or application_id
  const docId = req.params.document_id || req.params.id;
  const appId = req.params.application_id || req.params.id;

  try {
    if (!studentId && req.baseUrl.includes('documents') && docId) {
      const doc = await queryOne('SELECT student_id FROM documents WHERE id = ?', [docId]);
      studentId = doc?.student_id;
    } else if (!studentId && req.baseUrl.includes('applications') && appId) {
      const app = await queryOne('SELECT student_id FROM applications WHERE id = ?', [appId]);
      studentId = app?.student_id;
    } else if (!studentId && req.baseUrl.includes('visa-records') && appId) {
      const visa = await queryOne('SELECT student_id FROM visa_records WHERE id = ?', [appId]);
      studentId = visa?.student_id;
    }

    if (!studentId) {
      return next(); // If no student ID is found, let controller handle validation error
    }

    if (user.role === 'admin' || user.role === 'staff') {
      return next();
    }

    const student = await queryOne('SELECT added_by FROM students WHERE id = ?', [studentId]);
    if (student && student.added_by === user.id) {
      return next();
    }

    return res.status(403).json({ error: 'Access denied. You do not own this student profile.' });
  } catch (err) {
    return res.status(500).json({ error: 'Database error validating access.' });
  }
}
