const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { sql, pool, poolConnect } = require('../config/db');
const authMiddleware = require('../middleware/auth');

// GET /api/users/profile  (auth)
router.get('/profile', authMiddleware, async (req, res) => {
  const userId = req.user.user_id;
  try {
    await poolConnect;
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT user_id, username, email FROM Users WHERE user_id = @userId');

    if (userResult.recordset.length === 0)
      return res.status(404).json({ message: 'User not found.' });

    const statsResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT total_ratings, wishlist_count, avg_given_rating
        FROM vw_UserStats
        WHERE user_id = @userId
      `);

    res.json({
      ...userResult.recordset[0],
      stats: statsResult.recordset[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/users/profile  (auth)
router.put('/profile', authMiddleware, async (req, res) => {
  const userId = req.user.user_id;
  const { username, email, password } = req.body;

  if (!username && !email && !password)
    return res.status(400).json({ message: 'At least one field required.' });

  try {
    await poolConnect;

    if (username || email) {
      const conflict = await pool.request()
        .input('username', sql.VarChar, username || '')
        .input('email', sql.VarChar, email || '')
        .input('userId', sql.Int, userId)
        .query(`
          SELECT user_id FROM Users
          WHERE (LEN(@username) > 0 AND username = @username OR LEN(@email) > 0 AND email = @email)
            AND user_id != @userId
        `);
      if (conflict.recordset.length > 0)
        return res.status(409).json({ message: 'Username or email already taken.' });
    }

    if (username) {
      await pool.request()
        .input('username', sql.VarChar, username)
        .input('userId', sql.Int, userId)
        .query('UPDATE Users SET username = @username WHERE user_id = @userId');
    }
    if (email) {
      await pool.request()
        .input('email', sql.VarChar, email)
        .input('userId', sql.Int, userId)
        .query('UPDATE Users SET email = @email WHERE user_id = @userId');
    }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.request()
        .input('hash', sql.VarChar, hash)
        .input('userId', sql.Int, userId)
        .query('UPDATE Users SET pass_hash = @hash WHERE user_id = @userId');
    }

    const updated = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT user_id, username, email FROM Users WHERE user_id = @userId');
    res.json(updated.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
