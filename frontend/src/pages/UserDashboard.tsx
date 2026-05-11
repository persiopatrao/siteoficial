import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { LogOut, Plus, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface Occurrence {
  id: number;
  aluno: string;
  turma: string;
  descricao: string;
  data: string;
  hora: string;
  status?: 'pending' | 'approved' | 'aprovado';
  created_by?: number;
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { occurrences, createOccurrence, loading } = useData();
  const [tab, setTab] = useState<'create' | 'my-reports'>('create');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    aluno: '',
    turma: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    console.log('[ACTION] Registrando nova ocorrência:', formData);

    try {
      await createOccurrence(formData);
      setSuccess('Ocorrência registrada com sucesso! Aguardando aprovação do administrador.');
      setFormData({
        aluno: '',
        turma: '',
        descricao: '',
        data: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().slice(0, 5),
      });
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('[ERROR] Falha ao registrar ocorrência:', err);
      setError('Erro ao registrar ocorrência. Tente novamente.');
    }
  };

  const handleLogout = () => {
    console.log('[ACTION] Usuário desconectando');
    logout();
    navigate('/');
  };

  const myOccurrences = occurrences.filter((o: Occurrence) => o.created_by === Number(user?.id)) || [];

  const stats = {
    total: myOccurrences.length,
    pending: myOccurrences.filter((o: Occurrence) => o.status !== 'approved' && o.status !== 'aprovado').length,
    approved: myOccurrences.filter((o: Occurrence) => o.status === 'approved' || o.status === 'aprovado').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
      <nav className="bg-white/5 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-accent-50">SIGE</h1>
            <p className="text-xs text-accent-400">Sistema Integrado de Gestão Escolar</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="badge bg-blue-500/40">Usuário Comum</span>
            <span className="text-accent-300">{user?.username}</span>
            <button onClick={handleLogout} className="btn-ghost">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8 border-b border-white/10 flex-wrap">
          <button
            onClick={() => setTab('create')}
            className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              tab === 'create'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-accent-400 hover:text-accent-300'
            }`}
          >
            <Plus className="w-4 h-4" />
            Nova Ocorrência
          </button>
          <button
            onClick={() => setTab('my-reports')}
            className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              tab === 'my-reports'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-accent-400 hover:text-accent-300'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Minhas Ocorrências ({stats.total})
          </button>
        </div>

        {tab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <Plus className="w-6 h-6 text-blue-300" />
                  <h2 className="text-2xl font-bold text-accent-50">Registrar Ocorrência</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nome do Aluno</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="João Silva"
                        value={formData.aluno}
                        onChange={(e) => setFormData({ ...formData, aluno: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Turma/Série</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="5º Ano A"
                        value={formData.turma}
                        onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Descrição da Ocorrência</label>
                    <textarea
                      className="input resize-none h-32"
                      placeholder="Descreva brevemente o ocorrido..."
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Data</label>
                      <input
                        type="date"
                        className="input"
                        value={formData.data}
                        onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Hora</label>
                      <input
                        type="time"
                        className="input"
                        value={formData.hora}
                        onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 flex items-center gap-2">
                      ✓ {success}
                    </div>
                  )}

                  <button type="submit" className="btn-primary w-full" disabled={loading}>
                    {loading ? 'Salvando...' : 'Registrar Ocorrência'}
                  </button>

                  <div className="text-xs text-accent-400 mt-4 p-3 rounded bg-white/5">
                    <strong>ℹ️ Informação:</strong> Sua ocorrência será enviada ao administrador da sua unidade para análise e aprovação.
                  </div>
                </form>
              </div>
            </div>

            <div>
              <div className="card">
                <h3 className="text-lg font-bold text-accent-50 mb-4">Resumo</h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-accent-400">Total de Ocorrências</p>
                    <p className="text-2xl font-bold text-blue-300">{stats.total}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-accent-400">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-accent-400">Aprovadas</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.approved}</p>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded bg-white/5 text-xs text-accent-400 space-y-1">
                  <p><strong>Status:</strong> Online</p>
                  <p><strong>Sincronização:</strong> OK</p>
                  <p><strong>Usuário:</strong> {user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'my-reports' && (
          <div className="space-y-4">
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

            <div className="space-y-3">
              {myOccurrences.length === 0 ? (
                <div className="card text-center py-8">
                  <AlertCircle className="w-12 h-12 text-accent-400 mx-auto mb-3 opacity-50" />
                  <p className="text-accent-400">Nenhuma ocorrência registrada</p>
                  <button
                    onClick={() => setTab('create')}
                    className="btn-primary text-sm mt-3"
                  >
                    Criar Primeira Ocorrência
                  </button>
                </div>
              ) : (
                myOccurrences.map((occ) => (
                  <div key={occ.id} className="card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-accent-50">{occ.aluno}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            occ.status === 'approved' || occ.status === 'aprovado'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {occ.status === 'approved' || occ.status === 'aprovado' ? 'Aprovada' : 'Pendente'}
                          </span>
                        </div>
                        <p className="text-sm text-accent-400">Turma: <span className="text-accent-100">{occ.turma}</span></p>
                        <p className="text-sm text-accent-400">{occ.data} às {occ.hora}</p>
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
                        <pre className="bg-black/30 p-2 rounded text-xs text-blue-300 overflow-x-auto">
                          {JSON.stringify(occ, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
