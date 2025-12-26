import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }
//aqui la ruta se redirige a la pagina de login si no hay un usuario autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
