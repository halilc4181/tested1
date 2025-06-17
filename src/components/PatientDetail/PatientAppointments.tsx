import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface PatientAppointmentsProps {
  patientId: string;
}

export const PatientAppointments: React.FC<PatientAppointmentsProps> = ({ patientId }) => {
  const { getAppointmentsByPatientId, getPatientById, addAppointment, updateAppointment, deleteAppointment, addWeightRecord, settings } = useData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    type: '',
    notes: '',
    duration: settings.defaultAppointmentDuration,
    weight: '',
    weightNotes: ''
  });

  const appointments = getAppointmentsByPatientId(patientId);
  const patient = getPatientById(patientId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'confirmed':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'confirmed':
        return 'Onaylandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Bekliyor';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patient) return;

    const appointmentData = {
      patientId,
      patientName: `${patient.name} ${patient.surname}`,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      notes: formData.notes,
      duration: formData.duration,
      status: 'confirmed' as const,
    };

    if (editingAppointment) {
      updateAppointment(editingAppointment.id, appointmentData);
      
      // If marking as completed and weight is provided, add weight record
      if (formData.weight && parseFloat(formData.weight) > 0) {
        addWeightRecord(patientId, parseFloat(formData.weight), formData.date, formData.weightNotes);
      }
    } else {
      addAppointment(appointmentData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: '',
      time: '',
      type: '',
      notes: '',
      duration: settings.defaultAppointmentDuration,
      weight: '',
      weightNotes: ''
    });
    setIsAddModalOpen(false);
    setEditingAppointment(null);
  };

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setFormData({
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      notes: appointment.notes,
      duration: appointment.duration,
      weight: '',
      weightNotes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleComplete = (appointment: any) => {
    updateAppointment(appointment.id, { status: 'completed' });
  };

  const handleDelete = (appointmentId: string) => {
    if (confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) {
      deleteAppointment(appointmentId);
    }
  };

  const sortedAppointments = appointments.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Randevular</h3>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <Plus className="h-4 w-4 mr-1" />
          Yeni Randevu
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {sortedAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Henüz randevu bulunmuyor</p>
          </div>
        ) : (
          sortedAppointments.map((appointment) => (
            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(appointment.date).toLocaleDateString('tr-TR')}
                  </span>
                  <span className="text-sm text-gray-500">{appointment.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(appointment.status)}
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
              </div>
              
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-700">{appointment.type}</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{appointment.notes}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{appointment.duration} dakika</span>
                <div className="flex space-x-1">
                  {appointment.status !== 'completed' && (
                    <button
                      onClick={() => handleComplete(appointment)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded"
                    >
                      Tamamla
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(appointment)}
                    className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(appointment.id)}
                    className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={resetForm} />
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingAppointment ? 'Randevu Düzenle' : 'Yeni Randevu'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tarih *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Saat *
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Randevu Türü *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Seçiniz</option>
                      <option value="İlk Görüşme">İlk Görüşme</option>
                      <option value="Kontrol">Kontrol</option>
                      <option value="Diyet Planı">Diyet Planı</option>
                      <option value="Kilo Kontrolü">Kilo Kontrolü</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Süre (dakika)
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value={15}>15 dakika</option>
                      <option value={20}>20 dakika</option>
                      <option value={30}>30 dakika</option>
                      <option value={45}>45 dakika</option>
                      <option value={60}>60 dakika</option>
                      <option value={90}>90 dakika</option>
                      <option value={120}>120 dakika</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Varsayılan: {settings.defaultAppointmentDuration} dakika
                    </p>
                  </div>

                  {editingAppointment && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kilo (kg) - Tamamlandığında eklenecek
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="20"
                          max="300"
                          value={formData.weight}
                          onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kilo Notu
                        </label>
                        <input
                          type="text"
                          value={formData.weightNotes}
                          onChange={(e) => setFormData(prev => ({ ...prev, weightNotes: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Kilo kaydı ile ilgili not"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notlar
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Randevu notları"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                    >
                      {editingAppointment ? 'Güncelle' : 'Oluştur'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};