const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Import organized routes and models
const AuthRoutes = require('./routes/AuthRoutes');
const UsersRoutes = require('./routes/UsersRoutes');
const IncidentsRoutes = require('./routes/IncidentsRoutes');
const CompaniesRoutes = require('./routes/CompaniesRoutes');
require('./models/Database'); // Initialize database

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// API Routes MUST come BEFORE static files
// (new organized structure)
app.use('/api/auth', AuthRoutes);
app.use('/api/users', UsersRoutes);
app.use('/api/incidents', IncidentsRoutes);
app.use('/api/empresas', CompaniesRoutes);

// Servir arquivos estáticos do frontend
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Fallback para SPA: todas as rotas não-API servem o frontend
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Rota não encontrada' });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const startServer = (port, isFallback = false) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && !isFallback) {
      const fallbackPort = port === 3000 ? 3001 : port + 1;
      console.warn(`Port ${port} already in use. Trying port ${fallbackPort}...`);
      startServer(fallbackPort, true);
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });
};

startServer(PORT);
