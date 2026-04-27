const express = require('express');
const router = express.Router();
const { sql, pool, poolConnect } = require('../config/db');
const authMiddleware = require('../middleware/auth');

// GET /api/wishlist  (auth)
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.user.user_id;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT t.title_id, t.title, t.type, t.poster_url, t.release_date,
               w.added_at,
               COALESCE(AVG(CAST(r.rating AS FLOAT)), 0) AS avg_rating
        FROM Wishlist w
        JOIN Titles t ON w.title_id = t.title_id
        LEFT JOIN Reviews r ON t.title_id = r.title_id
        WHERE w.user_id = @userId
        GROUP BY t.title_id, t.title, t.type, t.poster_url, t.release_date, w.added_at
        ORDER BY w.added_at DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/wishlist  (auth)
router.post('/', authMiddleware, async (req, res) => {
  const { title_id } = req.body;
  const userId = req.user.user_id;
  if (!title_id) return res.status(400).json({ message: 'title_id required.' });
  try {
    await poolConnect;
    const existing = await pool.request()
      .input('userId', sql.Int, userId)
      .input('titleId', sql.Int, title_id)
      .query('SELECT 1 FROM Wishlist WHERE user_id = @userId AND title_id = @titleId');
    if (existing.recordset.length > 0)
      return res.status(409).json({ message: 'Already in wishlist.' });
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('titleId', sql.Int, title_id)
      .query('INSERT INTO Wishlist (user_id, title_id) VALUES (@userId, @titleId)');
    res.status(201).json({ message: 'Added to wishlist.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/wishlist/:titleId  (auth)
router.delete('/:titleId', authMiddleware, async (req, res) => {
  const titleId = parseInt(req.params.titleId);
  const userId = req.user.user_id;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('titleId', sql.Int, titleId)
      .query('DELETE FROM Wishlist WHERE user_id = @userId AND title_id = @titleId');
    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ message: 'Not in wishlist.' });
    res.json({ message: 'Removed from wishlist.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/wishlist/check/:titleId  (auth)
router.get('/check/:titleId', authMiddleware, async (req, res) => {
  const titleId = parseInt(req.params.titleId);
  const userId = req.user.user_id;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('titleId', sql.Int, titleId)
      .query('SELECT 1 AS inWishlist FROM Wishlist WHERE user_id = @userId AND title_id = @titleId');
    res.json({ inWishlist: result.recordset.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
