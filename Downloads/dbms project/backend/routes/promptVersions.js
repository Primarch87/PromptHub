const express = require('express');
const router = express.Router();
const promptVersionController = require('../controllers/promptVersionController');

router.get('/prompt/:promptId', promptVersionController.getVersionsByPrompt);
router.post('/', promptVersionController.createPromptVersion);

module.exports = router;
