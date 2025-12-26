import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, Check, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';

export function SetPasswordDialog() {
  const { user, updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If user has password or not logged in, don't show
  if (!user || user.hasPassword) return null;

  const validatePassword = (pass) => {
    if (pass.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (!/[a-zA-Z]/.test(pass) || !/[0-9]/.test(pass)) return "La contraseña debe contener letras y números";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const valError = validatePassword(password);
    if (valError) {
      setError(valError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-emerald-500/30 bg-slate-950 shadow-2xl shadow-emerald-900/20 ring-1 ring-emerald-500/20">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-white">
              <ShieldCheck className="w-6 h-6 text-emerald-500" /> 
              Primer Ingreso
            </CardTitle>
            <CardDescription className="text-slate-400 text-base">
              Detectamos que es tu primera vez aquí. Por seguridad, establece una contraseña para tu cuenta <strong>{user.email}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 bg-slate-900 border-slate-800 focus-visible:ring-emerald-500"
                    placeholder="Mínimo 8 caracteres alfanuméricos"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-900 border-slate-800 focus-visible:ring-emerald-500"
                  placeholder="Repite tu contraseña"
                />
              </div>

              {/* Password Strength Indicators */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-emerald-500' : 'text-slate-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${password.length >= 8 ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                  Mínimo 8 caracteres
                </div>
                <div className={`flex items-center gap-1.5 ${(/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) ? 'text-emerald-500' : 'text-slate-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${(/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                  Letras y números
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-in slide-in-from-top-1">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading || !password || !confirmPassword}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 mt-4 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? 'Guardando...' : 'Establecer Contraseña y Continuar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}