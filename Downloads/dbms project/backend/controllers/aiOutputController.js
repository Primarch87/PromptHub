const db = require('../config/db');

const isValidId = (id) => {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
};

const getOutputsByPrompt = async (req, res) => {
  try {
    if (!isValidId(req.params.promptId)) {
      return res.status(400).json({ message: 'Invalid prompt ID' });
    }

    const [rows] = await db.query(
      'SELECT output_id, prompt_id, version_id, ai_model_used, output_text, quality_rating, execution_date, response_time_ms FROM ai_outputs WHERE prompt_id = ?',
      [req.params.promptId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createOutput = async (req, res) => {
  try {
    const { prompt_id, version_id, ai_model_used, output_text, quality_rating, response_time_ms } = req.body;
    const parsedQuality = quality_rating === undefined || quality_rating === null || quality_rating === ''
      ? null
      : Number(quality_rating);
    const parsedResponseTime = response_time_ms === undefined || response_time_ms === null || response_time_ms === ''
      ? null
      : Number(response_time_ms);

    if (!prompt_id || !version_id || !ai_model_used || !output_text) {
      return res.status(400).json({ message: 'prompt_id, version_id, ai_model_used, and output_text are required' });
    }
    if (!isValidId(prompt_id) || !isValidId(version_id)) {
      return res.status(400).json({ message: 'prompt_id and version_id must be positive integers' });
    }
    if (typeof ai_model_used !== 'string' || ai_model_used.trim() === '') {
      return res.status(400).json({ message: 'ai_model_used cannot be empty' });
    }
    if (typeof output_text !== 'string' || output_text.trim() === '') {
      return res.status(400).json({ message: 'output_text cannot be empty' });
    }
    if (parsedQuality !== null && (Number.isNaN(parsedQuality) || parsedQuality < 1 || parsedQuality > 5)) {
      return res.status(400).json({ message: 'quality_rating must be between 1 and 5 if provided' });
    }
    if (parsedResponseTime !== null && (!Number.isInteger(parsedResponseTime) || parsedResponseTime < 0)) {
      return res.status(400).json({ message: 'response_time_ms must be a non-negative integer if provided' });
    }

    const [versionRows] = await db.query(
      'SELECT version_id FROM prompt_version WHERE version_id = ? AND prompt_id = ?',
      [version_id, prompt_id]
    );
    if (versionRows.length === 0) {
      return res.status(400).json({ message: 'version_id must belong to the provided prompt_id' });
    }

    const [result] = await db.query(
      'INSERT INTO ai_outputs (prompt_id, version_id, ai_model_used, output_text, quality_rating, execution_date, response_time_ms) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
      [prompt_id, version_id, ai_model_used.trim(), output_text.trim(), parsedQuality, parsedResponseTime]
    );

    res.status(201).json({ message: 'AI output created', output_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const compareOutputs = async (req, res) => {
  try {
    if (!isValidId(req.params.promptId)) {
      return res.status(400).json({ message: 'Invalid prompt ID' });
    }

    const [rows] = await db.query(
      'SELECT ai_model_used, AVG(quality_rating) as avg_rating FROM ai_outputs WHERE prompt_id = ? AND quality_rating IS NOT NULL GROUP BY ai_model_used',
      [req.params.promptId]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getOutputsByPrompt, createOutput, compareOutputs };
