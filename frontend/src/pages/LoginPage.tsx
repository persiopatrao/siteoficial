import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Lock, Mail, Building2, AlertCircle } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-10 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white mb-4 shadow-lg">
            <Building2 size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-bold text-primary-900 mb-2">SIGE</h1>
          <p className="text-slate-600 font-medium">Sistema Integrado de Gestão Escolar</p>
        </div>

        {/* Card */}
        <div className="card border-0 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email/Username */}
            <div>
              <label htmlFor="email" className="label flex items-center gap-2">
                <Mail size={16} className="text-primary-600" />
                Email ou Usuário
              </label>
              <input
                id="email"
                type="text"
                className="input"
                placeholder="seu.email@escola.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label flex items-center gap-2">
                <Lock size={16} className="text-primary-600" />
                Senha
              </label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Escola */}
            <div>
              <label htmlFor="escola" className="label flex items-center gap-2">
                <Building2 size={16} className="text-primary-600" />
                Escola
              </label>
              <select
                id="escola"
                className="input appearance-none cursor-pointer"
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value)}
              >
                <option value="">
                  Selecione uma escola
                </option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <div>
                  <p className="font-semibold">Falha no acesso</p>
                  <p className="text-sm mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Autenticando...' : 'Entrar no Sistema'}
            </button>

            {/* Footer */}
            <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-200">
              © 2026 SIGE. Todos os direitos reservados.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
