import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { LogOut, BarChart3, AlertCircle, Users, Check, X, Eye, EyeOff } from 'lucide-react';

import API_URL from '../api';

interface Occurrence {
  id: number;
  aluno: string;
  turma: string;
  descricao: string;
  data: string;
  hora: string;
  status?: 'pending' | 'approved' | 'aprovado' | 'rejected' | 'rejeitado';
  created_by?: number;
  created_by_name?: string;
}

interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  empresa_id: number;
  status: 'pending' | 'active' | 'pendente' | 'aprovado' | 'rejeitado';
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, user, token } = useAuth();
  const { occurrences, createOccurrence, refreshOccurrences } = useData();
  const [tab, setTab] = useState<'dashboard' | 'occurrences' | 'users'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [occsData, setOccsData] = useState<Occurrence[]>([]);
  const [schoolUsers, setSchoolUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [occFilter, setOccFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [newIncident, setNewIncident] = useState({
    aluno: '',
    turma: '',
    descricao: '',
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
  });

  const fetchSchoolUsers = async () => {
    if (!token || !user?.empresa_id) return;
    setUsersLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const allUsers = Array.isArray(data) ? data : data.users || [];
        // Filtrar apenas usuários da mesma escola
        const filtered = allUsers.filter((u: AdminUser) => u.empresa_id === user.empresa_id);
        setSchoolUsers(filtered);
        console.log('[LOAD] Usuários da escola carregados:', filtered.length);
      }
    } catch (error) {
      console.error('[ERROR] Falha ao carregar usuários:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    setOccsData(occurrences);
  }, [occurrences]);

  useEffect(() => {
    if (tab === 'users') {
      fetchSchoolUsers();
    }
  }, [tab, token]);

  const handleApproveUser = async (userId: number) => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        console.log(`[SUCCESS] Usuário ${userId} aprovado`);
        await fetchSchoolUsers();
      }
    } catch (error) {
      console.error('[ERROR] Falha ao aprovar usuário:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('[ACTION] Admin desconectando');
    logout();
    navigate('/');
  };

  const handleApprove = async (id: number) => {
    if (!token) return;
    setLoading(true);
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
        setOccsData(occsData.map(o => o.id === id ? {...o, status: 'approved'} : o));
      }
    } catch (error) {
      console.error('[ERROR] Falha ao aprovar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: number) => {
    if (!token) return;
    setLoading(true);
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
        setOccsData(occsData.map(o => o.id === id ? { ...o, status: 'rejected' } : o));
      }
    } catch (error) {
      console.error('[ERROR] Falha ao rejeitar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setCreateError('');
    setCreateSuccess('');
    setLoading(true);

    try {
      await createOccurrence(newIncident);
      await refreshOccurrences();
      setCreateSuccess('Ocorrência criada com sucesso e enviada ao responsável da escola.');
      setNewIncident({
        aluno: '',
        turma: '',
        descricao: '',
        data: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().slice(0, 5),
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('[ERROR] Falha ao criar ocorrência:', error);
      setCreateError('Erro ao criar ocorrência. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: occsData.length,
    pending: occsData.filter((o) => !o.status || (o.status !== 'approved' && o.status !== 'aprovado' && o.status !== 'rejected')).length,
    approved: occsData.filter((o) => o.status === 'approved' || o.status === 'aprovado').length,
    rejected: occsData.filter((o) => o.status === 'rejected').length,
    today: occsData.filter((o) => o.data === new Date().toISOString().split('T')[0]).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
      <nav className="bg-white/5 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-accent-50">SIGE - Admin</h1>
            <p className="text-xs text-accent-400">Gestão de Ocorrências</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="badge bg-blue-500/40">Administrador</span>
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
            onClick={() => setTab('dashboard')}
            className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              tab === 'dashboard'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-accent-400 hover:text-accent-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setTab('occurrences')}
            className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              tab === 'occurrences'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-accent-400 hover:text-accent-300'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Ocorrências ({stats.total})
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              tab === 'users'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-accent-400 hover:text-accent-300'
            }`}
          >
            <Users className="w-4 h-4" />
            Usuários
          </button>
        </div>

        {tab === 'dashboard' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <p className="text-accent-400 text-sm mb-2">Total</p>
                <p className="text-3xl font-bold text-blue-300">{stats.total}</p>
              </div>
              <div className="card">
                <p className="text-accent-400 text-sm mb-2">Pendentes</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <div className="card">
                <p className="text-accent-400 text-sm mb-2">Aprovadas</p>
                <p className="text-3xl font-bold text-blue-400">{stats.approved}</p>
              </div>
              <div className="card">
                <p className="text-accent-400 text-sm mb-2">Hoje</p>
                <p className="text-3xl font-bold text-purple-400">{stats.today}</p>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-accent-50 mb-4">Últimas Ocorrências</h3>
              <div className="space-y-3">
                {occsData.slice(0, 5).map((occ) => (
                  <div key={occ.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-accent-50">{occ.aluno}</p>
                        <p className="text-xs text-accent-400">{occ.turma} - {occ.data} às {occ.hora}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        occ.status === 'approved' || occ.status === 'aprovado'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {occ.status === 'approved' || occ.status === 'aprovado' ? 'Aprovada' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'occurrences' && (
          <div className="space-y-4">
            <div className="flex flex-col xl:flex-row gap-3 mb-4 justify-between items-start">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1">
                <div className="card min-w-[180px]">
                  <p className="text-xs text-accent-400">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                <div className="card min-w-[180px]">
                  <p className="text-xs text-accent-400">Aprovadas</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.approved}</p>
                </div>
                <div className="card min-w-[180px]">
                  <p className="text-xs text-accent-400">Rejeitadas</p>
                  <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                </div>
                <div className="card min-w-[180px]">
                  <p className="text-xs text-accent-400">Total</p>
                  <p className="text-2xl font-bold text-blue-300">{stats.total}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setOccFilter('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${occFilter === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-white/5 text-accent-400 border border-white/10'}`}
                  >
                    Pendentes
                  </button>
                  <button
                    onClick={() => setOccFilter('approved')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${occFilter === 'approved' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-accent-400 border border-white/10'}`}
                  >
                    Aprovadas
                  </button>
                  <button
                    onClick={() => setOccFilter('rejected')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${occFilter === 'rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-white/5 text-accent-400 border border-white/10'}`}
                  >
                    Rejeitadas
                  </button>
                  <button
                    onClick={() => setOccFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${occFilter === 'all' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-white/5 text-accent-400 border border-white/10'}`}
                  >
                    Todas
                  </button>
                </div>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="btn-primary text-sm self-stretch"
                >
                  {showCreateForm ? 'Fechar formulário' : 'Criar Ocorrência'}
                </button>
              </div>
            </div>

            {showCreateForm && (
              <div className="card">
                <h3 className="text-lg font-bold text-accent-50 mb-4">Criar nova ocorrência</h3>
                <form onSubmit={handleCreateIncident} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nome do aluno</label>
                      <input
                        type="text"
                        className="input"
                        value={newIncident.aluno}
                        onChange={(e) => setNewIncident({ ...newIncident, aluno: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Turma/Série</label>
                      <input
                        type="text"
                        className="input"
                        value={newIncident.turma}
                        onChange={(e) => setNewIncident({ ...newIncident, turma: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Descrição</label>
                    <textarea
                      className="input resize-none h-28"
                      value={newIncident.descricao}
                      onChange={(e) => setNewIncident({ ...newIncident, descricao: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Data</label>
                      <input
                        type="date"
                        className="input"
                        value={newIncident.data}
                        onChange={(e) => setNewIncident({ ...newIncident, data: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Hora</label>
                      <input
                        type="time"
                        className="input"
                        value={newIncident.hora}
                        onChange={(e) => setNewIncident({ ...newIncident, hora: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {createError && (
                    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300">
                      {createError}
                    </div>
                  )}
                  {createSuccess && (
                    <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300">
                      {createSuccess}
                    </div>
                  )}

                  <button type="submit" className="btn-primary w-full" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar ocorrência'}
                  </button>
                </form>
              </div>
            )}

            <div className="space-y-3">
              {occsData
                .filter((occ) => {
                  if (occFilter === 'all') return true;
                  if (occFilter === 'pending') return !occ.status || (occ.status !== 'approved' && occ.status !== 'aprovado' && occ.status !== 'rejected' && occ.status !== 'rejeitado');
                  if (occFilter === 'approved') return occ.status === 'approved' || occ.status === 'aprovado';
                  return occ.status === 'rejected' || occ.status === 'rejeitado';
                })
                .map((occ) => (
                  <div key={occ.id} className="card">
                  <div className="flex flex-col gap-3 md:gap-0 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-bold text-accent-50">{occ.aluno}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          occ.status === 'approved' || occ.status === 'aprovado'
                            ? 'bg-blue-500/20 text-blue-300'
                            : occ.status === 'rejected' || occ.status === 'rejeitado'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {occ.status === 'approved' || occ.status === 'aprovado'
                            ? 'Aprovada'
                            : occ.status === 'rejected' || occ.status === 'rejeitado'
                            ? 'Rejeitada'
                            : 'Pendente'}
                        </span>
                      </div>
                      <p className="text-sm text-accent-400">Criada por: <span className="text-accent-100">{occ.created_by_name || `ID ${occ.created_by}`}</span></p>
                      <p className="text-sm text-accent-400">Turma: <span className="text-accent-100">{occ.turma}</span></p>
                      <p className="text-sm text-accent-400">{occ.data} às {occ.hora}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {(!occ.status || (occ.status !== 'approved' && occ.status !== 'aprovado' && occ.status !== 'rejected' && occ.status !== 'rejeitado')) && (
                        <>
                          <button
                            onClick={() => handleApprove(occ.id)}
                            className="btn-primary text-sm"
                            disabled={loading}
                          >
                            <Check className="w-4 h-4" />
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleReject(occ.id)}
                            className="btn-ghost text-red-400 border border-red-500/30 text-sm"
                            disabled={loading}
                          >
                            <X className="w-4 h-4" />
                            Rejeitar
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setExpandedId(expandedId === occ.id ? null : occ.id)}
                        className="btn-ghost text-sm"
                      >
                        {expandedId === occ.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {expandedId === occ.id && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-accent-300 mb-3">
                        <strong>Descrição:</strong> {occ.descricao}
                      </p>
                      <pre className="bg-black/30 p-2 rounded text-xs text-blue-300 mb-4 overflow-x-auto">
                        {JSON.stringify(occ, null, 2)}
                      </pre>

                      {(!occ.status || (occ.status !== 'approved' && occ.status !== 'aprovado' && occ.status !== 'rejected' && occ.status !== 'rejeitado')) && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(occ.id)}
                            className="btn-primary flex-1 text-sm"
                            disabled={loading}
                          >
                            <Check className="w-4 h-4" />
                            Aprovar
                          </button>
                          <button
                            onClick={() => handleReject(occ.id)}
                            className="btn-ghost text-red-400 flex-1 text-sm border border-red-500/30"
                            disabled={loading}
                          >
                            <X className="w-4 h-4" />
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="card">
                <p className="text-xs text-accent-400">Usuários Ativos</p>
                <p className="text-2xl font-bold text-blue-300">
                  {schoolUsers.filter(u => u.status === 'active' || u.status === 'aprovado').length}
                </p>
              </div>
              <div className="card">
                <p className="text-xs text-accent-400">Pendentes de Aprovação</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {schoolUsers.filter(u => u.status === 'pending' || u.status === 'pendente').length}
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchSchoolUsers()}
              className="btn-secondary text-sm w-full"
              disabled={usersLoading}
            >
              {usersLoading ? 'Atualizando...' : 'Atualizar Usuários'}
            </button>

            <div className="space-y-3">
              {schoolUsers.length === 0 ? (
                <div className="card text-center py-8">
                  <p className="text-accent-400">Nenhum usuário nesta unidade</p>
                </div>
              ) : (
                <>
                  {schoolUsers.filter(u => u.status === 'pending' || u.status === 'pendente').length > 0 && (
                    <>
                      <h3 className="font-bold text-yellow-400 text-sm mt-4">Usuários Pendentes</h3>
                      {schoolUsers.filter(u => u.status === 'pending' || u.status === 'pendente').map(user => (
                        <div key={user.id} className="card">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-accent-50">{user.username}</p>
                              <p className="text-xs text-accent-400">{user.email}</p>
                              <p className="text-xs text-accent-400 mt-1">
                                Cargo: <span className="font-medium">{user.role === 'admin' ? 'Administrador' : 'Usuário Comum'}</span>
                              </p>
                            </div>
                            <button
                              onClick={() => handleApproveUser(user.id)}
                              className="btn-primary text-sm"
                              disabled={usersLoading}
                              title="Aprovar usuário"
                            >
                              <Check className="w-4 h-4" />
                              Aprovar
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {schoolUsers.filter(u => u.status === 'active' || u.status === 'aprovado').length > 0 && (
                    <>
                      <h3 className="font-bold text-blue-300 text-sm mt-4">Usuários Ativos</h3>
                      {schoolUsers.filter(u => u.status === 'active' || u.status === 'aprovado').map(user => (
                        <div key={user.id} className="card">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-accent-50">{user.username}</p>
                              <p className="text-xs text-accent-400">{user.email}</p>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-1 ${
                                user.role === 'admin' 
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-slate-500/20 text-slate-300'
                              }`}>
                                {user.role === 'admin' ? 'Administrador' : 'Usuário Comum'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
