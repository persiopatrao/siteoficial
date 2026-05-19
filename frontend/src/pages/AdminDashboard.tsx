import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { BarChart3, AlertCircle, Users, Check, X, Eye, EyeOff, Plus } from 'lucide-react';

import Header from '../components/Header';
import StatCard from '../components/StatCard';
import PageTitle from '../components/PageTitle';
import Tabs from '../components/Tabs';
import Alert from '../components/Alert';
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
  const { user, token } = useAuth();
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
      setCreateSuccess('Ocorrência criada com sucesso!');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <PageTitle
          icon={BarChart3}
          title="Painel Administrativo"
          subtitle="Gestão de ocorrências e usuários"
        />

        <Tabs
          tabs={[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'occurrences', label: 'Ocorrências', icon: AlertCircle, badge: stats.total },
            { id: 'users', label: 'Usuários', icon: Users },
          ]}
          activeTab={tab}
          onTabChange={(tabId) => setTab(tabId as 'dashboard' | 'occurrences' | 'users')}
        />

        {tab === 'dashboard' && (
          <div className="animate-slideUp space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total" value={stats.total} icon={AlertCircle} color="primary" />
              <StatCard title="Pendentes" value={stats.pending} icon={AlertCircle} color="orange" />
              <StatCard title="Aprovadas" value={stats.approved} icon={Check} color="emerald" />
              <StatCard title="Hoje" value={stats.today} icon={BarChart3} color="primary" />
            </div>

            <div className="card border-0 shadow-lg">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Últimas Ocorrências</h2>
              <div className="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Aluno</th>
                      <th>Turma</th>
                      <th>Data</th>
                      <th>Status</th>
                      <th>Criado por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {occsData.slice(0, 8).map((occ) => (
                      <tr key={occ.id}>
                        <td className="font-semibold text-slate-900">{occ.aluno}</td>
                        <td>{occ.turma}</td>
                        <td>{occ.data} {occ.hora}</td>
                        <td>
                          <span className={`badge ${
                            occ.status === 'approved' || occ.status === 'aprovado' ? 'badge-success' :
                            occ.status === 'rejected' || occ.status === 'rejeitado' ? 'badge-danger' :
                            'badge-warning'
                          }`}>
                            {occ.status === 'approved' || occ.status === 'aprovado' ? 'Aprovada' :
                             occ.status === 'rejected' || occ.status === 'rejeitado' ? 'Rejeitada' :
                             'Pendente'}
                          </span>
                        </td>
                        <td className="text-sm text-slate-600">{occ.created_by_name || `ID ${occ.created_by}`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'occurrences' && (
          <div className="animate-slideUp space-y-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'pending', label: 'Pendentes', color: 'badge-warning' },
                  { value: 'approved', label: 'Aprovadas', color: 'badge-success' },
                  { value: 'rejected', label: 'Rejeitadas', color: 'badge-danger' },
                  { value: 'all', label: 'Todas', color: 'badge-primary' },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setOccFilter(filter.value as typeof occFilter)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      occFilter === filter.value ? `${filter.color}` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn btn-primary">
                <Plus size={18} />
                {showCreateForm ? 'Fechar' : 'Nova Ocorrência'}
              </button>
            </div>

            {showCreateForm && (
              <div className="card border-0 shadow-lg animate-slideUp">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Criar Ocorrência</h2>
                <form onSubmit={handleCreateIncident} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nome do Aluno</label>
                      <input type="text" className="input" placeholder="Ex: João Silva" value={newIncident.aluno} onChange={(e) => setNewIncident({ ...newIncident, aluno: e.target.value })} required />
                    </div>
                    <div>
                      <label className="label">Turma/Série</label>
                      <input type="text" className="input" placeholder="Ex: 5º Ano A" value={newIncident.turma} onChange={(e) => setNewIncident({ ...newIncident, turma: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Descrição</label>
                    <textarea className="input resize-none h-32 font-sans" placeholder="Descreva os detalhes..." value={newIncident.descricao} onChange={(e) => setNewIncident({ ...newIncident, descricao: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Data</label>
                      <input type="date" className="input" value={newIncident.data} onChange={(e) => setNewIncident({ ...newIncident, data: e.target.value })} required />
                    </div>
                    <div>
                      <label className="label">Hora</label>
                      <input type="time" className="input" value={newIncident.hora} onChange={(e) => setNewIncident({ ...newIncident, hora: e.target.value })} required />
                    </div>
                  </div>
                  {createError && <Alert type="error" title="Erro" message={createError} dismissible />}
                  {createSuccess && <Alert type="success" title="Sucesso!" message={createSuccess} dismissible />}
                  <button type="submit" disabled={loading} className="w-full btn btn-primary justify-center py-3 disabled:opacity-60">
                    {loading ? 'Criando...' : 'Criar Ocorrência'}
                  </button>
                </form>
              </div>
            )}

            <div className="space-y-4">
              {occsData.filter((occ) => occFilter === 'all' || (occFilter === 'pending' && (!occ.status || (occ.status !== 'approved' && occ.status !== 'aprovado' && occ.status !== 'rejected'))) || (occFilter === 'approved' && (occ.status === 'approved' || occ.status === 'aprovado')) || (occFilter === 'rejected' && occ.status === 'rejected')).length === 0 ? (
                <div className="card border-0 shadow-lg text-center py-12">
                  <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-semibold">Nenhuma ocorrência neste filtro</p>
                </div>
              ) : (
                occsData
                  .filter((occ) => occFilter === 'all' || (occFilter === 'pending' && (!occ.status || (occ.status !== 'approved' && occ.status !== 'aprovado' && occ.status !== 'rejected'))) || (occFilter === 'approved' && (occ.status === 'approved' || occ.status === 'aprovado')) || (occFilter === 'rejected' && occ.status === 'rejected'))
                  .map((occ) => (
                    <div key={occ.id} className="card border-0 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between gap-4 flex-wrap md:flex-nowrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-bold text-slate-900">{occ.aluno}</h3>
                            <span className={`badge ${occ.status === 'approved' || occ.status === 'aprovado' ? 'badge-success' : occ.status === 'rejected' || occ.status === 'rejeitado' ? 'badge-danger' : 'badge-warning'}`}>
                              {occ.status === 'approved' || occ.status === 'aprovado' ? 'Aprovada' : occ.status === 'rejected' || occ.status === 'rejeitado' ? 'Rejeitada' : 'Pendente'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">Turma: {occ.turma} | {occ.data} {occ.hora}</p>
                        </div>
                        <div className="flex gap-2">
                          {(!occ.status || (occ.status !== 'approved' && occ.status !== 'aprovado' && occ.status !== 'rejected')) && (
                            <>
                              <button onClick={() => handleApprove(occ.id)} className="btn btn-primary text-sm" disabled={loading}>
                                <Check size={16} />
                              </button>
                              <button onClick={() => handleReject(occ.id)} className="btn btn-secondary text-sm" disabled={loading}>
                                <X size={16} />
                              </button>
                            </>
                          )}
                          <button onClick={() => setExpandedId(expandedId === occ.id ? null : occ.id)} className="btn btn-secondary">
                            {expandedId === occ.id ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      {expandedId === occ.id && (
                        <div className="mt-4 pt-4 border-t border-slate-200 animate-slideUp">
                          <p className="text-slate-700 text-sm mb-3">{occ.descricao}</p>
                          <div className="p-3 bg-slate-50 rounded border border-slate-200">
                            <p className="text-xs font-mono text-slate-600">ID: {occ.id}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="animate-slideUp space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard title="Ativos" value={schoolUsers.filter(u => u.status === 'active' || u.status === 'aprovado').length} icon={Users} color="emerald" />
              <StatCard title="Pendentes" value={schoolUsers.filter(u => u.status === 'pending' || u.status === 'pendente').length} icon={AlertCircle} color="orange" />
            </div>
            <button onClick={() => fetchSchoolUsers()} className="w-full btn btn-secondary" disabled={usersLoading}>
              {usersLoading ? 'Atualizando...' : 'Atualizar Usuários'}
            </button>
            {schoolUsers.length === 0 ? (
              <div className="card border-0 shadow-lg text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Nenhum usuário</p>
              </div>
            ) : (
              <div className="space-y-4">
                {schoolUsers.map(user => (
                  <div key={user.id} className="card border-0 shadow-md">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{user.username}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                      {(user.status === 'pending' || user.status === 'pendente') && (
                        <button onClick={() => handleApproveUser(user.id)} className="btn btn-primary" disabled={usersLoading}>
                          <Check size={18} />
                          Aprovar
                        </button>
                      )}
                      {(user.status === 'active' || user.status === 'aprovado') && (
                        <span className="text-sm font-semibold text-emerald-600">● Ativo</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
