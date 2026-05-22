const db = require('../config/db');

// ── Helpers ──────────────────────────────────────────────────
const isValidId = (id) => {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
};

// GET /api/categories
const getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM category WHERE is_active = TRUE');
    res.status(200).json(rows);
  } catch (err) {
    console.error('getAllCategories error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    const [rows] = await db.execute('SELECT * FROM category WHERE category_id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('getCategoryById error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    
    if (!category_name || typeof category_name !== 'string' || category_name.trim() === '') {
      return res.status(400).json({ message: 'category_name is required' });
    }
    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({ message: 'description must be a string or null' });
    }
    
    const [result] = await db.execute(
      'INSERT INTO category (category_name, description, is_active) VALUES (?, ?, TRUE)',
      [category_name.trim(), description?.trim() || null]
    );
    res.status(201).json({ category_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Category already exists' });
    }
    console.error('createCategory error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ message: 'is_active must be a boolean' });
    }
    
    const [result] = await db.execute(
      'UPDATE category SET is_active = ? WHERE category_id = ?',
      [is_active, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category updated successfully' });
  } catch (err) {
    console.error('updateCategory error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory
};
