import React, { useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { MetricsPanel } from './Settings/SettingsComponents';
import { NAV_ITEMS } from "@/config/navigation";

export function NavigationBar({ currentView, onNavigate }) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [metricsOpen, setMetricsOpen] = useState(false);

  const handleNavClick = (item) => {
    if (item.isDialog) {
      if (item.id === 'about') setAboutOpen(true);
      if (item.id === 'metrics') setMetricsOpen(true);
    } else {
      onNavigate(item.id);
    }
  };

  const leftItems = NAV_ITEMS.filter(item => item.position === 'left');
  const rightItems = NAV_ITEMS.filter(item => item.position === 'right');

  return (
    <>
      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md shadow-[0_-5px_20px_rgba(0,0,0,0.5)] rounded-t-3xl grid grid-cols-3 items-center z-50 px-6 pt-2 pb-6 md:pb-4 h-20">
        <div className="flex justify-start gap-4">
          {leftItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`${currentView === item.id ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'text-slate-500'} hover:text-cyan-300 hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.4)] p-2 flex flex-col items-center transition-all duration-300`}
            >
              <item.icon size={24} strokeWidth={currentView === item.id ? 2.5 : 2} />
              <span className={`text-[10px] font-medium mt-1 ${currentView === item.id ? 'opacity-100 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]' : 'opacity-70'}`}>{item.label}</span>
            </button>
          ))}
        </div>
        
        <div className="flex justify-center relative">
            <div 
              className="absolute -top-12 p-1.5 bg-slate-950 border border-slate-800 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.2)] cursor-pointer hover:scale-105 transition-transform hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
              onClick={() => onNavigate('home')}
            >
                <img src="image.png" alt="Logo" className="h-16 w-16 object-contain rounded-full bg-slate-900" />
            </div>
        </div>
        
        <div className="flex justify-end gap-4">
          {rightItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`${currentView === item.id ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : 'text-slate-500'} hover:text-cyan-300 hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.4)] p-2 flex flex-col items-center transition-all duration-300`}
            >
              <item.icon size={24} strokeWidth={currentView === item.id ? 2.5 : 2} />
              <span className={`text-[10px] font-medium mt-1 ${currentView === item.id ? 'opacity-100 text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.4)]' : 'opacity-70'}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <MetricsPanel isOpen={metricsOpen} onClose={() => setMetricsOpen(false)} />

      <AlertDialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Acerca de CountCalory</AlertDialogTitle>
                <AlertDialogDescription className="space-y-4 pt-2 text-slate-300">
                    <p>Tu asistente para calcular y gestionar calorías fácilmente.</p>
                    <div>
                        <strong className="text-white">Contacto:</strong><br/>
                        <a href="mailto:andre.777.monthana@gmail.com" className="text-primary hover:underline">andres.777.monthana@gmail.com</a>
                    </div>
                    <div>
                        <strong className="text-white">Información:</strong><br/>
                        Versión 1.01
                    </div>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setAboutOpen(false)}>Cerrar</AlertDialogCancel>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
