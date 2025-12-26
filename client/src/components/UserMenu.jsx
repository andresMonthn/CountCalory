import { useAuth } from '../context/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Menu, LogOut, User, Shield } from 'lucide-react';

export function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full border border-slate-700 bg-slate-900 hover:bg-slate-800 transition-colors">
          <Menu className="h-5 w-5 text-slate-300" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 mr-4" align="end">
        <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-md overflow-hidden shadow-xl">
          {/* User Info Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <User className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-slate-200 truncate block" title={user.email}>
                  {user.email}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Shield size={10} /> Cuenta Protegida
                </span>
              </div>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="p-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30 h-9 px-2"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}