// Companies routes
const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { dataDb } = require('../models/Database');

const router = express.Router();

// GET /api/empresas - Public route for login
router.get('/', (req, res) => {
  dataDb.all('SELECT id, nome FROM empresas ORDER BY nome', [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar empresas:', err);
      return res.status(500).json({ error: 'Erro ao buscar empresas' });
    }
    res.json(rows);
  });
});

// All routes below require authentication
router.use(verifyToken);

// POST /api/empresas - Create a new school
router.post('/', (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { nome } = req.body;
  if (!nome) {
    return res.status(400).json({ error: 'Nome da escola é obrigatório' });
  }

  dataDb.run('INSERT INTO empresas (nome) VALUES (?)', [nome], function(err) {
    if (err) {
      console.error('Erro ao criar empresa:', err);
      return res.status(500).json({ error: 'Erro ao criar empresa' });
    }
    res.status(201).json({ id: this.lastID, nome });
  });
});

// DELETE /api/empresas/:id
router.delete('/:id', (req, res) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { id } = req.params;
  dataDb.run('DELETE FROM empresas WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Erro ao excluir empresa:', err);
      return res.status(500).json({ error: 'Erro ao excluir empresa' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    res.json({ message: 'Empresa excluída com sucesso', id: parseInt(id) });
  });
});

module.exports = router;