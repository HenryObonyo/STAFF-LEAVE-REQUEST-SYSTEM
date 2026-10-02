const dotenv = require('dotenv');

dotenv.config();

const express = require('express');
const cors = require('cors');

const pool = require('./config/db');
const leaveTypeRoutes = require('./routes/leaveTypeRoutes');
const authRoutes = require('./routes/authRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const managerRoutes = require('./routes/managerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Staff Leave Request System API is running'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/leave-requests', leaveRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leave-types', leaveTypeRoutes);
app.use('/api/profile', profileRoutes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  try {
    await pool.query('SELECT NOW()');
    console.log('Database connection verified');
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
});