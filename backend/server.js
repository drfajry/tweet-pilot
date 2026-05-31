require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/trends',   require('./routes/trends'));
app.use('/api/tweet',    require('./routes/tweet'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/generate', require('./routes/generate'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// SPA fallback
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

// Start scheduler
require('./services/scheduler').init();

app.listen(PORT, () => console.log(`✅ Tweet Pilot running on port ${PORT}`));
