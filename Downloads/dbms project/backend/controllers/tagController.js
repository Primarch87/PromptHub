const db = require('../config/db');

const isValidId = (id) => {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
};

const getAllTags = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT tag_id, tag_name, usage_count FROM tags');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTagsByPrompt = async (req, res) => {
  try {
    if (!isValidId(req.params.promptId)) {
      return res.status(400).json({ message: 'Invalid prompt ID' });
    }

    const [rows] = await db.query(
      'SELECT t.tag_id, t.tag_name, t.usage_count FROM tags t JOIN prompt_tag pt ON t.tag_id = pt.tag_id WHERE pt.prompt_id = ?',
      [req.params.promptId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createTag = async (req, res) => {
  try {
    const { tag_name } = req.body;

    if (!tag_name || typeof tag_name !== 'string' || tag_name.trim() === '') {
      return res.status(400).json({ message: 'tag_name is required' });
    }

    const [existing] = await db.query('SELECT tag_id FROM tags WHERE tag_name = ?', [tag_name.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Tag name already exists' });
    }

    const [result] = await db.query(
      'INSERT INTO tags (tag_name, usage_count) VALUES (?, 0)',
      [tag_name.trim()]
    );

    res.status(201).json({ message: 'Tag created', tag_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Tag name already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const assignTagToPrompt = async (req, res) => {
  try {
    const { prompt_id, tag_id } = req.body;

    if (!prompt_id || !tag_id) {
      return res.status(400).json({ message: 'prompt_id and tag_id are required' });
    }
    if (!isValidId(prompt_id) || !isValidId(tag_id)) {
      return res.status(400).json({ message: 'prompt_id and tag_id must be positive integers' });
    }

    const [existing] = await db.query(
      'SELECT * FROM prompt_tag WHERE prompt_id = ? AND tag_id = ?',
      [prompt_id, tag_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Tag already assigned to this prompt' });
    }

    await db.query(
      'INSERT INTO prompt_tag (prompt_id, tag_id) VALUES (?, ?)',
      [prompt_id, tag_id]
    );

    await db.query(
      'UPDATE tags SET usage_count = usage_count + 1 WHERE tag_id = ?',
      [tag_id]
    );

    res.status(201).json({ message: 'Tag assigned successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Tag already assigned to this prompt' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllTags, getTagsByPrompt, createTag, assignTagToPrompt };
