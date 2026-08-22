const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Health check route with DB connectivity verification
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() as now');
    res.json({
      success: true,
      status: 'healthy',
      database: 'connected',
      server_time: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: err.message
    });
  }
});

module.exports = app;
