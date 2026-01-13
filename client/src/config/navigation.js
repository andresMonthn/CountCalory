import { User, History, Info, BarChart3 } from 'lucide-react';

export const NAV_ITEMS = [
  {
    id: 'profile',
    label: 'Perfil',
    icon: User,
    position: 'left'
  },
  {
    id: 'metrics',
    label: 'Métricas',
    icon: BarChart3,
    position: 'left',
    isDialog: true
  },
  {
    id: 'history',
    label: 'Historial',
    icon: History,
    position: 'right'
  },
  {
    id: 'about',
    label: 'Acerca',
    icon: Info,
    position: 'right',
    isDialog: true
  }
];
