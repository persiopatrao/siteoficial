// Incidents routes
const express = require('express');
const { verifyToken } = require('../middleware/auth');
const IncidentsController = require('../controllers/IncidentsController');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/incidents
router.get('/', IncidentsController.getIncidents);

// POST /api/incidents
router.post('/', IncidentsController.createIncident);

// PUT /api/incidents/:id
router.put('/:id', IncidentsController.updateIncident);

// DELETE /api/incidents/:id
router.delete('/:id', IncidentsController.deleteIncident);

module.exports = router;
