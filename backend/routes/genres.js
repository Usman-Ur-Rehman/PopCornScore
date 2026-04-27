const express = require('express');
const router = express.Router();
const { pool, poolConnect } = require('../config/db');

// GET /api/genres
router.get('/', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query('SELECT genre_id, genre_name FROM Genres ORDER BY genre_name');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
