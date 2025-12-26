import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyToken, user } = useAuth(); // Get user from context
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      console.error('❌ Missing email or token in URL');
      setStatus('error');
      return;
    }

    // Prevent double verification if user is already loaded matching the email
    if (user && user.email === email) {
        console.log('✅ User already verified, redirecting...');
        navigate('/');
        return;
    }

    const verify = async () => {
      console.log('🔄 Starting verification...');
      const result = await verifyToken(email, token);
      
      if (result.success) {
        console.log('✅ Verification successful');
        setStatus('success');
        // We wait for the 'user' effect below to redirect
      } else {
        console.error('❌ Verification failed:', result.error);
        setStatus('error');
      }
    };

    verify();
  }, [searchParams, verifyToken, user, navigate]);

  // Separate effect to handle redirection once user state is updated
  useEffect(() => {
    if (status === 'success' && user) {
        console.log('🚀 User state updated, redirecting to home...');
        // Small delay to ensure everything is settled
        const timer = setTimeout(() => {
            navigate('/', { replace: true });
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [status, user, navigate]);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-800 text-red-200 p-8 rounded-lg max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Error de Verificación</h2>
          <p>El enlace es inválido o ha expirado. Por favor intenta iniciar sesión nuevamente.</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded transition-colors"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-slate-200 text-xl font-medium">Verificando sesión...</h2>
      </div>
    </div>
  );
}
