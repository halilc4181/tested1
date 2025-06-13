import React, { useState } from 'react';
import { Building, Save, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const RestaurantSettings: React.FC = () => {
  const { restaurant, setRestaurant, language } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(restaurant);

  const handleSave = () => {
    setRestaurant(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(restaurant);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building className="h-8 w-8 text-yellow-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            {language === 'tr' ? 'İşletme Ayarları' : 'Restaurant Settings'}
          </h2>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
          >
            {language === 'tr' ? 'Düzenle' : 'Edit'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {isEditing ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'tr' ? 'Temel Bilgiler' : 'Basic Information'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'tr' ? 'İşletme Adı (TR)' : 'Restaurant Name (TR)'}
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'tr' ? 'İşletme Adı (EN)' : 'Restaurant Name (EN)'}
                  </label>
                  <input
                    type="text"
                    value={editForm.nameEn}
                    onChange={(e) => setEditForm(prev => ({ ...prev, nameEn: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'tr' ? 'Logo URL' : 'Logo URL'}
              </label>
              <input
                type="url"
                value={editForm.logo}
                onChange={(e) => setEditForm(prev => ({ ...prev, logo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {editForm.logo && (
                <div className="mt-2">
                  <img 
                    src={editForm.logo} 
                    alt="Logo Preview" 
                    className="h-16 w-16 rounded-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'tr' ? 'İletişim Bilgileri' : 'Contact Information'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'tr' ? 'Telefon' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'tr' ? 'Adres (TR)' : 'Address (TR)'}
                    </label>
                    <textarea
                      value={editForm.address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'tr' ? 'Adres (EN)' : 'Address (EN)'}
                    </label>
                    <textarea
                      value={editForm.addressEn}
                      onChange={(e) => setEditForm(prev => ({ ...prev, addressEn: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* WiFi Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'tr' ? 'WiFi Şifresi' : 'WiFi Password'}
              </label>
              <input
                type="text"
                value={editForm.wifiPassword}
                onChange={(e) => setEditForm(prev => ({ ...prev, wifiPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'tr' ? 'Sosyal Medya' : 'Social Media'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={editForm.socialMedia.instagram || ''}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                    }))}
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook
                  </label>
                  <input
                    type="text"
                    value={editForm.socialMedia.facebook || ''}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                    }))}
                    placeholder="PageName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Twitter
                  </label>
                  <input
                    type="text"
                    value={editForm.socialMedia.twitter || ''}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                    }))}
                    placeholder="@username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{language === 'tr' ? 'Kaydet' : 'Save'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
                <span>{language === 'tr' ? 'İptal' : 'Cancel'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Display Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'tr' ? 'Temel Bilgiler' : 'Basic Information'}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={restaurant.logo} 
                      alt="Logo" 
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {language === 'tr' ? restaurant.name : restaurant.nameEn}
                      </p>
                      <p className="text-sm text-gray-500">
                        {language === 'tr' ? restaurant.nameEn : restaurant.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'tr' ? 'İletişim' : 'Contact'}
                </h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">{language === 'tr' ? 'Telefon:' : 'Phone:'}</span> {restaurant.phone}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">{language === 'tr' ? 'Adres:' : 'Address:'}</span><br />
                    {language === 'tr' ? restaurant.address : restaurant.addressEn}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">WiFi:</span> {restaurant.wifiPassword}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'tr' ? 'Sosyal Medya' : 'Social Media'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {restaurant.socialMedia.instagram && (
                  <div className="text-sm">
                    <span className="font-medium">Instagram:</span> {restaurant.socialMedia.instagram}
                  </div>
                )}
                {restaurant.socialMedia.facebook && (
                  <div className="text-sm">
                    <span className="font-medium">Facebook:</span> {restaurant.socialMedia.facebook}
                  </div>
                )}
                {restaurant.socialMedia.twitter && (
                  <div className="text-sm">
                    <span className="font-medium">Twitter:</span> {restaurant.socialMedia.twitter}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantSettings;