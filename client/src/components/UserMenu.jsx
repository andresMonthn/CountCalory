import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sheet } from './ui/sheet';
import { Button } from './ui/button';
import { Menu, LogOut, User, Shield, FileText, Settings, Info } from 'lucide-react';
import { PrivacyPolicyDialog } from './PrivacyPolicyDialog';
import { SettingsDialog } from './Settings/SettingsDialog';
import { AboutDialog } from './AboutDialog';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative h-10 w-10 rounded-full border border-slate-700 bg-slate-900 hover:bg-slate-800 transition-colors"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5 text-slate-300" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen} side="right">
          <div className="flex flex-col h-full mt-8">
            {/* User Info Header */}
            <div className="pb-6 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <User className="h-6 w-6 text-emerald-500" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-medium text-slate-200 truncate block" title={user.email}>
                    {user.email}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <Shield size={12} /> Cuenta Protegida
                  </span>
                </div>
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="space-y-2 flex-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-slate-400 hover:text-slate-200 hover:bg-slate-800 h-11 px-3 text-base"
                onClick={() => { setShowSettings(true); setOpen(false); }}
              >
                <Settings className="mr-3 h-5 w-5" />
                Configuración
              </Button>

              <Button 
                variant="ghost" 
                className="w-full justify-start text-slate-400 hover:text-slate-200 hover:bg-slate-800 h-11 px-3 text-base"
                onClick={() => { setShowPrivacy(true); setOpen(false); }}
              >
                <FileText className="mr-3 h-5 w-5" />
                Política de Privacidad
              </Button>

              <Button 
                variant="ghost" 
                className="w-full justify-start text-slate-400 hover:text-slate-200 hover:bg-slate-800 h-11 px-3 text-base"
                onClick={() => { setShowAbout(true); setOpen(false); }}
              >
                <Info className="mr-3 h-5 w-5" />
                Acerca de
              </Button>
            </div>

             <div className="pt-4 border-t border-slate-800 mt-auto">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30 h-11 px-3 text-base"
                onClick={() => { logout(); setOpen(false); }}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
      </Sheet>

      <PrivacyPolicyDialog open={showPrivacy} onOpenChange={setShowPrivacy} />
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <AboutDialog open={showAbout} onOpenChange={setShowAbout} />
    </>
  );
}
