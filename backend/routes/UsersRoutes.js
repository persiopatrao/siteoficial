// Users routes
const express = require('express');
const UsersController = require('../controllers/UsersController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/users/stats
router.get('/stats', async (req, res) => {
  try {
    const User = require('../models/User');
    const stats = await User.getStats(req.user.empresa_id);
    res.json(stats);
  } catch(error) {
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// GET /api/users
router.get('/', UsersController.getUsers);

// POST /api/users
router.post('/', UsersController.createUser);

// PUT /api/users/:id/status
router.put('/:id/status', UsersController.updateUserStatus);

// PUT /api/users/:id/approve
router.put('/:id/approve', UsersController.approveUser);

// PUT /api/users/:id/role
router.put('/:id/role', UsersController.updateUserRole);

// DELETE /api/users/:id
router.delete('/:id', UsersController.deleteUser);

// POST /api/users/reset-incident-totals
router.post('/reset-incident-totals', UsersController.resetIncidentTotals);

module.exports = router;