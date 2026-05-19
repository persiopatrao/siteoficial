import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setShowMenu(!showMenu);
              onMenuToggle?.();
            }}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
          >
            {showMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-primary-600">SIGE</h1>
            <p className="text-xs text-slate-500 font-medium">Sistema Integrado de Gestão Escolar</p>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
            <p className="text-xs text-slate-500">
              {user?.role === 'master' && 'Administrador Geral'}
              {user?.role === 'admin' && 'Administrador'}
              {user?.role === 'user' && 'Usuário Comum'}
            </p>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary flex items-center gap-2"
            title="Sair do sistema"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
