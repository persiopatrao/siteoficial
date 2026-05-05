// Incident model
const { dataDb } = require('./Database');

class Incident {
  static async findById(id) {
    return new Promise((resolve, reject) => {
      dataDb.get("SELECT * FROM incidents WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = "SELECT * FROM incidents WHERE 1=1";
      let params = [];

      if (filters.empresa_id) {
        query += " AND empresa_id = ?";
        params.push(filters.empresa_id);
      }

      if (filters.aluno) {
        query += " AND aluno LIKE ?";
        params.push(`%${filters.aluno}%`);
      }

      if (filters.turma) {
        query += " AND turma LIKE ?";
        params.push(`%${filters.turma}%`);
      }

      if (filters.data_inicio && filters.data_fim) {
        query += " AND data BETWEEN ? AND ?";
        params.push(filters.data_inicio, filters.data_fim);
      }

      query += " ORDER BY data DESC, hora DESC";

      if (filters.limit) {
        query += " LIMIT ?";
        params.push(filters.limit);
      }

      if (filters.offset) {
        query += " OFFSET ?";
        params.push(filters.offset);
      }

      dataDb.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  static async create(incidentData) {
    return new Promise((resolve, reject) => {
      const { aluno, turma, descricao, data, hora, empresa_id, created_by } = incidentData;

      dataDb.run(
        `INSERT INTO incidents (aluno, turma, descricao, data, hora, empresa_id, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [aluno, turma, descricao, data, hora, empresa_id, created_by],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  static async update(id, incidentData) {
    return new Promise((resolve, reject) => {
      const { aluno, turma, descricao, data, hora } = incidentData;

      dataDb.run(
        `UPDATE incidents SET aluno = ?, turma = ?, descricao = ?, data = ?, hora = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [aluno, turma, descricao, data, hora, id],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      dataDb.run("DELETE FROM incidents WHERE id = ?", [id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }

  static async getTotalCount(empresa_id) {
    return new Promise((resolve, reject) => {
      let query = "SELECT COUNT(*) as count FROM incidents";
      let params = [];

      if (empresa_id) {
        query += " WHERE empresa_id = ?";
        params.push(empresa_id);
      }

      dataDb.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });
  }

  static async getStats(empresa_id, months = 6) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT
          strftime('%Y-%m', data) as month,
          COUNT(*) as count
        FROM incidents
      `;
      let params = [];

      if (empresa_id) {
        query += " WHERE empresa_id = ?";
        params.push(empresa_id);
      }

      query += ` AND data >= date('now', '-${months} months')
        GROUP BY strftime('%Y-%m', data)
        ORDER BY month DESC`;

      dataDb.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

module.exports = Incident;
