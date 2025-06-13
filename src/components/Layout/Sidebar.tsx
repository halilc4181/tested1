import React, { useState } from 'react';
import { X, Phone, MapPin, Wifi, Globe, Instagram, Facebook, Twitter, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { restaurant, tables, language, setLanguage } = useApp();
  const [selectedTable, setSelectedTable] = useState('');
  const [showTableSelection, setShowTableSelection] = useState(false);

  const handleCallWaiter = () => {
    if (!selectedTable) {
      setShowTableSelection(true);
      return;
    }
    
    const table = tables.find(t => t.id === selectedTable);
    const tableName = table ? (language === 'tr' ? table.name : table.nameEn) : '';
    
    alert(
      language === 'tr' 
        ? `${tableName} için garson çağrılıyor...` 
        : `Calling waiter for ${tableName}...`
    );
    setShowTableSelection(false);
    setSelectedTable('');
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleOverlayClick}
      />
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <img 
                src={restaurant.logo} 
                alt={language === 'tr' ? restaurant.name : restaurant.nameEn}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {language === 'tr' ? restaurant.name : restaurant.nameEn}
                </h2>
                <p className="text-sm text-gray-500">
                  {language === 'tr' ? 'Hoş geldiniz' : 'Welcome'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'tr' ? 'İletişim' : 'Contact'}
              </h3>
              
              <div className="flex items-center space-x-3 text-gray-700">
                <Phone className="h-5 w-5 text-gray-400" />
                <span className="text-sm">{restaurant.phone}</span>
              </div>
              
              <div className="flex items-start space-x-3 text-gray-700">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <span className="text-sm">
                  {language === 'tr' ? restaurant.address : restaurant.addressEn}
                </span>
              </div>
            </div>

            {/* WiFi Password */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'tr' ? 'WiFi Şifresi' : 'WiFi Password'}
              </h3>
              <div className="flex items-center space-x-3">
                <Wifi className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-mono bg-gray-100 px-3 py-2 rounded-md">
                  {restaurant.wifiPassword}
                </span>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'tr' ? 'Sosyal Medya' : 'Social Media'}
              </h3>
              <div className="space-y-2">
                {restaurant.socialMedia.instagram && (
                  <div className="flex items-center space-x-3">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <span className="text-sm text-gray-700">{restaurant.socialMedia.instagram}</span>
                  </div>
                )}
                {restaurant.socialMedia.facebook && (
                  <div className="flex items-center space-x-3">
                    <Facebook className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-700">{restaurant.socialMedia.facebook}</span>
                  </div>
                )}
                {restaurant.socialMedia.twitter && (
                  <div className="flex items-center space-x-3">
                    <Twitter className="h-5 w-5 text-blue-400" />
                    <span className="text-sm text-gray-700">{restaurant.socialMedia.twitter}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Language Toggle */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {language === 'tr' ? 'Dil' : 'Language'}
              </h3>
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-3 w-full p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <Globe className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {language === 'tr' ? 'English' : 'Türkçe'}
                </span>
              </button>
            </div>
          </div>

          {/* Call Waiter Section */}
          <div className="p-6 border-t">
            {showTableSelection ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">
                  {language === 'tr' ? 'Masa Seçin:' : 'Select Table:'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {tables.filter(table => table.isActive).map(table => (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTable(table.id)}
                      className={`p-2 text-sm rounded-md border transition-colors ${
                        selectedTable === table.id
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {language === 'tr' ? table.name : table.nameEn}
                    </button>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCallWaiter}
                    disabled={!selectedTable}
                    className="flex-1 flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-3 rounded-lg transition-colors font-medium text-sm"
                  >
                    <Bell className="h-4 w-4" />
                    <span>{language === 'tr' ? 'Çağır' : 'Call'}</span>
                  </button>
                  <button
                    onClick={() => setShowTableSelection(false)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    {language === 'tr' ? 'İptal' : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCallWaiter}
                className="w-full flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
              >
                <Bell className="h-5 w-5" />
                <span>{language === 'tr' ? 'Garson Çağır' : 'Call Waiter'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;