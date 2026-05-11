import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { LogOut, BarChart3, Users, Building2, AlertCircle } from 'lucide-react';
import UsersManagement from './UsersManagement';
import SchoolsManagement from './SchoolsManagement';
import OccurrencesManagement from './OccurrencesManagement';

type TabType = 'dashboard' | 'users' | 'schools' | 'occurrences';

export default function MasterDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { schools, occurrences } = useData();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const handleLogout = () => {
    console.log('[ACTION] Super Admin desconectando');
    logout();
    navigate('/');
  };

  const stats = {
    totalSchools: schools.length,
    totalOccurrences: occurrences.length,
    totalUsers: 0,
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
            <div className="text-right">
              <p className="text-accent-300 font-semibold">{user?.username}</p>
              <span className="badge bg-purple-500/40">Super Admin</span>
            </div>
            <button onClick={handleLogout} className="btn-ghost">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 border-b border-white/10 flex-wrap">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-accent-400 hover:text-accent-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-accent-400 hover:text-accent-300'
            }`}
          >
            <Users className="w-4 h-4" />
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('schools')}
            className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'schools'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-accent-400 hover:text-accent-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Escolas
          </button>
          <button
            onClick={() => setActiveTab('occurrences')}
            className={`px-4 py-3 font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'occurrences'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-accent-400 hover:text-accent-300'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Ocorrências
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-accent-50 mb-4">Dashboard - Visão Geral</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <Building2 className="w-8 h-8 text-blue-300 mb-2" />
                <p className="text-accent-400 text-sm mb-2">Total de Escolas</p>
                <p className="text-4xl font-bold text-blue-300">{stats.totalSchools}</p>
                <button
                  onClick={() => setActiveTab('schools')}
                  className="btn-ghost text-xs mt-3"
                >
                  Gerenciar →
                </button>
              </div>
              <div className="card">
                <Users className="w-8 h-8 text-blue-400 mb-2" />
                <p className="text-accent-400 text-sm mb-2">Ocorrências Registradas</p>
                <p className="text-4xl font-bold text-blue-400">{stats.totalOccurrences}</p>
                <button
                  onClick={() => setActiveTab('occurrences')}
                  className="btn-ghost text-xs mt-3"
                >
                  Ver todas →
                </button>
              </div>
              <div className="card">
                <AlertCircle className="w-8 h-8 text-yellow-400 mb-2" />
                <p className="text-accent-400 text-sm mb-2">Usuários Ativos</p>
                <p className="text-4xl font-bold text-yellow-400">{stats.totalUsers}</p>
                <button
                  onClick={() => setActiveTab('users')}
                  className="btn-ghost text-xs mt-3"
                >
                  Gerenciar →
                </button>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-bold text-accent-50 mb-4">Informações do Sistema</h3>
              <pre className="bg-black/30 p-4 rounded text-xs text-blue-300 overflow-x-auto">
{`Sistema: SIGE v1.0
Seu Perfil: Super Admin
Permissões:
  ✓ Criar/Deletar escolas
  ✓ Promover/Rebaixar usuários
  ✓ Visualizar todas as ocorrências
  ✓ Gerenciar sistema completo

Conectado como: ${user?.username}
Timestamp: ${new Date().toISOString()}`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'users' && <UsersManagement />}
        {activeTab === 'schools' && <SchoolsManagement />}
        {activeTab === 'occurrences' && <OccurrencesManagement />}
      </main>
    </div>
  );
}
