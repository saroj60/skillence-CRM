import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import route modules
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import leadRoutes from './routes/leads.js';
import studentRoutes from './routes/students.js';
import universityRoutes from './routes/universities.js';
import courseRoutes from './routes/courses.js';
import applicationRoutes from './routes/applications.js';
import documentRoutes from './routes/documents.js';
import visaRoutes from './routes/visa.js';
import userRoutes from './routes/users.js';

// Initialize env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Apply Helmet headers
app.use(helmet());

// Limit login requests to prevent brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: { error: 'Too many requests from this IP. Please try again in 15 minutes.' }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enable CORS for React frontend (Vite dev server usually runs on 5173 or 3000)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Static route to serve uploaded documents from Laravel's storage folder
const storagePath = path.resolve(__dirname, '../storage/app/public');
app.use('/storage', express.static(storagePath));

// API router mounts
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/visa-records', visaRoutes);
app.use('/api/users', userRoutes);

// Serve React frontend static files
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Fallback index / API root
app.get('/api', (req, res) => {
  res.json({ message: 'Skillence CRM API Server is online.' });
});

// All other routes redirect to React's index.html (client-side routing)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.resolve(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Not found');
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Listen
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
  console.log(`Serving storage files from ${storagePath}`);
  console.log(`Serving client assets from ${clientDistPath}`);
});
