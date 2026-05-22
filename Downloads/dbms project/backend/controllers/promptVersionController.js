const db = require('../config/db');

const isValidId = (id) => {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
};

// GET /api/prompt-versions/prompt/:promptId
const getVersionsByPrompt = async (req, res) => {
  try {
    if (!isValidId(req.params.promptId)) {
      return res.status(400).json({ message: 'Bad request message' });
    }
    const [rows] = await db.execute(
      'SELECT * FROM prompt_version WHERE prompt_id = ? ORDER BY version_number ASC',
      [req.params.promptId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error('getVersionsByPrompt error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/prompt-versions
const createPromptVersion = async (req, res) => {
  try {
    const { prompt_id, version_number, prompt_text, created_by, change_description } = req.body;
    
    if (!isValidId(prompt_id) || !isValidId(created_by)) {
      return res.status(400).json({ message: 'Bad request message' });
    }
    
    const parsedVersion = Number(version_number);
    if (!Number.isInteger(parsedVersion) || parsedVersion <= 0) {
      return res.status(400).json({ message: 'version_number must be a positive integer' });
    }
    
    if (!prompt_text || typeof prompt_text !== 'string' || prompt_text.trim() === '') {
      return res.status(400).json({ message: 'Bad request message' });
    }

    // Check if prompt_id exists
    const [promptCheck] = await db.execute('SELECT prompt_id FROM prompts WHERE prompt_id = ?', [prompt_id]);
    if (promptCheck.length === 0) {
      return res.status(404).json({ message: 'Not found' });
    }

    const [result] = await db.execute(
      `INSERT INTO prompt_version 
       (prompt_id, version_number, prompt_text, created_by, change_description, created_date) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [prompt_id, parsedVersion, prompt_text.trim(), created_by, change_description?.trim() || null]
    );
    res.status(201).json({ version_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Version number already exists for this prompt' });
    }
    console.error('createPromptVersion error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getVersionsByPrompt,
  createPromptVersion
};
