import React, { useState } from 'react';
import { Save, User, Clock, Camera, Phone, Mail, MapPin, GraduationCap, Award, FileText, Shield, Download, Upload, RefreshCw, AlertTriangle } from 'lucide-react';
import { useData } from '../contexts/DataContext';

export const Settings: React.FC = () => {
  const { settings, updateSettings, backupSettings, updateBackupSettings, createBackup, restoreBackup } = useData();
  const [formData, setFormData] = useState(settings);
  const [backupFormData, setBackupFormData] = useState(backupSettings);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBackupInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setBackupFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseInt(value) : value 
    }));
  };

  const handleWorkingHoursChange = (field: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value
      }
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoUrl = event.target?.result as string;
        setFormData(prev => ({ ...prev, photo: photoUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      updateSettings(formData);
      updateBackupSettings(backupFormData);
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('Ayarlar başarıyla kaydedildi!');
    } catch (error) {
      alert('Ayarlar kaydedilirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      createBackup();
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      alert('Yedekleme sırasında bir hata oluştu.');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);
          if (confirm('Bu işlem mevcut tüm verileri değiştirecektir. Devam etmek istediğinizden emin misiniz?')) {
            restoreBackup(backupData);
          }
        } catch (error) {
          alert('Geçersiz yedek dosyası.');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  const getBackupStatusColor = () => {
    if (!backupSettings.lastBackupDate) return 'text-red-600';
    
    const lastBackup = new Date(backupSettings.lastBackupDate);
    const now = new Date();
    const daysSinceLastBackup = Math.floor((now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastBackup <= backupSettings.backupFrequency) return 'text-emerald-600';
    if (daysSinceLastBackup <= backupSettings.backupFrequency * 2) return 'text-amber-600';
    return 'text-red-600';
  };

  const tabs = [
    { id: 'profile', name: 'Profil Bilgileri', icon: User },
    { id: 'appointment', name: 'Randevu Ayarları', icon: Clock },
    { id: 'backup', name: 'Yedekleme Ayarları', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
        <p className="mt-2 text-sm text-gray-600">
          Profil bilgilerinizi ve sistem ayarlarınızı yönetin
        </p>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto px-4 sm:px-6" aria-label="Tabs">
            <div className="flex space-x-8 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative mx-auto sm:mx-0">
                  <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                    {formData.photo ? (
                      <img src={formData.photo} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-emerald-600" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-emerald-600 rounded-full p-2 cursor-pointer hover:bg-emerald-700 transition-colors">
                    <Camera className="h-4 w-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-medium text-gray-900">Profil Fotoğrafı</h3>
                  <p className="text-sm text-gray-500">JPG, PNG formatında maksimum 5MB</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Award className="inline h-4 w-4 mr-1" />
                    Unvan
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Örn: Diyetisyen, Uzman Diyetisyen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    E-posta *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Lisans Numarası
                  </label>
                  <input
                    type="text"
                    name="license"
                    value={formData.license}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Örn: DYT-12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uzmanlık Alanı
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Örn: Klinik Beslenme, Spor Beslenmesi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deneyim
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Örn: 8 yıl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Adres
                </label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Çalışma adresiniz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <GraduationCap className="inline h-4 w-4 mr-1" />
                  Eğitim
                </label>
                <textarea
                  name="education"
                  rows={2}
                  value={formData.education}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Eğitim geçmişiniz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hakkımda
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Kendiniz hakkında kısa bir açıklama"
                />
              </div>
            </div>
          )}

          {activeTab === 'appointment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Randevu Ayarları</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Yeni randevu oluştururken kullanılacak varsayılan değerleri belirleyin.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Varsayılan Randevu Süresi (dakika)
                  </label>
                  <select
                    name="defaultAppointmentDuration"
                    value={formData.defaultAppointmentDuration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value={15}>15 dakika</option>
                    <option value={20}>20 dakika</option>
                    <option value={30}>30 dakika</option>
                    <option value={45}>45 dakika</option>
                    <option value={60}>60 dakika</option>
                    <option value={90}>90 dakika</option>
                    <option value={120}>120 dakika</option>
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Yeni randevu oluştururken otomatik olarak bu süre seçilecektir.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Çalışma Saatleri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Başlangıç Saati
                    </label>
                    <input
                      type="time"
                      value={formData.workingHours.start}
                      onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bitiş Saati
                    </label>
                    <input
                      type="time"
                      value={formData.workingHours.end}
                      onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Bu bilgiler randevu planlama sırasında referans olarak kullanılacaktır.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Bilgi</h4>
                <p className="text-sm text-blue-700">
                  Bu ayarlar sadece yeni oluşturulan randevular için geçerlidir. 
                  Mevcut randevular etkilenmez ve her randevu için ayrı ayrı düzenleme yapabilirsiniz.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Yedekleme Ayarları</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Verilerinizin güvenliği için otomatik yedekleme ayarlarını yapılandırın.
                </p>
              </div>

              {/* Backup Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Yedekleme Durumu</h4>
                    <p className={`text-sm ${getBackupStatusColor()}`}>
                      {backupSettings.lastBackupDate 
                        ? `Son yedekleme: ${new Date(backupSettings.lastBackupDate).toLocaleDateString('tr-TR')}`
                        : 'Henüz yedekleme yapılmamış'
                      }
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleCreateBackup}
                      disabled={isCreatingBackup}
                      className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      {isCreatingBackup ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      {isCreatingBackup ? 'Yedekleniyor...' : 'Manuel Yedekle'}
                    </button>
                    <button
                      onClick={handleRestoreBackup}
                      className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Geri Yükle
                    </button>
                  </div>
                </div>
              </div>

              {/* Auto Backup Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="autoBackupEnabled"
                      checked={backupFormData.autoBackupEnabled}
                      onChange={handleBackupInputChange}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Otomatik Yedekleme
                    </span>
                  </label>
                  <p className="mt-1 text-sm text-gray-500">
                    Belirlenen aralıklarla otomatik yedekleme yapılır
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yedekleme Sıklığı (gün)
                  </label>
                  <select
                    name="backupFrequency"
                    value={backupFormData.backupFrequency}
                    onChange={handleBackupInputChange}
                    disabled={!backupFormData.autoBackupEnabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
                  >
                    <option value={1}>Her gün</option>
                    <option value={3}>3 günde bir</option>
                    <option value={7}>Haftada bir</option>
                    <option value={14}>2 haftada bir</option>
                    <option value={30}>Ayda bir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maksimum Yedek Sayısı
                  </label>
                  <input
                    type="number"
                    name="maxBackups"
                    min="1"
                    max="50"
                    value={backupFormData.maxBackups}
                    onChange={handleBackupInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Eski yedekler otomatik silinir
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yedekleme Konumu
                  </label>
                  <select
                    name="backupLocation"
                    value={backupFormData.backupLocation}
                    onChange={handleBackupInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="local">Yerel (İndirme)</option>
                    <option value="cloud" disabled>Bulut (Yakında)</option>
                  </select>
                </div>
              </div>

              {/* Advanced Options */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Gelişmiş Seçenekler</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="includeImages"
                      checked={backupFormData.includeImages}
                      onChange={handleBackupInputChange}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Profil fotoğraflarını dahil et
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="compressionEnabled"
                      checked={backupFormData.compressionEnabled}
                      onChange={handleBackupInputChange}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Sıkıştırma kullan (daha küçük dosya boyutu)
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="encryptionEnabled"
                      checked={backupFormData.encryptionEnabled}
                      onChange={handleBackupInputChange}
                      disabled
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 disabled:opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Şifreleme kullan (Yakında)
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notificationEnabled"
                      checked={backupFormData.notificationEnabled}
                      onChange={handleBackupInputChange}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Yedekleme tamamlandığında bildirim göster
                    </span>
                  </label>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-amber-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">Önemli Uyarı</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Yedekleme dosyalarınızı güvenli bir yerde saklayın. Sistem arızası durumunda 
                      verilerinizi geri yüklemek için bu dosyalara ihtiyacınız olacaktır.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="border-t border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};