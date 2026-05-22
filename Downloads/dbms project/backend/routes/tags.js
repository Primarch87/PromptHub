const express = require('express');
const router = express.Router();
const { getAllTags, getTagsByPrompt, createTag, assignTagToPrompt } = require('../controllers/tagController');

router.get('/', getAllTags);
router.get('/prompt/:promptId', getTagsByPrompt);
router.post('/', createTag);
router.post('/assign', assignTagToPrompt);

module.exports = router;
