import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Plus, AlertCircle, Eye, EyeOff, FileText, Clock, BookOpen } from 'lucide-react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import PageTitle from '../components/PageTitle';
import Tabs from '../components/Tabs';
import Alert from '../components/Alert';

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
  const { user } = useAuth();
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

  const myOccurrences = occurrences.filter((o: Occurrence) => o.created_by === Number(user?.id)) || [];

  const stats = {
    total: myOccurrences.length,
    pending: myOccurrences.filter((o: Occurrence) => o.status !== 'approved' && o.status !== 'aprovado').length,
    approved: myOccurrences.filter((o: Occurrence) => o.status === 'approved' || o.status === 'aprovado').length,
  };

  const tabs = [
    { id: 'create', label: 'Nova Ocorrência', icon: Plus },
    { id: 'my-reports', label: 'Minhas Ocorrências', icon: FileText, badge: stats.total },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <PageTitle
          icon={FileText}
          title="Painel de Ocorrências"
          subtitle="Registre e acompanhe ocorrências escolares"
        />

        {/* Tabs */}
        <Tabs
          tabs={tabs}
          activeTab={tab}
          onTabChange={(tabId) => setTab(tabId as 'create' | 'my-reports')}
        />

        {/* Create Tab */}
        {tab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slideUp">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="card border-0 shadow-lg">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Registrar Ocorrência</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Preencha os dados da ocorrência que será enviada para análise
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Student and Class */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nome do Aluno</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Ex: João Silva"
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
                        placeholder="Ex: 5º Ano A"
                        value={formData.turma}
                        onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="label">Descrição da Ocorrência</label>
                    <textarea
                      className="input resize-none h-32 font-sans"
                      placeholder="Descreva brevemente o ocorrido, incluindo contexto, comportamento e ações tomadas..."
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      required
                    />
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Data do Evento</label>
                      <input
                        type="date"
                        className="input"
                        value={formData.data}
                        onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Hora do Evento</label>
                      <input
                        type="time"
                        className="input"
                        value={formData.hora}
                        onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Alerts */}
                  {error && (
                    <Alert type="error" title="Erro ao registrar" message={error} dismissible />
                  )}

                  {success && (
                    <Alert type="success" title="Sucesso!" message={success} dismissible />
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Registrando...' : 'Registrar Ocorrência'}
                  </button>

                  {/* Info Box */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-slate-700">
                      <strong>ℹ️ Informação:</strong> Sua ocorrência será enviada ao administrador da sua unidade para análise e aprovação.
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              <StatCard
                title="Total de Ocorrências"
                value={stats.total}
                icon={FileText}
                color="primary"
              />

              <StatCard
                title="Pendentes"
                value={stats.pending}
                icon={Clock}
                color="orange"
              />

              <StatCard
                title="Aprovadas"
                value={stats.approved}
                icon={BookOpen}
                color="emerald"
              />

              {/* Info Card */}
              <div className="card border-0 shadow-lg">
                <h3 className="font-semibold text-slate-900 mb-4">Informações</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-slate-500">Status</p>
                    <p className="font-semibold text-emerald-600">● Online</p>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-slate-500">Usuário</p>
                    <p className="font-semibold text-slate-900 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Reports Tab */}
        {tab === 'my-reports' && (
          <div className="animate-slideUp space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total"
                value={stats.total}
                icon={FileText}
                color="primary"
              />
              <StatCard
                title="Pendentes"
                value={stats.pending}
                icon={Clock}
                color="orange"
              />
              <StatCard
                title="Aprovadas"
                value={stats.approved}
                icon={BookOpen}
                color="emerald"
              />
            </div>

            {/* Occurrences List */}
            {myOccurrences.length === 0 ? (
              <div className="card border-0 shadow-lg text-center py-12">
                <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-semibold mb-2">Nenhuma ocorrência registrada</p>
                <p className="text-sm text-slate-400 mb-6">
                  Você ainda não registrou nenhuma ocorrência
                </p>
                <button
                  onClick={() => setTab('create')}
                  className="btn btn-primary inline-flex"
                >
                  <Plus size={18} />
                  Criar Primeira Ocorrência
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myOccurrences.map((occ) => {
                  const isApproved = occ.status === 'approved' || occ.status === 'aprovado';
                  return (
                    <div key={occ.id} className="card border-0 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-slate-900 text-lg">{occ.aluno}</h3>
                            <span
                              className={`badge px-3 py-1 text-xs font-semibold ${
                                isApproved ? 'badge-success' : 'badge-warning'
                              }`}
                            >
                              {isApproved ? 'Aprovada' : 'Pendente'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                            <div>
                              <p className="text-slate-500">Turma</p>
                              <p className="font-semibold text-slate-900">{occ.turma}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Data e Hora</p>
                              <p className="font-semibold text-slate-900">
                                {occ.data} às {occ.hora}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedId(expandedId === occ.id ? null : occ.id)}
                          className="btn btn-secondary"
                          title={expandedId === occ.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                        >
                          {expandedId === occ.id ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      {/* Expanded Details */}
                      {expandedId === occ.id && (
                        <div className="mt-4 pt-4 border-t border-slate-200 animate-slideUp">
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                              Descrição
                            </p>
                            <p className="text-slate-700 text-sm leading-relaxed">{occ.descricao}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded border border-slate-200">
                            <p className="text-xs font-mono text-slate-600">
                              ID: {occ.id} • Criada por: {occ.created_by}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
