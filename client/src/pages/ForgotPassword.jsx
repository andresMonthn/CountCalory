import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

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

    try {
      // Per prompt requirement: Check user and send email
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      
      setStatus('success');
      setMessage('Si el correo existe, recibirás instrucciones para restablecer tu contraseña.');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Ocurrió un error al procesar tu solicitud. Intenta nuevamente.');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-950">
        {/* Background from Login */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md relative z-10"
        >
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Recuperar Contraseña</h1>
                <p className="text-slate-400">Ingresa tu correo para recibir instrucciones</p>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl">
                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-6"
                        >
                            <div className="flex justify-center mb-4 text-emerald-500">
                                <CheckCircle2 size={48} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">¡Correo Enviado!</h3>
                            <p className="text-slate-300 mb-6">{message}</p>
                            <Link to="/login">
                                <Button className="w-full bg-slate-800 hover:bg-slate-700">
                                    Volver al inicio
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    <Input
                                        type="email"
                                        placeholder="tu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-slate-950/50 border-slate-700 text-slate-100 pl-10 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
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
                                className="w-full bg-indigo-600 hover:bg-indigo-700 font-bold py-6 shadow-lg shadow-indigo-900/20"
                            >
                                {status === 'loading' ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Enviar Instrucciones <ArrowRight size={18} />
                                    </span>
                                )}
                            </Button>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>

            <div className="text-center mt-6">
                <Link to="/login" className="text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors">
                    <ArrowLeft size={16} /> Volver a Iniciar Sesión
                </Link>
            </div>
        </motion.div>
    </div>
  );
}