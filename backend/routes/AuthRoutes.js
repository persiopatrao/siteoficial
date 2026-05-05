// Auth routes
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const SECRET_KEY = 'your_secret_key';

const authDb = new sqlite3.Database(path.join(__dirname, '../auth.db'));
const dataDb = new sqlite3.Database(path.join(__dirname, '../database.db'));

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password, empresa_id } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
  }

  authDb.get("SELECT * FROM users WHERE LOWER(username) = LOWER(?)", [username], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: 'Senha incorreta' });
    }

    if (user.status !== 'aprovado') {
      return res.status(400).json({ error: 'Usuário não aprovado' });
    }

    if (user.role !== 'super_admin' && (!empresa_id || user.empresa_id != empresa_id)) {
      return res.status(400).json({ error: 'Escola incorreta' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, empresa_id: user.empresa_id },
      SECRET_KEY
    );

    res.json({ token, role: user.role });
  });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, password, empresa_id } = req.body;

  if (!username || !password || !empresa_id) {
    return res.status(400).json({ error: 'Usuário, senha e escola são obrigatórios' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  authDb.run(
    "INSERT INTO users (username, password, role, empresa_id, status) VALUES (?, ?, 'usuario', ?, 'pendente')",
    [username, hashedPassword, empresa_id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Erro ao registrar usuário' });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

module.exports = router;
