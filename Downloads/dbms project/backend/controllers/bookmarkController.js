const db = require('../config/db');

const isValidId = (id) => {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
};

const getBookmarksByUser = async (req, res) => {
  try {
    if (!isValidId(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const [rows] = await db.query(
      'SELECT b.bookmark_id, b.user_id, b.prompt_id, b.notes, b.bookmarked_date, p.title FROM bookmarks b JOIN prompts p ON b.prompt_id = p.prompt_id WHERE b.user_id = ?',
      [req.params.userId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createBookmark = async (req, res) => {
  try {
    const { user_id, prompt_id, notes } = req.body;

    if (!user_id || !prompt_id) {
      return res.status(400).json({ message: 'user_id and prompt_id are required' });
    }
    if (!isValidId(user_id) || !isValidId(prompt_id)) {
      return res.status(400).json({ message: 'user_id and prompt_id must be positive integers' });
    }

    const [existing] = await db.query(
      'SELECT bookmark_id FROM bookmarks WHERE user_id = ? AND prompt_id = ?',
      [user_id, prompt_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'User already bookmarked this prompt' });
    }

    const [result] = await db.query(
      'INSERT INTO bookmarks (user_id, prompt_id, notes, bookmarked_date) VALUES (?, ?, ?, NOW())',
      [user_id, prompt_id, notes || null]
    );

    res.status(201).json({ message: 'Bookmark created', bookmark_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'User already bookmarked this prompt' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteBookmark = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid bookmark ID' });
    }

    const [result] = await db.query(
      'DELETE FROM bookmarks WHERE bookmark_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    res.status(200).json({ message: 'Bookmark deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getBookmarksByUser, createBookmark, deleteBookmark };
