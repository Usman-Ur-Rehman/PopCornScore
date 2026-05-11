const express = require('express');
const router = express.Router();
const { sql, pool, poolConnect } = require('../config/db');
const authMiddleware = require('../middleware/auth');

// Titles now has cached avg_rating and review_count columns maintained by
// trg_Reviews_UpdateTitleStats, so no GROUP BY aggregation needed.
const SELECT_BASE = `
  t.title_id, t.title, t.type, t.release_date,
  t.poster_url, t.cover_url, t.trailer_url,
  CAST(t.summary AS NVARCHAR(MAX)) AS summary,
  t.avg_rating, t.review_count
`;

// GET /api/titles/trending
router.get('/trending', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT TOP 20 ${SELECT_BASE}
      FROM Titles t
      WHERE t.review_count > 0
      ORDER BY t.review_count DESC, t.avg_rating DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/titles/top-rated
router.get('/top-rated', async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query(`
      SELECT TOP 20 ${SELECT_BASE}
      FROM Titles t
      WHERE t.review_count >= 1
      ORDER BY t.avg_rating DESC, t.review_count DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/titles/recommendations  (auth)
router.get('/recommendations', authMiddleware, async (req, res) => {
  const userId = req.user.user_id;
  try {
    await poolConnect;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT TOP 12 ${SELECT_BASE}
        FROM Titles t
        WHERE t.title_id IN (
          SELECT tg2.title_id
          FROM Title_Genres tg2
          WHERE tg2.genre_id IN (
            SELECT DISTINCT tg.genre_id
            FROM Reviews ur
            JOIN Title_Genres tg ON ur.title_id = tg.title_id
            WHERE ur.user_id = @userId AND ur.rating >= 7
          )
          AND tg2.title_id NOT IN (
            SELECT title_id FROM Reviews WHERE user_id = @userId
          )
        )
        ORDER BY t.avg_rating DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/titles  (with search, filter, sort, pagination)
router.get('/', async (req, res) => {
  const { search = '', type = '', genre = '', sort = 'rating', page = 1 } = req.query;
  const limit = 24;
  const offset = (parseInt(page) - 1) * limit;
  const searchPattern = search ? `%${search.toLowerCase()}%` : '%';

  let orderClause = 't.avg_rating DESC, t.review_count DESC';
  if (sort === 'newest') orderClause = 't.release_date DESC';
  else if (sort === 'oldest') orderClause = 't.release_date ASC';
  else if (sort === 'popular') orderClause = 't.review_count DESC, t.avg_rating DESC';

  const filterWhere = `
    WHERE (
      LOWER(t.title) LIKE @search
      OR EXISTS (
        SELECT 1 FROM MTS_CAST mc JOIN People p ON mc.people_id = p.people_id
        WHERE mc.title_id = t.title_id AND LOWER(p.name) LIKE @search
      )
    )
    AND (LEN(@type) = 0 OR t.type = @type)
    AND (LEN(@genre) = 0 OR EXISTS (
      SELECT 1 FROM Title_Genres tg JOIN Genres g ON tg.genre_id = g.genre_id
      WHERE tg.title_id = t.title_id AND g.genre_name = @genre
    ))
  `;

  try {
    await poolConnect;

    const countResult = await pool.request()
      .input('search', sql.NVarChar, searchPattern)
      .input('type', sql.NVarChar, type || '')
      .input('genre', sql.NVarChar, genre || '')
      .query(`SELECT COUNT(*) AS total FROM Titles t ${filterWhere}`);

    const dataResult = await pool.request()
      .input('search', sql.NVarChar, searchPattern)
      .input('type', sql.NVarChar, type || '')
      .input('genre', sql.NVarChar, genre || '')
      .input('offset', sql.Int, offset)
      .input('limit', sql.Int, limit)
      .query(`
        SELECT ${SELECT_BASE}
        FROM Titles t
        ${filterWhere}
        ORDER BY ${orderClause}
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

    res.json({
      titles: dataResult.recordset,
      total:  countResult.recordset[0].total,
      page:   parseInt(page),
      pages:  Math.ceil(countResult.recordset[0].total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/titles/:id
router.get('/:id', async (req, res) => {
  const titleId = parseInt(req.params.id);
  if (isNaN(titleId)) return res.status(400).json({ message: 'Invalid ID.' });

  try {
    await poolConnect;

    const titleResult = await pool.request()
      .input('titleId', sql.Int, titleId)
      .query(`SELECT ${SELECT_BASE} FROM Titles t WHERE t.title_id = @titleId`);

    if (titleResult.recordset.length === 0)
      return res.status(404).json({ message: 'Title not found.' });

    const genresResult = await pool.request()
      .input('titleId', sql.Int, titleId)
      .query(`
        SELECT g.genre_id, g.genre_name
        FROM Title_Genres tg JOIN Genres g ON tg.genre_id = g.genre_id
        WHERE tg.title_id = @titleId
      `);

    const castResult = await pool.request()
      .input('titleId', sql.Int, titleId)
      .query(`
        SELECT mc.cast_id, mc.character_name, mc.role,
               p.people_id, p.name, p.picture_url
        FROM MTS_CAST mc JOIN People p ON mc.people_id = p.people_id
        WHERE mc.title_id = @titleId
        ORDER BY CASE mc.role WHEN 'Director' THEN 0 WHEN 'Actor' THEN 1 ELSE 2 END
      `);

    const similarResult = await pool.request()
      .input('titleId', sql.Int, titleId)
      .query(`
        SELECT TOP 8 ${SELECT_BASE}
        FROM Titles t
        WHERE t.title_id != @titleId
          AND t.title_id IN (
            SELECT tg2.title_id FROM Title_Genres tg2
            WHERE tg2.genre_id IN (
              SELECT genre_id FROM Title_Genres WHERE title_id = @titleId
            )
          )
        ORDER BY t.avg_rating DESC
      `);

    res.json({
      ...titleResult.recordset[0],
      genres: genresResult.recordset,
      cast:   castResult.recordset,
      similar: similarResult.recordset,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
