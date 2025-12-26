import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');
  const { login, loginWithPassword, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Reset state on mode change
  useEffect(() => {
    setStatus('idle');
    setMessage('');
    setPassword('');
  }, [mode]);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus('error');
      setMessage('El correo electrónico es obligatorio');
      return;
    }
    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('Por favor ingresa un correo electrónico válido');
      return;
    }

    setStatus('loading');
    setMessage('');

    if (mode === 'login') {
      // Login Flow
      if (!password) {
        setStatus('error');
        setMessage('La contraseña es obligatoria');
        return;
      }
      const result = await loginWithPassword(email, password);
      if (result.success) {
        setStatus('success');
        setMessage('¡Inicio de sesión exitoso!');
      } else {
        setStatus('error');
        setMessage(result.error);
      }
    } else {
      // Register Flow (Magic Link)
      const result = await login(email);
      if (result.success) {
        setStatus('success');
        setMessage('¡Enlace de acceso enviado! Revisa tu correo.');
        console.log('[DEBUG] Token generation requested via Magic Link for:', email);
      } else {
        setStatus('error');
        setMessage(result.error);
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden transition-colors duration-700 ease-in-out">
      {/* Dynamic Background */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ${
          mode === 'login' 
            ? 'bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black' 
            : 'bg-emerald-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900 via-emerald-950 to-black'
        }`}
      />

      {/* Content Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header & Switch */}
        <div className="text-center mb-8">
          <motion.h1 
            key={mode}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r ${
              mode === 'login' ? 'from-blue-400 to-indigo-500' : 'from-emerald-400 to-teal-500'
            }`}
          >
            {mode === 'login' ? 'Bienvenido' : 'Únete a nosotros'}
          </motion.h1>

          {/* Custom Switch */}
          <div className="bg-slate-900/50 p-1 rounded-full inline-flex border border-slate-800 backdrop-blur-sm relative">
            {/* Active Pill Background */}
            <motion.div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full ${
                mode === 'login' ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}
              initial={false}
              animate={{ 
                x: mode === 'login' ? 0 : '100%',
                left: mode === 'login' ? 4 : 4 // Adjust for padding
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            
            <button
              onClick={() => setMode('login')}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                mode === 'login' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setMode('register')}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                mode === 'register' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Registrarse
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative">
          {/* Status Messages */}
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`text-center py-8 ${mode === 'login' ? 'text-indigo-400' : 'text-emerald-400'}`}
              >
                <div className="flex justify-center mb-4">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {mode === 'login' ? '¡Sesión Iniciada!' : '¡Enlace Enviado!'}
                </h3>
                <p className="text-slate-300">{message}</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Mail size={16} /> Correo Electrónico
                    </label>
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-950/50 border-slate-700 text-slate-100 focus:ring-2 focus:ring-offset-0 transition-all focus:border-transparent"
                      style={{
                        '--tw-ring-color': mode === 'login' ? 'rgb(99 102 241)' : 'rgb(16 185 129)'
                      }}
                    />
                  </div>

                  <AnimatePresence>
                    {mode === 'login' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                          <Lock size={16} /> Contraseña
                        </label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-slate-950/50 border-slate-700 text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2"
                  >
                    <AlertCircle size={16} />
                    {message}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className={`w-full font-bold py-6 transition-all duration-300 shadow-lg ${
                    mode === 'login' 
                      ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/20 hover:shadow-indigo-900/40' 
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20 hover:shadow-emerald-900/40'
                  }`}
                >
                  {status === 'loading' ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {mode === 'login' ? 'Ingresar' : 'Crear Cuenta'}
                      <ArrowRight size={18} />
                    </span>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
        
        <p className="text-center text-xs text-slate-600 mt-6">
          {mode === 'login' 
            ? '¿Olvidaste tu contraseña? Usa el modo registro para recibir un enlace mágico.' 
            : 'Te enviaremos un enlace seguro para acceder sin contraseña.'}
        </p>
      </motion.div>
    </div>
  );
}