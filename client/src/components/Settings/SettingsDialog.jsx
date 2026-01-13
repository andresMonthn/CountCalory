import { useState } from "react";
import { Settings, BarChart3, ShieldCheck, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { PasswordForm, MetricsPanel } from "./SettingsComponents";
import { cn } from "@/lib/utils";

export function SettingsDialog({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState("security");
  const [showMetrics, setShowMetrics] = useState(false);

  return (
    <>
      <Modal 
        open={open} 
        onOpenChange={onOpenChange} 
        title="Configuración" 
        className="max-w-4xl bg-slate-950 p-0 overflow-hidden flex flex-col md:flex-row min-h-[500px]"
      >
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-900/50 border-r border-slate-800 p-4 space-y-2">
            <button
                onClick={() => setActiveTab("security")}
                className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    activeTab === "security" ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                )}
            >
                <ShieldCheck className="h-4 w-4" />
                Seguridad
            </button>
            <button
                onClick={() => setShowMetrics(true)}
                className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                )}
            >
                <BarChart3 className="h-4 w-4" />
                Métricas
                <ChevronRight className="h-3 w-3 ml-auto opacity-50" />
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[500px] md:max-h-none">
            {activeTab === "security" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                        <h3 className="text-lg font-medium text-white mb-1">Contraseña y Seguridad</h3>
                        <p className="text-sm text-slate-400">Administra tu contraseña y la seguridad de tu cuenta.</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-800">
                        <PasswordForm />
                    </div>
                </div>
            )}
        </div>
      </Modal>

      {/* Metrics Modal Layer */}
      <MetricsPanel isOpen={showMetrics} onClose={() => setShowMetrics(false)} />
    </>
  );
}
