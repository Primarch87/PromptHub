const db = require('../config/db');

const isValidId = (id) => {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
};

const getRatingsByPrompt = async (req, res) => {
  try {
    if (!isValidId(req.params.promptId)) {
      return res.status(400).json({ message: 'Invalid prompt ID' });
    }

    const [rows] = await db.query(
      'SELECT rating_id, prompt_id, user_id, rating_value, rated_date FROM ratings WHERE prompt_id = ?',
      [req.params.promptId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createRating = async (req, res) => {
  try {
    const { prompt_id, user_id, rating_value } = req.body;
    const parsedRating = Number(rating_value);

    if (!prompt_id || !user_id || rating_value === undefined) {
      return res.status(400).json({ message: 'prompt_id, user_id, and rating_value are required' });
    }
    if (!isValidId(prompt_id) || !isValidId(user_id)) {
      return res.status(400).json({ message: 'prompt_id and user_id must be positive integers' });
    }
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'rating_value must be an integer between 1 and 5' });
    }

    const [existing] = await db.query(
      'SELECT rating_id FROM ratings WHERE prompt_id = ? AND user_id = ?',
      [prompt_id, user_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'User already rated this prompt' });
    }

    const [result] = await db.query(
      'INSERT INTO ratings (prompt_id, user_id, rating_value, rated_date) VALUES (?, ?, ?, NOW())',
      [prompt_id, user_id, parsedRating]
    );

    res.status(201).json({ message: 'Rating created', rating_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'User already rated this prompt' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteRating = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid rating ID' });
    }

    const [existing] = await db.query(
      'SELECT prompt_id FROM ratings WHERE rating_id = ?',
      [req.params.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    const promptId = existing[0].prompt_id;

    const [result] = await db.query(
      'DELETE FROM ratings WHERE rating_id = ?',
      [req.params.id]
    );

    await db.query(
      `UPDATE prompts p
       SET average_rating = COALESCE((
         SELECT AVG(r.rating_value)
         FROM ratings r
         WHERE r.prompt_id = p.prompt_id
       ), 0)
       WHERE p.prompt_id = ?`,
      [promptId]
    );

    res.status(200).json({ message: 'Rating deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getRatingsByPrompt, createRating, deleteRating };
