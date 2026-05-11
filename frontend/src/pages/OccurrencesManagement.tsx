import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Check, X, Eye, EyeOff } from 'lucide-react';

interface Occurrence {
  id: number;
  aluno: string;
  turma: string;
  descricao: string;
  data: string;
  hora: string;
  empresa_id: number;
  created_by: number;
  created_by_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

import API_URL from '../api';

export default function OccurrencesManagement() {
  const { token } = useAuth();
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved'>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchOccurrences = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/incidents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const occs = Array.isArray(data) ? data : data.incidents || [];
        setOccurrences(occs);
        console.log(`[LOAD] ${occs.length} ocorrências carregadas`);
      }
    } catch (error) {
      console.error('[ERROR] Falha ao carregar ocorrências:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccurrences();
  }, [token]);

  const handleApprove = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/incidents/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        console.log(`[SUCCESS] Ocorrência ${id} aprovada`);
        await fetchOccurrences();
      }
    } catch (error) {
      console.error('[ERROR] Falha ao aprovar:', error);
    }
  };

  const handleReject = async (id: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/incidents/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        console.log(`[SUCCESS] Ocorrência ${id} rejeitada`);
        await fetchOccurrences();
      }
    } catch (error) {
      console.error('[ERROR] Falha ao rejeitar:', error);
    }
  };

  const filteredOccurrences = occurrences.filter(occ => {
    if (filterStatus === 'all') return true;
    return occ.status === filterStatus;
  });

  const stats = {
    total: occurrences.length,
    pending: occurrences.filter(o => o.status === 'pending').length,
    approved: occurrences.filter(o => o.status === 'approved').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-accent-50 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-blue-300" />
          Gerenciar Ocorrências
        </h2>
        <button onClick={() => fetchOccurrences()} className="btn-secondary text-sm" disabled={loading}>
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-accent-400 text-sm">Total</p>
          <p className="text-3xl font-bold text-blue-300">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-accent-400 text-sm">Pendentes</p>
          <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="card">
          <p className="text-accent-400 text-sm">Aprovadas</p>
          <p className="text-3xl font-bold text-blue-400">{stats.approved}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            filterStatus === 'all'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-white/5 text-accent-400 border border-white/10'
          }`}
        >
          Todas ({occurrences.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            filterStatus === 'pending'
              ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
              : 'bg-white/5 text-accent-400 border border-white/10'
          }`}
        >
          Pendentes ({stats.pending})
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            filterStatus === 'approved'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              : 'bg-white/5 text-accent-400 border border-white/10'
          }`}
        >
          Aprovadas ({stats.approved})
        </button>
      </div>

      <div className="space-y-3">
        {filteredOccurrences.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-accent-400">Nenhuma ocorrência nesta categoria</p>
          </div>
        ) : (
          filteredOccurrences.map((occ) => (
            <div key={occ.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-accent-50">{occ.aluno}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      occ.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : occ.status === 'approved'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {occ.status === 'pending' ? 'Pendente' : occ.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
                    </span>
                  </div>
                  <p className="text-sm text-accent-400">Turma: <span className="text-accent-100">{occ.turma}</span></p>
                  <p className="text-sm text-accent-400">Data/Hora: <span className="text-accent-100">{occ.data} às {occ.hora}</span></p>
                </div>
                <button
                  onClick={() => setExpandedId(expandedId === occ.id ? null : occ.id)}
                  className="btn-ghost text-sm ml-2"
                >
                  {expandedId === occ.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {expandedId === occ.id && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-accent-300 mb-3">
                    <strong>Descrição:</strong> {occ.descricao}
                  </p>
                  <pre className="bg-black/30 p-2 rounded text-xs text-blue-300 mb-4 overflow-x-auto">
                    {JSON.stringify(occ, null, 2)}
                  </pre>

                  {occ.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(occ.id)}
                        className="btn-primary flex-1 text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleReject(occ.id)}
                        className="btn-ghost text-red-400 flex-1 text-sm border border-red-500/30"
                      >
                        <X className="w-4 h-4" />
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
