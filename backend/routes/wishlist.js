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
      .input('user_id', sql.Int, userId)
      .execute('sp_GetUserWishlist');
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
    await pool.request()
      .input('user_id',  sql.Int, userId)
      .input('title_id', sql.Int, title_id)
      .execute('sp_AddToWishlist');
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
    await pool.request()
      .input('user_id',  sql.Int, userId)
      .input('title_id', sql.Int, titleId)
      .execute('sp_RemoveFromWishlist');
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
      .input('userId',  sql.Int, userId)
      .input('titleId', sql.Int, titleId)
      .query('SELECT 1 AS inWishlist FROM Wishlist WHERE user_id = @userId AND title_id = @titleId');
    res.json({ inWishlist: result.recordset.length > 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
