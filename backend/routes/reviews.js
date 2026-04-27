const express = require('express');
const router = express.Router();
const { sql, pool, poolConnect } = require('../config/db');
const authMiddleware = require('../middleware/auth');

// GET /api/reviews/title/:titleId
router.get('/title/:titleId', async (req, res) => {
  const titleId = parseInt(req.params.titleId);
  if (isNaN(titleId)) return res.status(400).json({ message: 'Invalid ID.' });
  try {
    await poolConnect;
    const result = await pool.request()
      .input('titleId', sql.Int, titleId)
      .query(`
        SELECT r.review_id, r.rating, r.comment, r.review_date,
               u.user_id, u.username
        FROM Reviews r JOIN Users u ON r.user_id = u.user_id
        WHERE r.title_id = @titleId
        ORDER BY r.review_date DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/reviews/user  (auth) - user's rating history
router.get('/user', authMiddleware, async (req, res) => {
  const userId = req.user.user_id;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT r.review_id, r.rating, r.comment, r.review_date,
               t.title_id, t.title, t.type, t.poster_url, t.release_date
        FROM Reviews r JOIN Titles t ON r.title_id = t.title_id
        WHERE r.user_id = @userId
        ORDER BY r.review_date DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/reviews/check/:titleId (auth) - check if user already reviewed
router.get('/check/:titleId', authMiddleware, async (req, res) => {
  const titleId = parseInt(req.params.titleId);
  const userId = req.user.user_id;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('titleId', sql.Int, titleId)
      .input('userId', sql.Int, userId)
      .query('SELECT review_id, rating, comment FROM Reviews WHERE title_id = @titleId AND user_id = @userId');
    res.json(result.recordset[0] || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/reviews  (auth) - create or update review
router.post('/', authMiddleware, async (req, res) => {
  const { title_id, rating, comment } = req.body;
  const userId = req.user.user_id;

  if (!title_id || !rating)
    return res.status(400).json({ message: 'title_id and rating are required.' });
  if (rating < 1 || rating > 10)
    return res.status(400).json({ message: 'Rating must be between 1 and 10.' });

  try {
    await poolConnect;
    const existing = await pool.request()
      .input('userId', sql.Int, userId)
      .input('titleId', sql.Int, title_id)
      .query('SELECT review_id FROM Reviews WHERE user_id = @userId AND title_id = @titleId');

    if (existing.recordset.length > 0) {
      await pool.request()
        .input('rating', sql.Int, rating)
        .input('comment', sql.Text, comment || null)
        .input('userId', sql.Int, userId)
        .input('titleId', sql.Int, title_id)
        .query('UPDATE Reviews SET rating = @rating, comment = @comment, review_date = GETDATE() WHERE user_id = @userId AND title_id = @titleId');
      return res.json({ message: 'Review updated.' });
    }

    await pool.request()
      .input('rating', sql.Int, rating)
      .input('comment', sql.Text, comment || null)
      .input('userId', sql.Int, userId)
      .input('titleId', sql.Int, title_id)
      .query('INSERT INTO Reviews (rating, comment, user_id, title_id) VALUES (@rating, @comment, @userId, @titleId)');
    res.status(201).json({ message: 'Review created.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/reviews/:reviewId  (auth)
router.delete('/:reviewId', authMiddleware, async (req, res) => {
  const reviewId = parseInt(req.params.reviewId);
  const userId = req.user.user_id;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('reviewId', sql.Int, reviewId)
      .input('userId', sql.Int, userId)
      .query('DELETE FROM Reviews WHERE review_id = @reviewId AND user_id = @userId');
    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ message: 'Review not found or not yours.' });
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
