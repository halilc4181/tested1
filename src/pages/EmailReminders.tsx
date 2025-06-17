import React, { useState, useEffect } from 'react';
import { Mail, Send, Clock, CheckCircle, XCircle, Plus, Search, Filter, Calendar, User, AlertCircle, Settings } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { EmailReminder } from '../types';

export const EmailReminders: React.FC = () => {
  const { patients, appointments, settings } = useData();
  const [emailReminders, setEmailReminders] = useState<EmailReminder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isManualEmailModalOpen, setIsManualEmailModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [emailForm, setEmailForm] = useState({
    subject: '',
    content: '',
    patientId: '',
  });

  // Load email reminders from localStorage
  useEffect(() => {
    const savedReminders = localStorage.getItem('emailReminders');
    if (savedReminders) {
      setEmailReminders(JSON.parse(savedReminders));
    }
  }, []);

  // Save email reminders to localStorage
  useEffect(() => {
    localStorage.setItem('emailReminders', JSON.stringify(emailReminders));
  }, [emailReminders]);

  // Auto-generate appointment reminders
  useEffect(() => {
    if (settings.enableAppointmentReminders && settings.autoSendReminders) {
      generateAppointmentReminders();
    }
  }, [appointments, settings]);

  const generateAppointmentReminders = () => {
    const today = new Date();
    const reminderDays = settings.reminderDaysBefore || 1;
    
    appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date);
      const reminderDate = new Date(appointmentDate);
      reminderDate.setDate(appointmentDate.getDate() - reminderDays);
      
      // Check if reminder should be sent today
      if (reminderDate.toDateString() === today.toDateString()) {
        const patient = patients.find(p => p.id === appointment.patientId);
        if (patient && patient.email) {
          // Check if reminder already exists
          const existingReminder = emailReminders.find(
            r => r.appointmentId === appointment.id && r.emailType === 'appointment_reminder'
          );
          
          if (!existingReminder) {
            const newReminder: EmailReminder = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              appointmentId: appointment.id,
              patientId: patient.id,
              patientName: `${patient.name} ${patient.surname}`,
              patientEmail: patient.email,
              appointmentDate: appointment.date,
              appointmentTime: appointment.time,
              appointmentType: appointment.type,
              reminderDate: today.toISOString().split('T')[0],
              status: 'pending',
              emailType: 'appointment_reminder',
              subject: `Randevu Hatırlatması - ${new Date(appointment.date).toLocaleDateString('tr-TR')}`,
              content: generateReminderContent(patient, appointment),
            };
            
            setEmailReminders(prev => [...prev, newReminder]);
          }
        }
      }
    });
  };

  const generateReminderContent = (patient: any, appointment: any) => {
    return `Sayın ${patient.name} ${patient.surname},

${new Date(appointment.date).toLocaleDateString('tr-TR')} tarihinde saat ${appointment.time}'da ${appointment.type} randevunuz bulunmaktadır.

Randevu Detayları:
- Tarih: ${new Date(appointment.date).toLocaleDateString('tr-TR')}
- Saat: ${appointment.time}
- Tür: ${appointment.type}
- Süre: ${appointment.duration} dakika

Lütfen randevunuza zamanında gelmeyi unutmayınız. Herhangi bir değişiklik gerektiğinde lütfen bizimle iletişime geçiniz.

İyi günler,
${settings.name}
${settings.title}
${settings.phone}`;
  };

  const sendEmail = async (reminderId: string) => {
    const reminder = emailReminders.find(r => r.id === reminderId);
    if (!reminder) return;

    // Check if SMTP settings are configured
    if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
      alert('E-posta gönderebilmek için önce SMTP ayarlarını yapılandırmanız gerekiyor.');
      setIsSettingsModalOpen(true);
      return;
    }

    try {
      // Simulate email sending (in real app, this would be an API call)
      setEmailReminders(prev => prev.map(r => 
        r.id === reminderId 
          ? { ...r, status: 'sent' as const, sentDate: new Date().toISOString() }
          : r
      ));
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('E-posta başarıyla gönderildi!');
    } catch (error) {
      setEmailReminders(prev => prev.map(r => 
        r.id === reminderId 
          ? { ...r, status: 'failed' as const, errorMessage: 'E-posta gönderim hatası' }
          : r
      ));
      alert('E-posta gönderilirken bir hata oluştu.');
    }
  };

  const sendManualEmail = async () => {
    const patient = patients.find(p => p.id === emailForm.patientId);
    if (!patient || !patient.email) {
      alert('Lütfen geçerli bir hasta seçiniz ve e-posta adresinin olduğundan emin olunuz.');
      return;
    }

    if (!emailForm.subject || !emailForm.content) {
      alert('Lütfen konu ve içerik alanlarını doldurunuz.');
      return;
    }

    const newReminder: EmailReminder = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      appointmentId: '',
      patientId: patient.id,
      patientName: `${patient.name} ${patient.surname}`,
      patientEmail: patient.email,
      appointmentDate: '',
      appointmentTime: '',
      appointmentType: '',
      reminderDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      emailType: 'manual_email',
      subject: emailForm.subject,
      content: emailForm.content,
    };

    setEmailReminders(prev => [...prev, newReminder]);
    
    // Try to send immediately
    await sendEmail(newReminder.id);
    
    // Reset form
    setEmailForm({ subject: '', content: '', patientId: '' });
    setIsManualEmailModalOpen(false);
  };

  const filteredReminders = emailReminders.filter(reminder => {
    const matchesSearch = 
      reminder.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reminder.patientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || reminder.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Gönderildi';
      case 'failed':
        return 'Başarısız';
      default:
        return 'Bekliyor';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-emerald-100 text-emerald-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">E-posta Hatırlatıcıları</h1>
          <p className="mt-2 text-sm text-gray-600">
            Randevu hatırlatmaları ve manuel e-posta gönderimi ({emailReminders.length} e-posta)
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            E-posta Ayarları
          </button>
          <button
            onClick={() => setIsManualEmailModalOpen(true)}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Manuel E-posta Gönder
          </button>
        </div>
      </div>

      {/* SMTP Configuration Warning */}
      {(!settings.smtpHost || !settings.smtpUser) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">E-posta Ayarları Gerekli</h4>
              <p className="text-sm text-amber-700 mt-1">
                E-posta gönderebilmek için SMTP ayarlarını yapılandırmanız gerekiyor. 
                <button 
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="ml-1 underline hover:no-underline"
                >
                  Ayarları yapılandır
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="E-posta ara (hasta, konu, e-posta adresi)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Bekliyor</option>
                <option value="sent">Gönderildi</option>
                <option value="failed">Başarısız</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredReminders.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || filterStatus !== 'all' ? 'E-posta bulunamadı' : 'Henüz e-posta yok'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'all'
                  ? 'Arama kriterlerinize uygun e-posta bulunmamaktadır.'
                  : 'İlk e-postanızı göndermek için "Manuel E-posta Gönder" butonuna tıklayın.'
                }
              </p>
            </div>
          ) : (
            filteredReminders
              .sort((a, b) => new Date(b.reminderDate).getTime() - new Date(a.reminderDate).getTime())
              .map((reminder) => (
                <div key={reminder.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Mail className="h-6 w-6 text-emerald-600" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {reminder.subject}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reminder.status)}`}>
                              {getStatusText(reminder.status)}
                            </span>
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {reminder.emailType === 'appointment_reminder' ? 'Randevu Hatırlatması' : 'Manuel E-posta'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {reminder.patientName}
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {reminder.patientEmail}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(reminder.reminderDate).toLocaleDateString('tr-TR')}
                          </div>
                          {reminder.appointmentDate && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Randevu: {new Date(reminder.appointmentDate).toLocaleDateString('tr-TR')} {reminder.appointmentTime}
                            </div>
                          )}
                        </div>
                        {reminder.sentDate && (
                          <p className="mt-1 text-xs text-emerald-600">
                            Gönderilme: {new Date(reminder.sentDate).toLocaleString('tr-TR')}
                          </p>
                        )}
                        {reminder.errorMessage && (
                          <p className="mt-1 text-xs text-red-600">
                            Hata: {reminder.errorMessage}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-end gap-2">
                      {reminder.status === 'pending' && (
                        <button
                          onClick={() => sendEmail(reminder.id)}
                          className="inline-flex items-center px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700"
                          title="E-posta Gönder"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Gönder
                        </button>
                      )}
                      {getStatusIcon(reminder.status)}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Manual Email Modal */}
      {isManualEmailModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsManualEmailModalOpen(false)} />
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Manuel E-posta Gönder</h2>
                <button
                  onClick={() => setIsManualEmailModalOpen(false)}
                  className="rounded-md p-2 hover:bg-gray-100 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hasta Seçin *
                  </label>
                  <select
                    value={emailForm.patientId}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, patientId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Hasta seçiniz</option>
                    {patients.filter(p => p.email && p.status === 'active').map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} {patient.surname} ({patient.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konu *
                  </label>
                  <input
                    type="text"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="E-posta konusu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İçerik *
                  </label>
                  <textarea
                    rows={8}
                    value={emailForm.content}
                    onChange={(e) => setEmailForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="E-posta içeriği"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setIsManualEmailModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={sendManualEmail}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    E-posta Gönder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Settings Modal */}
      {isSettingsModalOpen && (
        <EmailSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}
    </div>
  );
};

// Email Settings Modal Component
const EmailSettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useData();
  const [formData, setFormData] = useState({
    smtpHost: settings.smtpHost || '',
    smtpPort: settings.smtpPort || 587,
    smtpUser: settings.smtpUser || '',
    smtpPassword: settings.smtpPassword || '',
    smtpSecure: settings.smtpSecure || false,
    emailFromName: settings.emailFromName || settings.name,
    emailFromAddress: settings.emailFromAddress || settings.email,
    enableAppointmentReminders: settings.enableAppointmentReminders || false,
    reminderDaysBefore: settings.reminderDaysBefore || 1,
    reminderTime: settings.reminderTime || '09:00',
    autoSendReminders: settings.autoSendReminders || false,
  });

  const handleSave = () => {
    updateSettings(formData);
    onClose();
    alert('E-posta ayarları başarıyla kaydedildi!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">E-posta Ayarları</h2>
            <button
              onClick={onClose}
              className="rounded-md p-2 hover:bg-gray-100 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">SMTP Ayarları</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Sunucu *
                  </label>
                  <input
                    type="text"
                    value={formData.smtpHost}
                    onChange={(e) => setFormData(prev => ({ ...prev, smtpHost: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Port *
                  </label>
                  <input
                    type="number"
                    value={formData.smtpPort}
                    onChange={(e) => setFormData(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kullanıcı Adı *
                  </label>
                  <input
                    type="email"
                    value={formData.smtpUser}
                    onChange={(e) => setFormData(prev => ({ ...prev, smtpUser: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="email@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre *
                  </label>
                  <input
                    type="password"
                    value={formData.smtpPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, smtpPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Uygulama şifresi"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.smtpSecure}
                      onChange={(e) => setFormData(prev => ({ ...prev, smtpSecure: e.target.checked }))}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">SSL/TLS Kullan</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Gönderen Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gönderen Adı
                  </label>
                  <input
                    type="text"
                    value={formData.emailFromName}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailFromName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gönderen E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.emailFromAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, emailFromAddress: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Randevu Hatırlatma Ayarları</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.enableAppointmentReminders}
                    onChange={(e) => setFormData(prev => ({ ...prev, enableAppointmentReminders: e.target.checked }))}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Randevu hatırlatmalarını etkinleştir</span>
                </label>

                {formData.enableAppointmentReminders && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kaç gün önce
                      </label>
                      <select
                        value={formData.reminderDaysBefore}
                        onChange={(e) => setFormData(prev => ({ ...prev, reminderDaysBefore: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value={1}>1 gün önce</option>
                        <option value={2}>2 gün önce</option>
                        <option value={3}>3 gün önce</option>
                        <option value={7}>1 hafta önce</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gönderim saati
                      </label>
                      <input
                        type="time"
                        value={formData.reminderTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, reminderTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.autoSendReminders}
                          onChange={(e) => setFormData(prev => ({ ...prev, autoSendReminders: e.target.checked }))}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Otomatik gönder</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Gmail Kullanıcıları İçin</h4>
              <p className="text-sm text-blue-700">
                Gmail kullanıyorsanız, normal şifreniz yerine "Uygulama Şifresi" oluşturmanız gerekebilir. 
                Google hesap ayarlarından 2 faktörlü doğrulamayı etkinleştirip uygulama şifresi oluşturabilirsiniz.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
              >
                Ayarları Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};