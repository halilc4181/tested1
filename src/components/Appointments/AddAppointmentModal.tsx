import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAppointment?: any;
}

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ 
  isOpen, 
  onClose, 
  editingAppointment 
}) => {
  const { patients, addAppointment, updateAppointment } = useData();
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    time: '',
    type: '',
    notes: '',
    duration: 30,
    status: 'confirmed' as const,
  });

  useEffect(() => {
    if (editingAppointment) {
      setFormData({
        patientId: editingAppointment.patientId,
        date: editingAppointment.date,
        time: editingAppointment.time,
        type: editingAppointment.type,
        notes: editingAppointment.notes,
        duration: editingAppointment.duration,
        status: editingAppointment.status,
      });
    } else {
      setFormData({
        patientId: '',
        date: '',
        time: '',
        type: '',
        notes: '',
        duration: 30,
        status: 'confirmed',
      });
    }
  }, [editingAppointment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedPatient = patients.find(p => p.id === formData.patientId);
    if (!selectedPatient) {
      alert('Lütfen bir hasta seçiniz');
      return;
    }

    const appointmentData = {
      patientId: formData.patientId,
      patientName: `${selectedPatient.name} ${selectedPatient.surname}`,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      notes: formData.notes,
      duration: formData.duration,
      status: formData.status,
    };

    if (editingAppointment) {
      updateAppointment(editingAppointment.id, appointmentData);
    } else {
      addAppointment(appointmentData);
    }

    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'duration' ? parseInt(value) : value 
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingAppointment ? 'Randevu Düzenle' : 'Yeni Randevu'}
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta *
              </label>
              <select
                name="patientId"
                required
                value={formData.patientId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Hasta seçiniz</option>
                {patients.filter(p => p.status === 'active').map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} {patient.surname}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarih *
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saat *
                </label>
                <input
                  type="time"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Randevu Türü *
              </label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Seçiniz</option>
                <option value="İlk Görüşme">İlk Görüşme</option>
                <option value="Kontrol">Kontrol</option>
                <option value="Diyet Planı">Diyet Planı</option>
                <option value="Kilo Kontrolü">Kilo Kontrolü</option>
                <option value="Beslenme Danışmanlığı">Beslenme Danışmanlığı</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Süre (dakika)
                </label>
                <input
                  type="number"
                  name="duration"
                  min="15"
                  max="120"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {editingAppointment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durum
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="pending">Bekliyor</option>
                    <option value="confirmed">Onaylandı</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="cancelled">İptal Edildi</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notlar
              </label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Randevu ile ilgili notlar"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                {editingAppointment ? 'Güncelle' : 'Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};