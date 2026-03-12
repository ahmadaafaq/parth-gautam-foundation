require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const programRoutes = require('./routes/programs');
const issueRoutes = require('./routes/issues');
const suggestionRoutes = require('./routes/suggestions');
const updateRoutes = require('./routes/updates');
const chatRoutes = require('./routes/chat');
const seedRoutes = require('./routes/seed');

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/seed', seedRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({ detail: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`✅  Server running on http://localhost:${PORT}`);
});
