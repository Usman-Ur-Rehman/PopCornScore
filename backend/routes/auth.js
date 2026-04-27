const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, pool, poolConnect } = require('../config/db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: 'All fields are required.' });

  try {
    await poolConnect;
    const existing = await pool.request()
      .input('email', sql.VarChar, email)
      .input('username', sql.VarChar, username)
      .query('SELECT user_id FROM Users WHERE email = @email OR username = @username');

    if (existing.recordset.length > 0)
      return res.status(409).json({ message: 'Email or username already taken.' });

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.request()
      .input('username', sql.VarChar, username)
      .input('email', sql.VarChar, email)
      .input('pass_hash', sql.VarChar, hash)
      .query('INSERT INTO Users (username, email, pass_hash) OUTPUT INSERTED.user_id, INSERTED.username, INSERTED.email VALUES (@username, @email, @pass_hash)');

    const user = result.recordset[0];
    const token = jwt.sign({ user_id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { user_id: user.user_id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required.' });

  try {
    await poolConnect;
    const result = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT user_id, username, email, pass_hash FROM Users WHERE email = @email');

    if (result.recordset.length === 0)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const user = result.recordset[0];
    const match = await bcrypt.compare(password, user.pass_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign({ user_id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { user_id: user.user_id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
