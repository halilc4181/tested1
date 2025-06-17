import React, { useState } from 'react';
import { Menu, Bell, User, LogOut, Download, Upload, Settings, Camera, Bot } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DataStorage } from '../../utils/dataStorage';
import { ENV } from '../../config/environment';
import { AIChatModal } from '../AI/AIChatModal';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout, updateProfile } = useAuth();
  const { patients, appointments, dietPlans } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDeploymentInfo, setShowDeploymentInfo] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    photo: user?.photo || ''
  });

  // Get today's appointments for notifications
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => 
    apt.date === today && apt.status !== 'cancelled'
  );

  const handleExportData = () => {
    DataStorage.exportAllData(patients, appointments, dietPlans);
  };

  const handleImportData = async () => {
    try {
      const data = await DataStorage.importAllData();
      alert('Veri içe aktarma özelliği yakında eklenecek');
    } catch (error) {
      alert('Veri içe aktarma başarısız');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoUrl = event.target?.result as string;
        setProfileData(prev => ({ ...prev, photo: photoUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = () => {
    updateProfile(profileData);
    setShowProfile(false);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const deploymentInfo = ENV.getDeploymentInfo();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="flex h-16 items-center gap-x-4 sm:gap-x-6 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-gray-700 hover:text-gray-900"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4">
              {/* AI Chat Button - Prominent Position */}
              <button
                onClick={() => setShowAIChat(true)}
                className="relative inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                title="AI Asistan"
              >
                <Bot className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline text-sm font-medium">AI Asistan</span>
              </button>

              {/* Deployment Info Button (Development only) */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => setShowDeploymentInfo(!showDeploymentInfo)}
                  className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                  title="Deployment Info"
                >
                  <Settings className="h-5 w-5" />
                </button>
              )}

              <button
                onClick={handleExportData}
                className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                title="Verileri Dışa Aktar"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={handleImportData}
                className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                title="Verileri İçe Aktar"
              >
                <Upload className="h-5 w-5" />
              </button>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="h-6 w-6" />
                  {todayAppointments.length > 0 && !showNotifications && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {todayAppointments.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-sm font-medium text-gray-900">Bugünkü Randevular</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {todayAppointments.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <p className="text-sm">Bugün randevu bulunmuyor</p>
                        </div>
                      ) : (
                        todayAppointments.map((appointment) => (
                          <div key={appointment.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {appointment.patientName}
                                </p>
                                <p className="text-xs text-gray-500">{appointment.type}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  {formatTime(appointment.time)}
                                </p>
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  appointment.status === 'confirmed' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : appointment.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {appointment.status === 'confirmed' ? 'Onaylandı' : 
                                   appointment.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="flex items-center gap-x-3">
                <div className="relative">
                  <button
                    onClick={() => setShowProfile(!showProfile)}
                    className="flex items-center gap-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                      {user?.photo ? (
                        <img src={user.photo} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">Diyetisyen</p>
                    </div>
                  </button>

                  {showProfile && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900">Profil Ayarları</h3>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="text-center">
                          <div className="relative inline-block">
                            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden mx-auto">
                              {profileData.photo ? (
                                <img src={profileData.photo} alt="Profile" className="h-full w-full object-cover" />
                              ) : (
                                <User className="h-10 w-10 text-emerald-600" />
                              )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-emerald-600 rounded-full p-1 cursor-pointer hover:bg-emerald-700">
                              <Camera className="h-3 w-3 text-white" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ad Soyad
                          </label>
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={handleProfileSave}
                            className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
                          >
                            Kaydet
                          </button>
                          <button
                            onClick={() => setShowProfile(false)}
                            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Çıkış Yap"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* AI Chat Modal */}
      <AIChatModal
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
      />

      {/* Deployment Info Modal (Development only) */}
      {showDeploymentInfo && process.env.NODE_ENV === 'development' && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowDeploymentInfo(false)} />
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Deployment Info</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Current URL:</strong> {deploymentInfo.currentUrl}</div>
                  <div><strong>Pathname:</strong> {deploymentInfo.pathname}</div>
                  <div><strong>Base Path:</strong> {deploymentInfo.detectedBasePath || '(root)'}</div>
                  <div><strong>API Path:</strong> {deploymentInfo.apiBasePath}</div>
                  <div><strong>Is Subdirectory:</strong> {deploymentInfo.isSubdirectory ? 'Yes' : 'No'}</div>
                </div>
                <button
                  onClick={() => setShowDeploymentInfo(false)}
                  className="mt-4 w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay for closing dropdowns */}
      {(showNotifications || showProfile) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}
    </>
  );
};