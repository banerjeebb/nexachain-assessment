require('dotenv').config();
const express   = require('express');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const cors      = require('cors');
const morgan    = require('morgan');

const connectDB = require('./config/db');

const authRoutes       = require('./routes/auth.routes');
const investmentRoutes = require('./routes/investment.routes');
const dashboardRoutes  = require('./routes/dashboard.routes');
const referralRoutes   = require('./routes/referral.routes');

connectDB();

// Start cron after DB connects
require('./jobs/roiCron.job');

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use('/api',      rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.use('/api/auth',        authRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/referrals',   referralRoutes);

// GET /api/roi/history — proxied through investment routes
const auth = require('./middleware/auth.middleware');
const { getROIHistory } = require('./controllers/investment.controller');
app.get('/api/roi/history', auth, getROIHistory);

app.use((req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`));

module.exports = app;
