import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MasterDashboard from './pages/MasterDashboard';
import type { ReactNode } from 'react';

function RoleRoute({ children, requiredRole }: { children: ReactNode; requiredRole: 'user' | 'admin' | 'master' }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" />;
  
  const hasAccess = 
    requiredRole === 'user' ||
    (requiredRole === 'admin' && (user?.role === 'admin' || user?.role === 'master')) ||
    (requiredRole === 'master' && user?.role === 'master');

  return hasAccess ? <>{children}</> : <Navigate to="/" />;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/user/*"
        element={
          <RoleRoute requiredRole="user">
            <UserDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <RoleRoute requiredRole="admin">
            <AdminDashboard />
          </RoleRoute>
        }
      />
      <Route
        path="/master/*"
        element={
          <RoleRoute requiredRole="master">
            <MasterDashboard />
          </RoleRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}
