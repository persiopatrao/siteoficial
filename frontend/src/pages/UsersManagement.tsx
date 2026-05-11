import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Check, X, Plus, Trash2 } from 'lucide-react';

interface UserData {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  empresa_id: number;
  empresa_name: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'pending' | 'active' | 'rejected';
}

interface School {
  id: number;
  nome: string;
}

import API_URL from '../api';

export default function UsersManagement() {
  const { token } = useAuth();
  const { user: authUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newUserForm, setNewUserForm] = useState({ email: '', password: '', empresa_id: '', role: 'user' });
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : data.users || []);
        console.log('[LOAD] Usuários carregados:', data);
      }
    } catch (error) {
      console.error('[ERROR] Falha ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/empresas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSchools(Array.isArray(data) ? data : data.schools || []);
        console.log('[LOAD] Escolas carregadas para seleção');
      }
    } catch (error) {
      console.error('[ERROR] Falha ao carregar escolas:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSchools();
  }, [token]);

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !newUserForm.email || !newUserForm.password || !newUserForm.empresa_id) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUserForm.email,
          email: newUserForm.email,
          password: newUserForm.password,
          empresa_id: Number(newUserForm.empresa_id),
          role: newUserForm.role,
        }),
      });

      if (response.ok) {
        console.log('[SUCCESS] Novo usuário criado:', newUserForm.email);
        setNewUserForm({ email: '', password: '', empresa_id: '', role: 'user' });
        setShowCreateForm(false);
        await fetchUsers();
      } else {
        console.error('[ERROR] Falha ao criar usuário:', await response.text());
      }
    } catch (error) {
      console.error('[ERROR] Falha ao criar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (userId: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: 'admin' }),
      });
      if (response.ok) {
        console.log('[SUCCESS] Usuário promovido a administrador:', userId);
        await fetchUsers();
      }
    } catch (error) {
      console.error('[ERROR] Falha ao promover usuário:', error);
    }
  };

  const handleDemote = async (userId: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: 'user' }),
      });
      if (response.ok) {
        console.log('[SUCCESS] Usuário rebaixado para comum:', userId);
        await fetchUsers();
      }
    } catch (error) {
      console.error('[ERROR] Falha ao rebaixar usuário:', error);
    }
  };

  const handleApprove = async (userId: number) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'aprovado' }),
      });
      if (response.ok) {
        console.log('[SUCCESS] Usuário aprovado:', userId);
        await fetchUsers();
      }
    } catch (error) {
      console.error('[ERROR] Falha ao aprovar usuário:', error);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!token) return;
    if (!window.confirm(`Tem certeza que deseja excluir o usuário ${username}?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        console.log('[SUCCESS] Usuário excluído:', userId);
        await fetchUsers();
      } else {
        const errorText = await response.text();
        console.error('[ERROR] Falha ao excluir usuário:', errorText);
      }
    } catch (error) {
      console.error('[ERROR] Falha ao excluir usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-accent-50 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-300" />
          Gerenciar Usuários
        </h2>
        <button
          onClick={() => fetchUsers()}
          className="btn-secondary text-sm"
          disabled={loading}
        >
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      <div className="card">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 font-bold text-accent-50 mb-4 w-full"
        >
          <Plus className="w-5 h-5 text-blue-300" />
          {showCreateForm ? 'Ocultar' : 'Criar Novo Usuário'}
        </button>

        {showCreateForm && (
          <form onSubmit={handleCreateUser} className="space-y-4 border-t border-white/10 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="usuario@email.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Senha</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Escola</label>
                <select
                  className="input"
                  value={newUserForm.empresa_id}
                  onChange={(e) => setNewUserForm({ ...newUserForm, empresa_id: e.target.value })}
                  required
                >
                  <option value="">Selecione uma escola</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Cargo</label>
                <select
                  className="input"
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                >
                  <option value="user">Usuário Comum</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Usuário'}
            </button>
          </form>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-accent-50">Usuários Cadastrados ({users.length})</h3>
        {users.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-accent-400">Nenhum usuário encontrado</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="card hover:border-blue-500/50 transition-all cursor-pointer"
              onClick={() => {
                console.log('[SELECT] Usuário selecionado:', user.username);
                setSelectedUser(user);
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div>
                  <p className="font-semibold text-accent-50">{user.username}</p>
                  <p className="text-xs text-accent-400">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-accent-300">Escola:</p>
                  <p className="font-medium text-accent-50 text-sm">{user.empresa_name}</p>
                </div>
                <div>
                  <p className="text-xs text-accent-400 mb-1">Cargo</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'admin' 
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' : 'Usuário Comum'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-accent-400 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.status === 'aprovado' || user.status === 'active'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : user.status === 'rejeitado'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}>
                    {user.status === 'aprovado' || user.status === 'active' ? 'Aprovado' : user.status === 'rejeitado' ? 'Rejeitado' : 'Pendente'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {(user.status === 'pendente' || user.status === 'pending') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(user.id);
                      }}
                      className="btn-primary text-sm"
                      title="Aprovar usuário"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUser(user.id, user.username);
                    }}
                    className="btn-ghost text-sm"
                    title="Excluir usuário"
                    disabled={Number(authUser?.id) === user.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {user.role === 'user' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePromote(user.id);
                      }}
                      className="btn-secondary text-sm"
                      title="Promover a administrador"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemote(user.id);
                      }}
                      className="btn-ghost text-sm"
                      title="Rebaixar para usuário comum"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {selectedUser?.id === user.id && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-accent-400 mb-2">Detalhes:</p>
                  <pre className="bg-black/30 p-3 rounded text-xs text-blue-300 overflow-x-auto">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
