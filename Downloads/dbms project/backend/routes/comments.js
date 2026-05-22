const express = require('express');
const router = express.Router();
const { getCommentsByPrompt, createComment, upvoteComment, deleteComment } = require('../controllers/commentController');

router.get('/prompt/:promptId', getCommentsByPrompt);
router.post('/', createComment);
router.put('/:id/upvote', upvoteComment);
router.delete('/:id', deleteComment);

module.exports = router;
