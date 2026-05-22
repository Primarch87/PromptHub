const express = require('express');
const router = express.Router();
const { getBookmarksByUser, createBookmark, deleteBookmark } = require('../controllers/bookmarkController');

router.get('/user/:userId', getBookmarksByUser);
router.post('/', createBookmark);
router.delete('/:id', deleteBookmark);

module.exports = router;
