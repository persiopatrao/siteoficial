import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, Trash2 } from 'lucide-react';

interface School {
  id: number;
  nome: string;
  created_at?: string;
  user_count?: number;
  occurrence_count?: number;
}

import API_URL from '../api';

export default function SchoolsManagement() {
  const { token } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchSchools = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/empresas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSchools(Array.isArray(data) ? data : data.schools || []);
        console.log(`[LOAD] ${(Array.isArray(data) ? data : data.schools || []).length} escolas carregadas`);
      }
    } catch (error) {
      console.error('[ERROR] Falha ao carregar escolas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [token]);

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newSchoolName) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/empresas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome: newSchoolName }),
      });

      if (response.ok) {
        const newSchool = await response.json();
        console.log('[SUCCESS] Escola criada:', newSchool);
        setNewSchoolName('');
        await fetchSchools();
      }
    } catch (error) {
      console.error('[ERROR] Falha ao criar escola:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchool = async (id: number, name: string) => {
    if (!token || !window.confirm(`Confirmar exclusão de "${name}"?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/empresas/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log(`[SUCCESS] Escola ${id} deletada`);
        await fetchSchools();
      }
    } catch (error) {
      console.error('[ERROR] Falha ao deletar escola:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-accent-50 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-300" />
          Gerenciar Escolas
        </h2>
        <button onClick={() => fetchSchools()} className="btn-secondary text-sm" disabled={loading}>
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold text-accent-50 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-300" />
          Criar Nova Escola
        </h3>
        <form onSubmit={handleCreateSchool} className="space-y-3">
          <input
            type="text"
            placeholder="Nome da escola"
            value={newSchoolName}
            onChange={(e) => setNewSchoolName(e.target.value)}
            className="input"
            required
          />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Criando...' : 'Criar Escola'}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-accent-50">Escolas Cadastradas ({schools.length})</h3>
        {schools.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-accent-400">Nenhuma escola cadastrada</p>
          </div>
        ) : (
          schools.map((school) => (
            <div
              key={school.id}
              className="card hover:border-blue-500/50 transition-all"
              onClick={() => {
                console.log('[SELECT] Escola selecionada:', school.nome);
                setExpandedId(expandedId === school.id ? null : school.id);
              }}
            >
              <div className="flex items-center justify-between cursor-pointer">
                <div className="flex-1">
                  <p className="font-bold text-accent-50 text-lg">{school.nome}</p>
                  <p className="text-xs text-accent-400">ID: {school.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-accent-400">Usuários: <span className="font-bold text-blue-300">{school.user_count || 0}</span></p>
                  <p className="text-sm text-accent-400">Ocorrências: <span className="font-bold text-blue-400">{school.occurrence_count || 0}</span></p>
                </div>
              </div>

              {expandedId === school.id && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <div>
                    <p className="text-xs text-accent-400 mb-2">Detalhes JSON:</p>
                    <pre className="bg-black/30 p-3 rounded text-xs text-blue-300 overflow-x-auto max-h-48">
                      {JSON.stringify(school, null, 2)}
                    </pre>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSchool(school.id, school.nome);
                    }}
                    className="btn-ghost text-red-400 w-full border border-red-500/30 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deletar Escola
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
