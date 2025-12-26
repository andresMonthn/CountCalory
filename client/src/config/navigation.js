import { User, History, Info } from 'lucide-react';

export const NAV_ITEMS = [
  {
    id: 'profile',
    label: 'Perfil',
    icon: User,
    position: 'left'
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
