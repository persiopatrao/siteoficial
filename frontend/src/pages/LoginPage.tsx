import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Lock, Mail, Building2 } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth();
  const { schools } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [empresaId, setEmpresaId] = useState<number | string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('[ACTION] Redirecionando com base no role:', user.role);
      if (user.role === 'master') {
        navigate('/master');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    }
  }, [isAuthenticated, user, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, empresaId ? Number(empresaId) : undefined);
    } catch (err) {
      console.error('[ERROR] Falha no login:', err);
      setError('Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-blue-950 text-white">
      <div className="w-full max-w-md">
        <div className="card bg-blue-900 border border-blue-800 text-white shadow-2xl shadow-blue-950/40">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-blue-700/30 border border-blue-600/50 mb-4">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">SIGE</h1>
            <p className="text-white/80">Sistema Integrado de Gestão Escolar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                <Mail className="w-4 h-4 inline mr-2" />
                Email ou Usuário
              </label>
              <input
                id="email"
                type="text"
                className="input text-white placeholder:text-white"
                placeholder="seu.email@escola.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                <Lock className="w-4 h-4 inline mr-2" />
                Senha
              </label>
              <input
                id="password"
                type="password"
                className="input text-white placeholder:text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="escola" className="label">
                <Building2 className="w-4 h-4 inline mr-2" />
                Escola
              </label>
              <select
                id="escola"
                className="input text-white"
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value)}
              >
                <option
                  value=""
                  style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                >
                  Selecione uma escola (Super Admin sem seleção)
                </option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id} className="bg-blue-700 text-white">
                    {school.nome}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-white text-blue-950 font-semibold px-4 py-3 shadow-lg shadow-blue-950/20 transition hover:bg-slate-100"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
