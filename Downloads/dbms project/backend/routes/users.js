const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

// TODO: Apply JWT authentication middleware to protected routes
// const { authenticate } = require('../middleware/auth');

// GET    /api/users?page=1&limit=10
router.get('/', getAllUsers);

// GET    /api/users/:id
router.get('/:id', getUserById);

// POST   /api/users              (public — registration)
router.post('/', createUser);

// PUT    /api/users/:id           (protected — requires auth)
// TODO: router.put('/:id', authenticate, updateUser);
router.put('/:id', updateUser);

// DELETE /api/users/:id           (protected — requires auth)
// TODO: router.delete('/:id', authenticate, deleteUser);
router.delete('/:id', deleteUser);

module.exports = router;
