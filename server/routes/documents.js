import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { queryOne, execute } from '../db.js';
import { authenticateToken, canManageRelated, canDeleteRecord } from '../authMiddleware.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage disk path
const storageRoot = process.env.STORAGE_PATH || path.resolve(__dirname, '../../storage/app/public');

// Custom storage engine for multer to dynamically route uploads to correct student subdirectories
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const studentId = req.body.student_id;
    if (!studentId) {
      return cb(new Error('student_id is required before uploading a file.'));
    }
    const studentDir = path.join(storageRoot, 'documents', String(studentId));
    
    // Ensure directory exists
    fs.mkdirSync(studentDir, { recursive: true });
    cb(null, studentDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Configure file filters
const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, JPG, JPEG, and PNG files are allowed.'));
  }
});

// POST /api/documents - Upload a document for a student
router.post('/', authenticateToken, (req, res, next) => {
  // Multer runs first to process the form, then we authorize and insert
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, canManageRelated, async (req, res) => {
  const { student_id, type } = req.body;
  const file = req.file;

  if (!student_id || !type || !file) {
    // If upload was successful but data was missing, clean up file
    if (file) {
      fs.unlinkSync(file.path);
    }
    return res.status(400).json({ error: 'student_id, type, and file are required.' });
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  // Store path relative to storageRoot (Laravel compatibility: 'documents/{id}/filename')
  const relativePath = path.relative(storageRoot, file.path).replace(/\\/g, '/');

  try {
    const result = await execute(`
      INSERT INTO documents (student_id, type, file_path, status, created_at, updated_at)
      VALUES (?, ?, ?, 'Pending', ?, ?)
    `, [student_id, type, relativePath, now, now]);

    return res.status(201).json({
      message: 'Document uploaded successfully.',
      documentId: result.lastID,
      file_path: relativePath
    });
  } catch (err) {
    console.error(err);
    // Cleanup physical file on DB failure
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return res.status(500).json({ error: 'Failed to record document in database.' });
  }
});

// PUT /api/documents/:id - Update document status
router.put('/:id', authenticateToken, canManageRelated, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['Pending', 'Verified', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Valid status (Pending, Verified, Rejected) is required.' });
  }

  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  try {
    const result = await execute('UPDATE documents SET status = ?, updated_at = ? WHERE id = ?', [status, now, id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    return res.json({ message: 'Document status updated.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update document status.' });
  }
});

// DELETE /api/documents/:id - Delete document (Admin only)
router.delete('/:id', authenticateToken, canDeleteRecord, async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await queryOne('SELECT * FROM documents WHERE id = ?', [id]);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    // Delete physical file from disk
    const fullPath = path.join(storageRoot, doc.file_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Delete DB record
    await execute('DELETE FROM documents WHERE id = ?', [id]);

    return res.json({ message: 'Document deleted successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete document.' });
  }
});

// GET /api/documents/:id/download - Download / serve document file
router.get('/:id/download', authenticateToken, canManageRelated, async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await queryOne('SELECT * FROM documents WHERE id = ?', [id]);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    const fullPath = path.join(storageRoot, doc.file_path);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found on storage disk.' });
    }

    return res.sendFile(fullPath);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to download document.' });
  }
});

export default router;
