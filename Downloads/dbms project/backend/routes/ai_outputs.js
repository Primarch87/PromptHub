const express = require('express');
const router = express.Router();
const { getOutputsByPrompt, createOutput, compareOutputs } = require('../controllers/aiOutputController');

router.get('/prompt/:promptId', getOutputsByPrompt);
router.post('/', createOutput);
router.get('/compare/:promptId', compareOutputs);

module.exports = router;
