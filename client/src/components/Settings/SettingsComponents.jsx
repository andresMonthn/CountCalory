import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { Lock, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function PasswordForm() {
    const { user, updateUser } = useAuth();
    const { success, error } = useAlert();
    
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [validations, setValidations] = useState({
        length: false,
        match: false
    });

    useEffect(() => {
        setValidations({
            length: formData.newPassword.length >= 6,
            match: formData.newPassword && formData.newPassword === formData.confirmPassword
        });
    }, [formData.newPassword, formData.confirmPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validations.length || !validations.match) return;
        
        setLoading(true);
        try {
            const { data } = await axios.post(`${apiUrl}/auth/change-password`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            success(data.message);
            updateUser({ ...user, token: data.token }); // Actualizar token si cambia
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            error(err.response?.data?.message || "Error al cambiar la contraseña");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Contraseña Actual</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                        type="password"
                        className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="••••••••"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        required={user?.hasPassword}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Nueva Contraseña</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                        type="password"
                        className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="••••••••"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        required
                    />
                </div>
                {/* Validaciones visuales */}
                <div className="flex gap-4 text-xs">
                    <span className={validations.length ? "text-emerald-400 flex items-center gap-1" : "text-slate-500 flex items-center gap-1"}>
                        {validations.length ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} Mínimo 6 caracteres
                    </span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Confirmar Nueva Contraseña</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                        type="password"
                        className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                    />
                </div>
                <div className="flex gap-4 text-xs">
                    <span className={validations.match ? "text-emerald-400 flex items-center gap-1" : "text-slate-500 flex items-center gap-1"}>
                        {validations.match ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} Contraseñas coinciden
                    </span>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || !validations.length || !validations.match}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                Actualizar Contraseña
            </button>
        </form>
    );
}

export function MetricsPanel({ isOpen, onClose }) {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && user) {
            fetchMetrics();
        }
    }, [isOpen, user]);

    const fetchMetrics = async () => {
        try {
            const { data } = await axios.get(`${apiUrl}/user/metrics`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setMetrics(data);
        } catch (error) {
            console.error("Error fetching metrics", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal open={isOpen} onOpenChange={onClose} title="Métricas de Usuario" className="max-w-2xl bg-slate-900/95">
            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
            ) : metrics ? (
                <div className="space-y-8">
                    {/* Tarjetas Superiores */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
                            <h3 className="text-2xl font-bold text-white">{metrics.summariesCount}</h3>
                            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Resúmenes</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
                            <h3 className="text-2xl font-bold text-emerald-400">{metrics.daysActive}</h3>
                            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Días Activo</p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
                            <h3 className="text-2xl font-bold text-blue-400">{metrics.monthlyActivity.reduce((acc, curr) => acc + curr.count, 0)}</h3>
                            <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Actividad 6m</p>
                        </div>
                    </div>

                    {/* Gráfico de Barras Simple */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-slate-300">Actividad Mensual</h4>
                        <div className="h-48 flex items-end justify-between gap-2 px-2">
                            {metrics.monthlyActivity.length > 0 ? (
                                metrics.monthlyActivity.map((item, index) => {
                                    const maxCount = Math.max(...metrics.monthlyActivity.map(m => m.count));
                                    const heightPercentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                    
                                    return (
                                        <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                            <div className="relative w-full bg-slate-800 rounded-t-sm h-full flex items-end overflow-hidden group-hover:bg-slate-700 transition-colors">
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${heightPercentage}%` }}
                                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                                    className="w-full bg-emerald-500/80 group-hover:bg-emerald-400 transition-colors relative"
                                                >
                                                    {/* Tooltip on hover */}
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                        {item.count} resúmenes
                                                    </div>
                                                </motion.div>
                                            </div>
                                            <span className="text-xs text-slate-500 font-medium">{item.month}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                                    No hay actividad reciente
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="text-xs text-slate-500 text-center pt-4 border-t border-slate-800">
                        Miembro desde: {new Date(metrics.joinedDate).toLocaleDateString('es-ES', { dateStyle: 'long' })}
                    </div>
                </div>
            ) : (
                <div className="text-center text-red-400">No se pudieron cargar las métricas</div>
            )}
        </Modal>
    );
}
