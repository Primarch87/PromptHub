const express = require('express');
const router = express.Router();
const { getRatingsByPrompt, createRating, deleteRating } = require('../controllers/ratingController');

router.get('/prompt/:promptId', getRatingsByPrompt);
router.post('/', createRating);
router.delete('/:id', deleteRating);

module.exports = router;
