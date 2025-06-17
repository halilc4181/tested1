import React, { useState } from 'react';
import { Plus, Search, Calendar as CalendarIcon, Clock, User, Edit, Trash2, CheckCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { AddAppointmentModal } from '../components/Appointments/AddAppointmentModal';

export const Appointments: React.FC = () => {
  const { appointments, updateAppointment, deleteAppointment } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    const matchesDate = !filterDate || appointment.date === filterDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setIsAddModalOpen(true);
  };

  const handleDelete = (appointmentId: string) => {
    if (confirm('Bu randevuyu silmek istediğinizden emin misiniz?')) {
      deleteAppointment(appointmentId);
    }
  };

  const handleComplete = (appointment: any) => {
    updateAppointment(appointment.id, { status: 'completed' });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Randevular</h1>
          <p className="mt-2 text-sm text-gray-600">
            Hasta randevularınızı yönetin ve takip edin ({appointments.length} randevu)
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Randevu
        </button>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Randevu ara (hasta, tür, notlar)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="flex-1 sm:flex-none border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 sm:flex-none border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="confirmed">Onaylandı</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal Edildi</option>
                <option value="pending">Bekliyor</option>
              </select>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {sortedAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || filterStatus !== 'all' || filterDate ? 'Randevu bulunamadı' : 'Henüz randevu yok'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterStatus !== 'all' || filterDate
                  ? 'Arama kriterlerinize uygun randevu bulunmamaktadır.'
                  : 'İlk randevunuzu oluşturmak için "Yeni Randevu" butonuna tıklayın.'
                }
              </p>
            </div>
          ) : (
            sortedAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {appointment.patientName}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full w-fit ${getStatusColor(appointment.status)}`}>
                          {getStatusText(appointment.status)}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {new Date(appointment.date).toLocaleDateString('tr-TR')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {appointment.time}
                        </div>
                        <span>{appointment.type}</span>
                        <span>{appointment.duration} dakika</span>
                      </div>
                      {appointment.notes && (
                        <p className="mt-1 text-sm text-gray-600">{appointment.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center sm:justify-end gap-2">
                    {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                      <button
                        onClick={() => handleComplete(appointment)}
                        className="inline-flex items-center px-3 py-1 text-sm text-emerald-600 hover:text-emerald-700"
                        title="Tamamla"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                      title="Düzenle"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(appointment.id)}
                      className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AddAppointmentModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAppointment(null);
        }}
        editingAppointment={editingAppointment}
      />
    </div>
  );
};