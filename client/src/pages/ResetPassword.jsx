import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('verifying'); // verifying, verified, error, updating, success
  const [message, setMessage] = useState('Verificando enlace...');

  // Password requirements
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  });

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Enlace inválido o incompleto.');
        return;
      }
      try {
        await axios.get(`${API_URL}/auth/verify-token?token=${token}`);
        setStatus('verified');
        setMessage('');
      } catch (error) {
        setStatus('error');
        setMessage('El enlace ha expirado o no es válido.');
      }
    };
    verifyToken();
  }, [token]);

  useEffect(() => {
    setRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      match: password && password === confirmPassword
    });
  }, [password, confirmPassword]);

  const isFormValid = Object.values(requirements).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setStatus('updating');
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { token, password });
      setStatus('success');
      setMessage('Tu contraseña ha sido actualizada correctamente.');
    } catch (error) {
      setStatus('error');
      setMessage('Error al actualizar la contraseña. Intenta nuevamente.');
    }
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md relative z-10"
        >
            <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl">
                <h2 className="text-2xl font-bold text-white text-center mb-6">Restablecer Contraseña</h2>

                {status === 'success' ? (
                    <div className="text-center py-6">
                        <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                        <p className="text-slate-300 mb-6">{message}</p>
                        <Link to="/login">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Ir a Iniciar Sesión</Button>
                        </Link>
                    </div>
                ) : status === 'error' ? (
                    <div className="text-center py-6">
                        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                        <p className="text-red-400 mb-6">{message}</p>
                        <Link to="/login">
                            <Button className="w-full bg-slate-800 hover:bg-slate-700">Volver</Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Nueva Contraseña</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-slate-950/50 border-slate-700 text-slate-100 pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Confirmar Contraseña</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="bg-slate-950/50 border-slate-700 text-slate-100 pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Strength Indicator */}
                        <div className="space-y-2 text-xs text-slate-400 bg-slate-950/30 p-3 rounded-lg border border-slate-800">
                            <p className="font-semibold mb-2">Requisitos:</p>
                            <ul className="space-y-1">
                                <li className={requirements.length ? "text-emerald-400" : "text-slate-500"}>• Mínimo 8 caracteres</li>
                                <li className={requirements.uppercase ? "text-emerald-400" : "text-slate-500"}>• Una mayúscula</li>
                                <li className={requirements.lowercase ? "text-emerald-400" : "text-slate-500"}>• Una minúscula</li>
                                <li className={requirements.number ? "text-emerald-400" : "text-slate-500"}>• Un número</li>
                                <li className={requirements.special ? "text-emerald-400" : "text-slate-500"}>• Un carácter especial</li>
                                <li className={requirements.match ? "text-emerald-400" : "text-slate-500"}>• Las contraseñas coinciden</li>
                            </ul>
                        </div>

                        <Button
                            type="submit"
                            disabled={!isFormValid || status === 'updating'}
                            className={`w-full font-bold py-6 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        >
                            {status === 'updating' ? <Loader2 className="animate-spin" /> : 'Restablecer Contraseña'}
                        </Button>
                    </form>
                )}
            </div>
        </motion.div>
    </div>
  );
}