const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ── Database Initialization ──────────────────────────────────
require('./config/db');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Route Imports ────────────────────────────────────────────
const userRoutes      = require('./routes/users');
const promptRoutes    = require('./routes/prompts');
const ratingRoutes    = require('./routes/ratings');
const commentRoutes   = require('./routes/comments');
const tagRoutes       = require('./routes/tags');
const bookmarkRoutes  = require('./routes/bookmarks');
const aiOutputRoutes  = require('./routes/ai_outputs');
const categoryRoutes      = require('./routes/categories');
const promptVersionRoutes = require('./routes/promptVersions');

// ── Route Mounting ───────────────────────────────────────────
app.use('/api/users',      userRoutes);
app.use('/api/prompts',    promptRoutes);
app.use('/api/ratings',    ratingRoutes);
app.use('/api/comments',   commentRoutes);
app.use('/api/tags',       tagRoutes);
app.use('/api/bookmarks',  bookmarkRoutes);
app.use('/api/ai-outputs', aiOutputRoutes);
app.use('/api/categories',      categoryRoutes);
app.use('/api/prompt-versions', promptVersionRoutes);

// ── Root Route ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'API running' });
});

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date()
  });
});

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
