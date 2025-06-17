import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar, FileText, BarChart3, Settings, X, Heart, Contact as FileContract, Dumbbell, Mail, DollarSign } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Hastalar', href: '/patients', icon: Users },
  { name: 'Diyet Planları', href: '/diet-plans', icon: FileText },
  { name: 'Spor Programları', href: '/exercise-programs', icon: Dumbbell },
  { name: 'Randevular', href: '/appointments', icon: Calendar },
  { name: 'E-posta Hatırlatıcı', href: '/email-reminders', icon: Mail },
  { name: 'Muhasebe', href: '/accounting', icon: DollarSign },
  { name: 'Sözleşmeler', href: '/contracts', icon: FileContract },
  { name: 'Raporlar', href: '/reports', icon: BarChart3 },
  { name: 'Ayarlar', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      <div className={`lg:hidden ${isOpen ? 'fixed inset-0 z-50' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={onClose} />
        <div className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-white px-6 pb-4 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <div className="flex items-center gap-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DiyetTakip</span>
            </div>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-8">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex gap-x-3 rounded-md p-3 text-sm font-medium leading-6 transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-gray-700 hover:text-emerald-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 border-r border-gray-200">
          <div className="flex h-16 shrink-0 items-center gap-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DiyetTakip</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex gap-x-3 rounded-md p-3 text-sm font-medium leading-6 transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-gray-700 hover:text-emerald-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};