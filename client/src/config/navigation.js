import { User, History, Info, BarChart3, Search } from 'lucide-react';

export const NAV_ITEMS = [
  {
    id: 'profile',
    label: 'Perfil',
    icon: User,
    position: 'left'
  },
  {
    id: 'search',
    label: '¿Calorías?',
    icon: Search,
    position: 'left'
  },
  {
    id: 'history',
    label: 'Historial',
    icon: History,
    position: 'right'
  },
  {
    id: 'metrics',
    label: 'Métricas',
    icon: BarChart3,
    position: 'right',
    isDialog: true
  }
];
