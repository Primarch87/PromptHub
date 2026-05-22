const db = require('../config/db');

// ── Helpers ──────────────────────────────────────────────────

const isValidId = (id) => {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
};

// ── Base SELECT with JOINs ───────────────────────────────────

const BASE_SELECT = `
  SELECT p.prompt_id, p.title, p.prompt_text, p.description,
         p.average_rating, p.created_date, p.last_modified_date, p.is_public,
         u.user_id, u.username,
         c.category_id, c.category_name
  FROM prompts p
  JOIN users u ON p.user_id = u.user_id
  JOIN category c ON p.category_id = c.category_id
`;

// ── Controllers ──────────────────────────────────────────────

// GET /api/prompts
const getAllPrompts = async (req, res) => {
  try {
    const [rows] = await db.query(
      `${BASE_SELECT} WHERE p.is_public = TRUE ORDER BY p.created_date DESC`
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error('getAllPrompts error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/prompts/:id
const getPromptById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid prompt ID' });
    }

    const [rows] = await db.query(
      `${BASE_SELECT} WHERE p.prompt_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('getPromptById error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/prompts/user/:userId
const getPromptsByUser = async (req, res) => {
  try {
    if (!isValidId(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const [rows] = await db.query(
      `${BASE_SELECT} WHERE p.user_id = ? ORDER BY p.created_date DESC`,
      [req.params.userId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error('getPromptsByUser error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/prompts/category/:categoryId
const getPromptsByCategory = async (req, res) => {
  try {
    if (!isValidId(req.params.categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const [rows] = await db.query(
      `${BASE_SELECT} WHERE p.category_id = ? AND p.is_public = TRUE ORDER BY p.created_date DESC`,
      [req.params.categoryId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error('getPromptsByCategory error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/prompts
const createPrompt = async (req, res) => {
  try {
    const { user_id, category_id, title, prompt_text, description, is_public } = req.body;

    // ── Input validation ───────────────────────────────────
    if (!user_id || !category_id || !title || !prompt_text) {
      return res.status(400).json({ message: 'user_id, category_id, title, and prompt_text are required' });
    }
    if (!isValidId(user_id) || !isValidId(category_id)) {
      return res.status(400).json({ message: 'user_id and category_id must be positive integers' });
    }
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: 'title cannot be empty' });
    }
    if (typeof prompt_text !== 'string' || prompt_text.trim().length === 0) {
      return res.status(400).json({ message: 'prompt_text cannot be empty' });
    }
    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({ message: 'description must be a string or null' });
    }
    if (is_public !== undefined && typeof is_public !== 'boolean') {
      return res.status(400).json({ message: 'is_public must be a boolean' });
    }

    const [result] = await db.query(
      `INSERT INTO prompts (user_id, category_id, title, prompt_text, description, is_public, created_date, last_modified_date)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [user_id, category_id, title.trim(), prompt_text.trim(), description?.trim() || null, is_public !== undefined ? is_public : true]
    );

    res.status(201).json({ message: 'Prompt created', prompt_id: result.insertId });
  } catch (err) {
    console.error('createPrompt error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/prompts/:id
const updatePrompt = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid prompt ID' });
    }

    const { title, prompt_text, description, is_public } = req.body;

    // ── Input validation ───────────────────────────────────
    if (title === undefined && prompt_text === undefined && description === undefined && is_public === undefined) {
      return res.status(400).json({ message: 'Provide at least one field to update' });
    }

    // ── Build dynamic query ────────────────────────────────
    const fields = [];
    const values = [];

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({ message: 'title cannot be empty' });
      }
      fields.push('title = ?');
      values.push(title.trim());
    }

    if (prompt_text !== undefined) {
      if (typeof prompt_text !== 'string' || prompt_text.trim().length === 0) {
        return res.status(400).json({ message: 'prompt_text cannot be empty' });
      }
      fields.push('prompt_text = ?');
      values.push(prompt_text);
    }

    if (description !== undefined) {
      if (description !== null && typeof description !== 'string') {
        return res.status(400).json({ message: 'description must be a string or null' });
      }
      fields.push('description = ?');
      values.push(description?.trim() || null);
    }

    if (is_public !== undefined) {
      if (typeof is_public !== 'boolean') {
        return res.status(400).json({ message: 'is_public must be a boolean' });
      }
      fields.push('is_public = ?');
      values.push(is_public);
    }

    // Always update last_modified_date
    fields.push('last_modified_date = NOW()');

    values.push(req.params.id);

    const [result] = await db.query(
      `UPDATE prompts SET ${fields.join(', ')} WHERE prompt_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    res.status(200).json({ message: 'Prompt updated' });
  } catch (err) {
    console.error('updatePrompt error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/prompts/:id
const deletePrompt = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid prompt ID' });
    }

    const [result] = await db.query(
      'DELETE FROM prompts WHERE prompt_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    res.status(200).json({ message: 'Prompt deleted' });
  } catch (err) {
    console.error('deletePrompt error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/prompts/search?q=keyword
const searchPrompts = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query (q) is required' });
    }

    const keyword = `%${q.trim()}%`;

    const [rows] = await db.query(
      `${BASE_SELECT} WHERE p.is_public = TRUE AND (p.title LIKE ? OR p.prompt_text LIKE ?) ORDER BY p.created_date DESC`,
      [keyword, keyword]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error('searchPrompts error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllPrompts,
  getPromptById,
  getPromptsByUser,
  getPromptsByCategory,
  createPrompt,
  updatePrompt,
  deletePrompt,
  searchPrompts,
};
