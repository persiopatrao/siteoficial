// Users controller
const User = require('../models/User');

class UsersController {
  static async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, status, role, search } = req.query;
      const empresa_id = req.user.role === 'super_admin' ? null : req.user.empresa_id;

      const statusMap = {
        pending: 'pendente',
        active: 'aprovado',
        rejected: 'rejeitado'
      };

      const roleMap = {
        user: 'user',
        usuario: 'user',
        admin: 'admin',
        super_admin: 'super_admin'
      };

      const filters = {
        empresa_id,
        status: status ? statusMap[status] || status : undefined,
        role: role ? roleMap[role] || role : undefined,
        search,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      const users = await User.findAll(filters);
      const stats = await User.getStats(empresa_id);
      const normalizedUsers = users.map((u) => ({
        ...u,
        role: u.role === 'usuario' ? 'user' : u.role,
        status: u.status === 'aprovado' ? 'active' : u.status === 'pendente' ? 'pending' : u.status === 'rejeitado' ? 'rejected' : u.status,
      }));

      res.json({
        users: normalizedUsers,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  }

  static async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['aprovado', 'rejeitado', 'pendente'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }

      // Check permissions
      if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const result = await User.updateStatus(id, status);
      res.json({ message: 'Status atualizado com sucesso', changes: result.changes });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  }

  static async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const normalizedRole = role === 'usuario' ? 'user' : role;

      if (!['super_admin', 'admin', 'user'].includes(normalizedRole)) {
        return res.status(400).json({ error: 'Role inválido' });
      }

      // Only super_admin can change roles
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const result = await User.updateRole(id, normalizedRole);
      res.json({ message: 'Role atualizado com sucesso', changes: result.changes });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ error: 'Erro ao atualizar role' });
    }
  }

  static async approveUser(req, res) {
    try {
      const { id } = req.params;

      if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const result = await User.updateStatus(id, 'aprovado');
      res.json({ message: 'Usuário aprovado com sucesso', changes: result.changes });
    } catch (error) {
      console.error('Approve user error:', error);
      res.status(500).json({ error: 'Erro ao aprovar usuário' });
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      if (Number(req.user.id) === Number(id)) {
        return res.status(400).json({ error: 'Não é possível excluir seu próprio usuário' });
      }

      const result = await User.deleteUser(id);
      if (!result.changes) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({ message: 'Usuário excluído com sucesso', changes: result.changes });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
  }

  static async createUser(req, res) {
    try {
      const { username, email, password, role, empresa_id } = req.body;

      if (!username || !password || !empresa_id || !role) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      if (!['admin', 'user', 'usuario'].includes(role)) {
        return res.status(400).json({ error: 'Role inválido' });
      }

      const normalizedRole = role === 'usuario' ? 'user' : role;

      // Check permissions
      if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const result = await User.create({ username, email, password, empresa_id, role: normalizedRole });
      res.status(201).json({ id: result.id, message: 'Usuário criado com sucesso' });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  static async resetIncidentTotals(req, res) {
    try {
      // Only super_admin can reset incident totals
      if (req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Reset incident totals for all users
      await User.resetIncidentTotals();

      res.json({ message: 'Total de ocorrências zerado para todos os usuários' });
    } catch (error) {
      console.error('Reset incident totals error:', error);
      res.status(500).json({ error: 'Erro ao zerar total de ocorrências' });
    }
  }
}

module.exports = UsersController;