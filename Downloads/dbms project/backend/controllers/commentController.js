const db = require('../config/db');

const isValidId = (id) => {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
};

const getCommentsByPrompt = async (req, res) => {
  try {
    if (!isValidId(req.params.promptId)) {
      return res.status(400).json({ message: 'Invalid prompt ID' });
    }

    const [rows] = await db.query(
      `SELECT c.comment_id, c.prompt_id, c.user_id, u.username, c.comment_text,
              c.parent_comment_id, c.created_date, c.upvotes, c.downvotes
       FROM comments c
       JOIN users u ON c.user_id = u.user_id
       WHERE c.prompt_id = ?
       ORDER BY c.created_date ASC, c.comment_id ASC`,
      [req.params.promptId]
    );

    const comments = [];
    const repliesMap = {};

    // First pass: organize into map
    rows.forEach(row => {
      row.replies = [];
      repliesMap[row.comment_id] = row;
    });

    // Second pass: build tree structure
    rows.forEach(row => {
      if (row.parent_comment_id === null) {
        comments.push(row);
      } else {
        if (repliesMap[row.parent_comment_id]) {
          repliesMap[row.parent_comment_id].replies.push(row);
        }
      }
    });

    res.status(200).json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createComment = async (req, res) => {
  try {
    const { prompt_id, user_id, comment_text, parent_comment_id } = req.body;

    if (!prompt_id || !user_id || !comment_text) {
      return res.status(400).json({ message: 'prompt_id, user_id, and comment_text are required' });
    }
    if (!isValidId(prompt_id) || !isValidId(user_id)) {
      return res.status(400).json({ message: 'prompt_id and user_id must be positive integers' });
    }
    if (typeof comment_text !== 'string' || comment_text.trim() === '') {
      return res.status(400).json({ message: 'comment_text cannot be empty' });
    }
    if (parent_comment_id !== undefined && parent_comment_id !== null && !isValidId(parent_comment_id)) {
      return res.status(400).json({ message: 'parent_comment_id must be a positive integer if provided' });
    }
    if (parent_comment_id !== undefined && parent_comment_id !== null) {
      const [parentRows] = await db.query(
        'SELECT comment_id FROM comments WHERE comment_id = ? AND prompt_id = ?',
        [parent_comment_id, prompt_id]
      );
      if (parentRows.length === 0) {
        return res.status(400).json({ message: 'parent_comment_id must belong to the same prompt' });
      }
    }

    const [result] = await db.query(
      'INSERT INTO comments (prompt_id, user_id, comment_text, parent_comment_id, created_date, upvotes, downvotes) VALUES (?, ?, ?, ?, NOW(), 0, 0)',
      [prompt_id, user_id, comment_text.trim(), parent_comment_id || null]
    );

    res.status(201).json({ message: 'Comment created', comment_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const upvoteComment = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const [result] = await db.query(
      'UPDATE comments SET upvotes = upvotes + 1 WHERE comment_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.status(200).json({ message: 'Comment upvoted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteComment = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const [result] = await db.query(
      'DELETE FROM comments WHERE comment_id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCommentsByPrompt, createComment, upvoteComment, deleteComment };
