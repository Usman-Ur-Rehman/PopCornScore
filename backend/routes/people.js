const express = require('express');
const router = express.Router();
const { sql, pool, poolConnect } = require('../config/db');

// GET /api/people/search?q=...
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) return res.json([]);
  try {
    await poolConnect;
    const result = await pool.request()
      .input('q', sql.NVarChar, `%${q.toLowerCase()}%`)
      .query(`
        SELECT TOP 6 people_id, name, picture_url
        FROM People
        WHERE LOWER(name) LIKE @q
        ORDER BY name
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/people/:id
router.get('/:id', async (req, res) => {
  const personId = parseInt(req.params.id);
  if (isNaN(personId)) return res.status(400).json({ message: 'Invalid ID.' });
  try {
    await poolConnect;
    const personResult = await pool.request()
      .input('personId', sql.Int, personId)
      .query('SELECT people_id, name, picture_url, bio, birth_date FROM People WHERE people_id = @personId');

    if (personResult.recordset.length === 0)
      return res.status(404).json({ message: 'Person not found.' });

    const filmographyResult = await pool.request()
      .input('personId', sql.Int, personId)
      .query(`
        SELECT t.title_id, t.title, t.type, t.poster_url, t.release_date,
               mc.role, mc.character_name,
               t.avg_rating
        FROM MTS_CAST mc
        JOIN Titles t ON mc.title_id = t.title_id
        WHERE mc.people_id = @personId
        ORDER BY t.release_date DESC
      `);

    res.json({
      ...personResult.recordset[0],
      filmography: filmographyResult.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
