const db = require('../config/db');

const isValidId = (id) => {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
};

const isNonEmptyString = (value) => (
  typeof value === 'string' && value.trim().length > 0
);

const isValidEmail = (value) => (
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
);

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, username, email, reputation_score, is_verified, registration_date FROM users'
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error('getAllUsers error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const [rows] = await db.query(
      'SELECT user_id, username, email, reputation_score, bio, is_verified, registration_date FROM users WHERE user_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('getUserById error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/users
const createUser = async (req, res) => {
  try {
    const { username, email, password_hash, bio } = req.body;

    if (!isNonEmptyString(username) || !isValidEmail(email) || !isNonEmptyString(password_hash)) {
      return res.status(400).json({ message: 'username, valid email, and password_hash are required' });
    }

    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, bio, registration_date) VALUES (?, ?, ?, ?, NOW())',
      [username.trim(), email.trim(), password_hash, isNonEmptyString(bio) ? bio.trim() : null]
    );
    res.status(201).json({ message: 'User created', user_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    console.error('createUser error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const { bio, is_verified } = req.body;
    const fields = [];
    const values = [];

    if (bio !== undefined) {
      if (bio !== null && typeof bio !== 'string') {
        return res.status(400).json({ message: 'bio must be a string or null' });
      }
      fields.push('bio = ?');
      values.push(isNonEmptyString(bio) ? bio.trim() : null);
    }

    if (is_verified !== undefined) {
      if (typeof is_verified !== 'boolean') {
        return res.status(400).json({ message: 'is_verified must be a boolean' });
      }
      fields.push('is_verified = ?');
      values.push(is_verified);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'Provide at least one field to update' });
    }

    values.push(req.params.id);
    const [result] = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User updated' });
  } catch (err) {
    console.error('updateUser error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const [result] = await db.query(
      'DELETE FROM users WHERE user_id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
