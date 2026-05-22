const express = require('express');
const router = express.Router();
const {
  getAllPrompts,
  getPromptById,
  getPromptsByUser,
  getPromptsByCategory,
  createPrompt,
  updatePrompt,
  deletePrompt,
  searchPrompts,
} = require('../controllers/promptController');

// TODO: Apply JWT authentication middleware to protected routes
// const { authenticate } = require('../middleware/auth');

// GET    /api/prompts
router.get('/', getAllPrompts);

// GET    /api/prompts/search?q=keyword   ← must be BEFORE /:id
router.get('/search', searchPrompts);

// GET    /api/prompts/user/:userId
router.get('/user/:userId', getPromptsByUser);

// GET    /api/prompts/category/:categoryId
router.get('/category/:categoryId', getPromptsByCategory);

// GET    /api/prompts/:id
router.get('/:id', getPromptById);

// POST   /api/prompts                    (protected)
// TODO: router.post('/', authenticate, createPrompt);
router.post('/', createPrompt);

// PUT    /api/prompts/:id                (protected)
// TODO: router.put('/:id', authenticate, updatePrompt);
router.put('/:id', updatePrompt);

// DELETE /api/prompts/:id                (protected)
// TODO: router.delete('/:id', authenticate, deletePrompt);
router.delete('/:id', deletePrompt);

module.exports = router;
