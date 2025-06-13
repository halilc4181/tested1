import React from 'react';
import { Menu, Settings, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleAdmin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleAdmin }) => {
  const { restaurant, language, isAdmin, setIsAdmin } = useApp();

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      onToggleAdmin();
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-3">
              <img 
                src={restaurant.logo} 
                alt={language === 'tr' ? restaurant.name : restaurant.nameEn}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {language === 'tr' ? restaurant.name : restaurant.nameEn}
                </h1>
                <p className="text-sm text-gray-500">QR Menü</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleAdminToggle}
              className={`p-2 rounded-md transition-colors ${
                isAdmin 
                  ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-label={isAdmin ? 'Exit admin' : 'Admin login'}
            >
              {isAdmin ? <LogOut className="h-5 w-5" /> : <Settings className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;